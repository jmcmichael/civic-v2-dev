import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute } from '@angular/router'
import { InternalRefetchQueryDescriptor } from '@apollo/client'
import { CvcParticipantListModule } from '@app/components/shared/participant-list/participant-list.module'
import {
  Maybe,
  ModeratedInput,
  RevisionStatus,
} from '@app/generated/civic.apollo.types'
import { CvcEntityStreamComponent } from '@app/streams/entity-stream.component'
import { CvcStreamSidebarDirective } from '@app/streams/stream-slots'
import { NzAlertModule } from 'ng-zorro-antd/alert'
import { NzAvatarModule } from 'ng-zorro-antd/avatar'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { UpperCasePipe } from '@angular/common'
import { CvcRevisionModerationBar } from './moderation/revision-moderation-bar.component'
import { RevisionRefetchRegistry } from './revision-refetch.registry'
import { RevisionStreamState } from './revision-stream-state'
import { revisionStreamConfig } from './revision-stream.config'
import { RevisionStreamGQL } from './revision-stream.query.gql.generated'
import {
  RevisionStreamConnection,
  RevisionStreamFilters,
  RevisionStreamNode,
  SelectableFieldName,
  SelectableRevisionStatus,
  UniqueUsers,
  revisionStreamDefaultFilters,
} from './revision-stream.types'

/**
 * The revision stream facade: `cvc-entity-stream` configured for one
 * moderated subject's revisions, with the moderation bar in the header
 * extra, result banners above the list, and the four facet panels in the
 * sidebar.
 *
 * Behavior rulings carried here (D-list, 2026-08-26):
 *
 * - D1 — selection survives Load More and post-moderation refresh; it
 *   clears when any filter changes (changing what you look at resets
 *   what you would act on).
 * - D2 — Show Group and the `?revisionSetId=` deep link both show the
 *   whole set: engaging the group filter clears the status filter, and
 *   the status panel re-seeds so the sidebar reflects it.
 * - D4 — an entity with no revisions at all shows a quiet empty card
 *   with no filter/moderation chrome; a filtered-empty result keeps the
 *   chrome. Loading renders as loading.
 */
@Component({
  selector: 'cvc-revision-stream',
  templateUrl: './revision-stream.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RevisionStreamState],
  imports: [
    UpperCasePipe,
    NzAlertModule,
    NzAvatarModule,
    NzGridModule,
    NzIconModule,
    NzTagModule,
    CvcEntityStreamComponent,
    CvcStreamSidebarDirective,
    CvcParticipantListModule,
    CvcRevisionModerationBar,
  ],
})
export class CvcRevisionStream {
  /** the moderated subject whose revisions stream here */
  readonly cvcModerated = input.required<ModeratedInput>()
  readonly cvcTitle = input<string>('Revisions')
  /**
   * Extra post-moderation refetches, merged with the subject's registry
   * fan-out. Coordinate tabs use this for the variant page documents and
   * the tab-badge counts, which key on a variantId only the page knows.
   */
  readonly cvcModerationRefetch = input<InternalRefetchQueryDescriptor[]>([])

  private readonly gql = inject(RevisionStreamGQL)
  private readonly route = inject(ActivatedRoute)
  private readonly refetchRegistry = inject(RevisionRefetchRegistry)
  protected readonly state = inject(RevisionStreamState)

  private readonly stream = viewChild<
    CvcEntityStreamComponent<RevisionStreamNode>
  >(CvcEntityStreamComponent)

  /** the stream's selection model, mirrored into the moderation state */
  protected readonly selectedIds = signal<number[]>([])

  protected readonly filtersState = signal<RevisionStreamFilters>(
    revisionStreamDefaultFilters
  )

  /** remounts the status facet so a programmatic status change re-seeds it */
  protected readonly statusEpoch = signal(0)

  protected readonly statuses: SelectableRevisionStatus[] = [
    { id: 4, displayName: 'New', value: RevisionStatus.New },
    { id: 1, displayName: 'Accepted', value: RevisionStatus.Accepted },
    { id: 2, displayName: 'Rejected', value: RevisionStatus.Rejected },
    { id: 3, displayName: 'Superseded', value: RevisionStatus.Superseded },
  ]

  protected readonly currentStatusOption = computed(() =>
    this.statuses.find((s) => s.value === this.filtersState().status)
  )

  protected readonly spec = computed(() => {
    const viewer = this.state.viewer()
    return revisionStreamConfig({
      query: this.gql,
      title: this.cvcTitle(),
      scope: { subject: this.cvcModerated() },
      viewer: {
        signedIn: viewer?.signedIn ?? false,
        isCurator: viewer?.isCurator ?? false,
        id: viewer?.user?.id,
      },
      unfilteredCount: () => this.unfilteredCount(),
    })
  })

  protected readonly filterVars = computed<Record<string, unknown>>(() => {
    const filters = this.filtersState()
    return {
      status: filters.status ?? undefined,
      fieldName: filters.fieldName ?? undefined,
      originatingUserId: filters.originatingUserId ?? undefined,
      resolvingUserId: filters.resolvingUserId ?? undefined,
      revisionSetId: filters.revisionSetId ?? undefined,
    }
  })

  private readonly connection = computed(
    () =>
      this.stream()?.connection() as unknown as Maybe<RevisionStreamConnection>
  )

  protected readonly revisors = computed<UniqueUsers[]>(
    () => this.connection()?.uniqueRevisors ?? []
  )
  protected readonly resolvers = computed<UniqueUsers[]>(
    () => this.connection()?.uniqueResolvers ?? []
  )
  protected readonly fields = computed<SelectableFieldName[]>(() =>
    (this.connection()?.revisedFieldNames ?? []).map((field, id) => ({
      ...field,
      id,
    }))
  )

  protected readonly unfilteredCount = computed(
    () => this.connection()?.unfilteredCountForSubject
  )

  /** D4: exactly zero — a nullish count is loading or unavailable, not empty */
  protected readonly noRevisions = computed(() => this.unfilteredCount() === 0)

  protected readonly initialLoading = computed(
    () => !this.connection() && (this.stream()?.loading() ?? true)
  )

  /** filter/moderation chrome renders once data proves there is work to filter */
  protected readonly chromeVisible = computed(
    () => !!this.connection() && !this.noRevisions()
  )

  constructor() {
    this.state.onSelectGroup = (revisionSetId) =>
      this.applyGroupFilter(revisionSetId)
    this.state.onModerated = () => {
      this.selectedIds.set([])
      this.stream()?.refresh()
    }

    effect(() => this.state.selectedIds.set(this.selectedIds()))
    effect(() => {
      this.state.refetchQueries = [
        ...this.refetchRegistry.queriesFor(this.cvcModerated()),
        ...this.cvcModerationRefetch(),
      ]
    })

    // D1: any filter change clears the selection; paging and refresh do not
    let lastFilters: Maybe<string>
    effect(() => {
      const key = JSON.stringify(this.filterVars())
      if (lastFilters !== undefined && key !== lastFilters) {
        untracked(() => this.selectedIds.set([]))
      }
      lastFilters = key
    })

    // D2: a ?revisionSetId= deep link engages the group filter; the param
    // disappearing clears it (in-app navigation off a shared link). Other
    // query-param traffic leaves user filter state alone.
    const queryParams = toSignal(this.route.queryParams)
    effect(() => {
      const raw = queryParams()?.['revisionSetId']
      untracked(() => {
        if (raw != null) {
          this.applyGroupFilter(+raw)
        } else if (this.filtersState().revisionSetId !== undefined) {
          this.clearGroupFilter()
        }
      })
    })
  }

  /**
   * D2: viewing a set means the whole set — the status filter clears so
   * resolved members show, and the status panel re-seeds to match.
   */
  protected applyGroupFilter(revisionSetId: number): void {
    this.patchFilters({ revisionSetId, status: undefined })
    this.statusEpoch.update((epoch) => epoch + 1)
  }

  /** closing the Group tag drops the set filter; other facets stay put */
  protected clearGroupFilter(): void {
    this.patchFilters({ revisionSetId: undefined })
  }

  protected onStatusSelected(status: Maybe<SelectableRevisionStatus>): void {
    this.patchFilters({ status: status?.value })
  }

  protected onRevisorSelected(user: Maybe<UniqueUsers>): void {
    this.patchFilters({ originatingUserId: user?.id })
  }

  protected onResolverSelected(user: Maybe<UniqueUsers>): void {
    this.patchFilters({ resolvingUserId: user?.id })
  }

  protected onFieldSelected(field: Maybe<SelectableFieldName>): void {
    this.patchFilters({ fieldName: field?.name })
  }

  private patchFilters(patch: Partial<RevisionStreamFilters>): void {
    this.filtersState.update((filters) => ({ ...filters, ...patch }))
  }
}

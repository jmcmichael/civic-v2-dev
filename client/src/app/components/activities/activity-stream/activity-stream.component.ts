import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  viewChild,
} from '@angular/core'
import { CvcEntityStreamComponent } from '@app/streams/entity-stream.component'
import { CvcStreamSidebarDirective } from '@app/streams/stream-slots'
import { ActivityStreamState } from './activity-stream-state'
import { CvcActivityStreamFilters } from './filters/activity-stream-filters.component'
import { CvcActivityStreamSettings } from './settings/activity-stream-settings.component'
import {
  activityStreamConfig,
  streamDefaultFilters,
  streamDefaultScope,
  streamDefaultSettings,
  streamFilterOptionDefaults,
} from './activity-stream.config'
import {
  connectionToFilterOptions,
  scopeToVariables,
  streamFilterVariables,
} from './activity-stream.functions'
import { ActivityStreamGQL } from './activity-stream.query.gql.generated'
import {
  ActivityStreamConnection,
  ActivityStreamFilterOptions,
  ActivityStreamFilters,
  ActivityStreamNode,
  ActivityStreamScope,
  ActivityStreamSettings,
} from './activity-stream.types'

/**
 * The activity stream facade: `cvc-entity-stream` configured for
 * activities. Hosts scope it (`cvcScope`), seed its settings and filters,
 * and size it (`cvcHeight`, defaulting to viewport-fit `'auto'`); user
 * edits from the panels layer over the host-seeded values, so a host
 * pushing new inputs re-seeds the panels.
 */
@Component({
  selector: 'cvc-activity-stream',
  templateUrl: './activity-stream.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ActivityStreamState],
  imports: [
    CvcEntityStreamComponent,
    CvcStreamSidebarDirective,
    CvcActivityStreamFilters,
    CvcActivityStreamSettings,
  ],
})
export class CvcActivityStream {
  readonly cvcTitle = input<string>('Activity Feed')
  readonly cvcScope = input<ActivityStreamScope>(streamDefaultScope)
  readonly cvcSettings = input<ActivityStreamSettings>(streamDefaultSettings)
  readonly cvcFilters = input<ActivityStreamFilters>(streamDefaultFilters)
  readonly cvcShowFilters = input<boolean>(true)
  readonly cvcCheckInterval = input<number>(0)
  readonly cvcHeight = input<string>('auto')

  private readonly gql = inject(ActivityStreamGQL)
  private readonly state = inject(ActivityStreamState)

  /** panel-edited state, re-seeded whenever the host's inputs change */
  readonly filtersState = linkedSignal(() => this.cvcFilters())
  readonly settingsState = linkedSignal(() => this.cvcSettings())

  private readonly stream =
    viewChild<CvcEntityStreamComponent<ActivityStreamNode>>(
      CvcEntityStreamComponent
    )

  protected readonly spec = computed(() =>
    activityStreamConfig({
      query: this.gql,
      title: this.cvcTitle(),
      scope: scopeToVariables(this.cvcScope()),
      pageSize: this.settingsState().first,
    })
  )

  protected readonly filterVars = computed(() =>
    streamFilterVariables({
      filters: this.filtersState(),
      settings: this.settingsState(),
      showFilters: this.cvcShowFilters(),
    })
  )

  /** the panel's option lists, from the stream's current connection */
  readonly filterOptions = computed<ActivityStreamFilterOptions>(() => {
    const connection = this.stream()?.connection()
    return connection
      ? connectionToFilterOptions(
          connection as unknown as ActivityStreamConnection
        )
      : streamFilterOptionDefaults
  })

  constructor() {
    effect(() => this.state.scope.set(this.cvcScope()))
    effect(() => {
      const settings = this.settingsState()
      const filters = this.filtersState()
      this.state.showOrganization.set(
        settings.showOrganization || filters.organizationId.length > 0
      )
    })
  }

  /** re-runs the stream's current variables — the update-notice action */
  refresh(): void {
    this.stream()?.refresh()
  }
}

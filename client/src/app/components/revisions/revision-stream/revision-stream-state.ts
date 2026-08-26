import {
  DestroyRef,
  Injectable,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { InternalRefetchQueryDescriptor } from '@apollo/client'
import { NetworkErrorsService } from '@app/core/services/network-errors.service'
import { ViewerService } from '@app/core/services/viewer/viewer.service'
import {
  MutationState,
  MutatorWithState,
} from '@app/core/utilities/mutation-state-wrapper'
import { Maybe } from '@app/generated/civic.apollo.types'
import { filter, map } from 'rxjs/operators'
import { onlyCompleteData } from 'apollo-angular'
import { isNonNulled } from 'rxjs-etc'
import {
  acceptEnabled,
  rejectEnabled,
  reviewEnabled,
} from './revision-moderation'
import {
  AcceptRevisionGQL,
  AcceptRevisionMutation,
  AcceptRevisionMutationVariables,
  RejectRevisionGQL,
  RejectRevisionMutation,
  RejectRevisionMutationVariables,
  ValidateRevisionsForAcceptanceGQL,
  ValidationErrorFragment,
} from './revision-moderation.gql.generated'

type ModerationOutcome = false | 'accepted' | 'rejected'

/**
 * The revision stream's moderation state, provided per facade instance:
 * the selection mirror, the live validation of the selected set, the
 * accept/reject mutations with their refetch fan-out, and the banner and
 * popover state the moderation bar renders. Item renderers reach the
 * facade through it too — inputs cannot cross the stream core's
 * polymorpheus outlets.
 *
 * The facade wires the two callbacks and supplies `refetchQueries`
 * before first use.
 */
@Injectable()
export class RevisionStreamState {
  private readonly destroyRef = inject(DestroyRef)
  private readonly viewerService = inject(ViewerService)
  private readonly networkErrors = inject(NetworkErrorsService)
  private readonly acceptGql = inject(AcceptRevisionGQL)
  private readonly rejectGql = inject(RejectRevisionGQL)
  private readonly validationGql = inject(ValidateRevisionsForAcceptanceGQL)

  /** the signed-in viewer, as gating and the org tooltip read it */
  readonly viewer = toSignal(this.viewerService.viewer$)

  /** mirror of the stream's selection model; the facade writes it */
  readonly selectedIds = signal<ReadonlyArray<number>>([])

  readonly comment = signal<Maybe<string>>(undefined)
  readonly isSubmitting = signal(false)
  readonly popoverVisible = signal(false)
  readonly success = signal<ModerationOutcome>(false)
  readonly errors = signal<ReadonlyArray<string>>([])

  /** wired by the facade; receives a Show Group click's revisionSetId */
  onSelectGroup: (revisionSetId: number) => void = () => {}

  /** wired by the facade: refresh the stream and clear its selection */
  onModerated: () => void = () => {}

  /** supplied by the facade: this subject's post-moderation fan-out */
  refetchQueries: InternalRefetchQueryDescriptor[] = []

  /**
   * The server validates the selected *set* — same subject, one revision
   * per field, self-acceptance rules — so every selection change refetches
   * the one long-lived validation query.
   */
  private readonly validationRef = this.validationGql.watch({
    variables: { ids: [] },
  })

  readonly genericErrors = toSignal(
    this.validationRef.valueChanges.pipe(
      onlyCompleteData(),
      map(({ data }) => data.validateRevisionsForAcceptance?.genericErrors),
      filter(isNonNulled)
    ),
    { initialValue: [] as string[] }
  )

  readonly validationErrors = toSignal(
    this.validationRef.valueChanges.pipe(
      onlyCompleteData(),
      map(({ data }) => data.validateRevisionsForAcceptance?.validationErrors),
      filter(isNonNulled)
    ),
    { initialValue: [] as ValidationErrorFragment[] }
  )

  readonly totalErrorCount = computed(
    () => this.genericErrors().length + this.validationErrors().length
  )

  readonly canReview = computed(() =>
    reviewEnabled(this.selectedIds().length, this.viewer()?.signedIn ?? false)
  )
  readonly canAccept = computed(() =>
    acceptEnabled(this.totalErrorCount(), this.comment())
  )
  readonly canReject = computed(() => rejectEnabled(this.comment()))

  private readonly acceptMutator = new MutatorWithState<
    AcceptRevisionGQL,
    AcceptRevisionMutation,
    AcceptRevisionMutationVariables
  >(this.networkErrors)
  private readonly rejectMutator = new MutatorWithState<
    RejectRevisionGQL,
    RejectRevisionMutation,
    RejectRevisionMutationVariables
  >(this.networkErrors)

  constructor() {
    // the watch already ran with []; only genuine changes refetch
    let lastValidated = JSON.stringify([])
    effect(() => {
      const ids = [...this.selectedIds()]
      const key = JSON.stringify(ids)
      if (key === lastValidated) return
      lastValidated = key
      untracked(() => void this.validationRef.refetch({ ids }))
    })
  }

  /** the header extra's Show Group action */
  selectGroup(revisionSetId: number): void {
    this.onSelectGroup(revisionSetId)
  }

  accept(): void {
    const comment = this.comment()
    this.isSubmitting.set(true)
    const state = this.acceptMutator.mutate(
      this.acceptGql,
      {
        input: {
          ids: [...this.selectedIds()],
          organizationId: this.viewer()?.mostRecentOrg?.id,
          comment: comment === '' ? undefined : comment,
        },
      },
      { refetchQueries: this.refetchQueries }
    )
    this.watchMutation(state, 'accepted')
  }

  reject(): void {
    const comment = this.comment()
    if (!rejectEnabled(comment)) return
    this.isSubmitting.set(true)
    const state = this.rejectMutator.mutate(
      this.rejectGql,
      {
        input: {
          ids: [...this.selectedIds()],
          organizationId: this.viewer()?.mostRecentOrg?.id,
          comment: comment!,
        },
      },
      { refetchQueries: this.refetchQueries }
    )
    this.watchMutation(state, 'rejected')
  }

  dismissError(error: string): void {
    this.errors.update((errors) => errors.filter((e) => e !== error))
  }

  dismissSuccess(): void {
    this.success.set(false)
  }

  private watchMutation(state: MutationState, outcome: ModerationOutcome) {
    state.submitSuccess$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ok) => {
        if (!ok) return
        this.isSubmitting.set(false)
        this.errors.set([])
        this.success.set(outcome)
        this.popoverVisible.set(false)
        this.comment.set(undefined)
        this.onModerated()
      })
    state.submitError$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((errors) => {
        if (errors.length === 0) return
        this.isSubmitting.set(false)
        this.success.set(false)
        this.errors.set(errors)
        this.popoverVisible.set(false)
        // the selection stays: a failed submit should not discard the
        // curator's set right when they need it to retry (the legacy list
        // wiped it — same accident D1 removed from paging)
      })
  }
}

import {
  FormMutationService,
  FormMutationState,
} from '@app/forms/utilities/form-mutation'
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core'

import { Subject } from 'rxjs'

import { takeUntil } from 'rxjs/operators'

import { ViewerOrganizationFragment } from '@app/core/services/viewer/viewer.service.gql.generated'
import {
  UpdateSourceSuggestionGQL,
  UpdateSourceSuggestionMutation,
  UpdateSourceSuggestionMutationVariables,
} from './update-source-suggestion.query.gql.generated'
import {
  Organization,
  Maybe,
  SourceSuggestionStatus,
} from '@app/generated/civic.apollo.types'

import { ViewerService, Viewer } from '@app/core/services/viewer/viewer.service'

@Component({
  selector: 'cvc-update-source-suggestion-form',
  templateUrl: './update-source-suggestion.form.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CvcUpdateSourceSuggestionForm implements OnDestroy {
  private formMutation = inject(FormMutationService)
  @Input() sourceSuggestionId!: number
  @Input() currentStatus!: SourceSuggestionStatus

  @Output() commentAddedEvent = new EventEmitter<void>()

  private destroy$ = new Subject<void>()
  organizations!: Array<ViewerOrganizationFragment>
  mostRecentOrg!: Maybe<ViewerOrganizationFragment>

  reason?: string
  newStatus?: SourceSuggestionStatus

  private mutationState?: FormMutationState
  success: boolean = false

  get errorMessages(): string[] {
    return (this.mutationState?.errors() ?? []).map((e) => e.message)
  }
  get loading(): boolean {
    return this.mutationState?.isSubmitting() ?? false
  }

  commentText?: string
  constructor(
    private viewerService: ViewerService,
    private updateSuggestionStatusGql: UpdateSourceSuggestionGQL
  ) {
    // subscribing to viewer$ and setting local org, mostRecentOrg
    // so that mostRecentOrg can be updated by org-selector's selectOrg events
    this.viewerService.viewer$
      .pipe(takeUntil(this.destroy$))
      .subscribe((v: Viewer) => {
        this.organizations = v.user?.organizations || []
        this.mostRecentOrg = v.mostRecentOrg
      })
  }

  selectOrg(org: Organization): void {
    this.mostRecentOrg = org
  }

  updateSourceSuggestionStatus(): void {
    if (this.newStatus) {
      this.mutationState = this.formMutation.mutate(
        this.updateSuggestionStatusGql,
        {
          input: {
            id: this.sourceSuggestionId,
            newStatus: this.newStatus,
            reason: this.reason,
            organizationId: this.mostRecentOrg?.id,
          },
        },
        {
          // flip the row's status tag in place immediately; Apollo reverts
          // the cache write if the server rejects the change. The browse
          // table deliberately does not refetch (the row stays put until
          // the next filter/sort change), so this is the whole visible
          // result of a successful update.
          optimisticResponse: {
            __typename: 'Mutation' as const,
            updateSourceSuggestionStatus: {
              __typename: 'UpdateSourceSuggestionStatusPayload',
              sourceSuggestion: {
                __typename: 'SourceSuggestion',
                id: this.sourceSuggestionId,
                status: this.newStatus,
              },
            },
          },
        },
        () => {
          this.resetForm()
          this.success = true
        }
      )
    }
  }

  resetForm(): void {
    this.commentText = ''
  }

  onSuccessBannerClose() {
    this.resetForm()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}

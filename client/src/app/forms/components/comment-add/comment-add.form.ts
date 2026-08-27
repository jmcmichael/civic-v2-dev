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
  AddCommentGQL,
  AddCommentMutation,
  AddCommentMutationVariables,
} from './comment-add.mutation.gql.generated'
import {
  Organization,
  CommentableInput,
  Maybe,
} from '@app/generated/civic.apollo.types'

import { ViewerService, Viewer } from '@app/core/services/viewer/viewer.service'
import { NetworkErrorsService } from '@app/core/services/network-errors.service'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'

@UntilDestroy()
@Component({
  selector: 'cvc-comment-add-form',
  templateUrl: './comment-add.form.html',
  styleUrls: ['./comment-add.form.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CvcCommentAddForm {
  private formMutation = inject(FormMutationService)
  @Input() subject!: CommentableInput
  @Output() commentAddedEvent = new EventEmitter<void>()

  mostRecentOrg!: Maybe<ViewerOrganizationFragment>

  private mutationState?: FormMutationState
  success: boolean = false

  get errorMessages(): string[] {
    return this.mutationState?.errors() ?? []
  }
  get loading(): boolean {
    return this.mutationState?.isSubmitting() ?? false
  }

  commentText?: string
  constructor(
    private viewerService: ViewerService,
    private addCommentGql: AddCommentGQL,
    private networkErrorService: NetworkErrorsService
  ) {
    // subscribing to viewer$ and setting local org, mostRecentOrg
    // so that mostRecentOrg can be updated by org-selector's selectOrg events
    this.viewerService.viewer$
      .pipe(untilDestroyed(this))
      .subscribe((v: Viewer) => {
        this.mostRecentOrg = v.mostRecentOrg
      })
  }

  submitComment(): void {
    if (this.commentText) {
      this.success = false
      let newCommentInput = {
        body: this.commentText,
        subject: this.subject,
        organizationId:
          this.mostRecentOrg === undefined ? undefined : this.mostRecentOrg.id,
      }

      this.mutationState = this.formMutation.mutate(
        this.addCommentGql,
        { input: newCommentInput },
        undefined,
        () => {
          this.resetForm()
          this.success = true
        }
      )
    }
  }

  resetForm(): void {
    this.commentText = ''
    this.commentAddedEvent.emit()
  }

  onSuccessBannerClose() {
    this.resetForm()
  }
}

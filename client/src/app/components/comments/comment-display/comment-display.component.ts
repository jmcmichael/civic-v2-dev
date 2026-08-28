import {
  Component,
  OnInit,
  input,
  ChangeDetectionStrategy,
} from '@angular/core'
import { Viewer, ViewerService } from '@app/core/services/viewer/viewer.service'
import { FormMutationService } from '@app/forms/utilities/form-mutation'
import { DeleteCommentGQL } from './delete-comment.query.gql.generated'
import { CommentListNodeFragment } from '@app/components/comments/comment-list/comment-list.query.gql.generated'
import { Observable } from 'rxjs'

@Component({
  selector: 'cvc-comment-display',
  templateUrl: './comment-display.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CvcCommentDisplayComponent implements OnInit {
  comment = input.required<CommentListNodeFragment>()
  canDelete = input<boolean>(true)

  viewer$: Observable<Viewer>

  constructor(
    private viewerService: ViewerService,
    private formMutation: FormMutationService,
    private deleteCommentGql: DeleteCommentGQL
  ) {
    this.viewer$ = this.viewerService.viewer$
  }

  ngOnInit() {
    if (this.comment === undefined) {
      throw new Error('Must pass a comment into comment display component.')
    }
  }

  deleteComment(commentId: number, orgId?: number) {
    this.formMutation.mutate(this.deleteCommentGql, {
      input: { commentId: commentId, organizationId: orgId },
    })
  }
}

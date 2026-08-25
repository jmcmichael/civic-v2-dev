import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcUserTagModule } from '@app/components/users/user-tag/user-tag.module'
import { CvcCellContext } from '@app/tables'
import { injectContext } from '@taiga-ui/polymorpheus'
import { CommentBrowseFieldsFragment } from './comments-table.query.gql.generated'

/**
 * The comments browse table's Commenter column, as a `kind: 'custom'` cell:
 * `User` is not a taggable typename (same reasoning as the users/
 * organizations browse tables' equivalent columns). Wraps the existing
 * bespoke `cvc-user-tag` around the nested `commenter` field.
 */
@Component({
  selector: 'cvc-comment-commenter-cell',
  imports: [CvcUserTagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <cvc-user-tag
      [user]="ctx.row.commenter"
      [enablePopover]="!ctx.isScrolling" />
  `,
})
export class CvcCommentCommenterCellComponent {
  protected readonly ctx =
    injectContext<CvcCellContext<CommentBrowseFieldsFragment>>()
}

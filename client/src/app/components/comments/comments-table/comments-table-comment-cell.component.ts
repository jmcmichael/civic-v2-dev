import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcCommentTagModule } from '@app/components/comments/comment-tag/comment-tag.module'
import { CvcCellContext } from '@app/tables'
import { injectContext } from '@taiga-ui/polymorpheus'
import { CommentBrowseFieldsFragment } from './comments-table.query.gql.generated'

/**
 * The comments browse table's Comment column, as a `kind: 'custom'` cell:
 * `Comment` is not a taggable typename, so the generic `entity-tag` kind
 * can't address it. Wraps the existing bespoke `cvc-comment-tag`, which
 * takes the whole row (it reads `id`/`name`/`link` off it directly), and
 * has its own popover.
 */
@Component({
  selector: 'cvc-comment-cell',
  imports: [CvcCommentTagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // subject-column tag: block display at full cell width, the same
  // treatment the entity-tag kind's `fullWidth` gives generic subject
  // columns (the bespoke tag this cell wraps has no such input)
  styles: `
    /* the wrapped tag's host is inline-block (shrink-to-fit), so a bare
       width: 100% on the inner nz-tag would resolve against it circularly;
       blocking host + tag makes the cell the containing block */
    :host,
    :host > * {
      display: block;
    }
    :host ::ng-deep nz-tag {
      width: 100%;
    }
  `,
  template: `
    <cvc-comment-tag
      [comment]="ctx.row"
      [enablePopover]="!ctx.isScrolling" />
  `,
})
export class CvcCommentCellComponent {
  protected readonly ctx =
    injectContext<CvcCellContext<CommentBrowseFieldsFragment>>()
}

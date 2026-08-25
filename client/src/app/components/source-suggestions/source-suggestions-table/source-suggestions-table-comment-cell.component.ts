import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcCommentBodyModule } from '@app/components/comments/comment-body/comment-body.module'
import { getEntityColor } from '@app/core/utilities/get-entity-color'
import { CvcCellContext } from '@app/tables'
import { injectContext } from '@taiga-ui/polymorpheus'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { BrowseSourceSuggestionRowFieldsFragment } from './source-suggestions-table.query.gql.generated'

/**
 * The submitter-comment column: a comment icon disclosing the suggestion's
 * creation note in a popover (suppressed while scrolling). Rendered only
 * when the note has content — legacy showed the icon unconditionally, with
 * an empty popover for the rare note-less row.
 */
@Component({
  selector: 'cvc-source-suggestion-comment-cell',
  imports: [CvcCommentBodyModule, NzIconModule, NzPopoverModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (note.length) {
      <span
        nz-popover
        [nzPopoverContent]="ctx.isScrolling ? undefined : noteTpl"
        [nzPopoverOverlayStyle]="{ width: '300px' }">
        <span
          nz-icon
          nzTheme="twotone"
          [nzTwotoneColor]="commentColor"
          nzType="civic-comment"></span>
      </span>
      <ng-template #noteTpl>
        <cvc-comment-body [commentBodySegments]="note" />
      </ng-template>
    }
  `,
})
export class CvcSourceSuggestionCommentCellComponent {
  protected readonly ctx =
    injectContext<CvcCellContext<BrowseSourceSuggestionRowFieldsFragment>>()

  protected readonly commentColor = getEntityColor('Comment')

  protected get note() {
    return this.ctx.row.creationActivity?.parsedNote ?? []
  }
}

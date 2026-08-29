import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcCommentBodyModule } from '@app/components/comments/comment-body/comment-body.module'
import { formatSourceSuggestionStatusEnum } from '@app/core/utilities/enum-formatters/format-source-suggestion-status-enum'
import { SourceSuggestionStatus } from '@app/generated/civic.apollo.types'
import { CvcCellContext } from '@app/tables'
import { injectContext } from '@taiga-ui/polymorpheus'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { BrowseSourceSuggestionRowFieldsFragment } from './source-suggestions-table.query.gql.generated'

const STATUS_COLORS: Record<SourceSuggestionStatus, string> = {
  [SourceSuggestionStatus.Curated]: 'green',
  [SourceSuggestionStatus.New]: 'orange',
  [SourceSuggestionStatus.Rejected]: 'volcano',
}

/**
 * The status column: the legacy colored tag (green/orange/volcano), the
 * label title-cased rather than legacy's `| lowercase`, plus the
 * status-note comment icon when the last status change carried a reason —
 * its popover shows the note and is suppressed while scrolling. The status
 * value itself updates in place when the Actions cell's mutation lands
 * (optimistically first), so this cell re-renders through the row's cache
 * normalization.
 */
@Component({
  selector: 'cvc-source-suggestion-status-cell',
  imports: [CvcCommentBodyModule, NzIconModule, NzPopoverModule, NzTagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-tag [nzColor]="colors[ctx.row.status]">
      @if (note.length) {
        <span
          nz-icon
          nz-popover
          [nzPopoverContent]="ctx.isScrolling ? undefined : noteTpl"
          [nzPopoverOverlayStyle]="{ width: '300px' }"
          nzType="civic-comment"></span>
        <ng-template #noteTpl>
          <cvc-comment-body [commentBodySegments]="note" />
        </ng-template>
      }
      {{ label(ctx.row.status) }}
    </nz-tag>
  `,
})
export class CvcSourceSuggestionStatusCellComponent {
  protected readonly ctx =
    injectContext<CvcCellContext<BrowseSourceSuggestionRowFieldsFragment>>()

  protected readonly colors = STATUS_COLORS
  protected readonly label = formatSourceSuggestionStatusEnum

  protected get note() {
    return this.ctx.row.lastStatusUpdateActivity?.parsedNote ?? []
  }
}

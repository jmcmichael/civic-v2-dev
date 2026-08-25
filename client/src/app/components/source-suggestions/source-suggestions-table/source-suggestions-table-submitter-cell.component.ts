import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcUserTagModule } from '@app/components/users/user-tag/user-tag.module'
import { CvcCellContext } from '@app/tables'
import { injectContext } from '@taiga-ui/polymorpheus'
import { BrowseSourceSuggestionRowFieldsFragment } from './source-suggestions-table.query.gql.generated'

/**
 * The Submitter column: `User` is not a taggable typename (the users-table
 * precedent), so the bespoke `cvc-user-tag` renders here as a custom cell,
 * with the column's live filter emphasized in the label via
 * `ctx.filterText()`.
 */
@Component({
  selector: 'cvc-source-suggestion-submitter-cell',
  imports: [CvcUserTagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ctx.row.user; as user) {
      <cvc-user-tag
        [user]="user"
        [matchingText]="ctx.filterText()"
        [enablePopover]="!ctx.isScrolling" />
    }
  `,
})
export class CvcSourceSuggestionSubmitterCellComponent {
  protected readonly ctx =
    injectContext<CvcCellContext<BrowseSourceSuggestionRowFieldsFragment>>()
}

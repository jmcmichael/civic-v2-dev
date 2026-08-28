import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcTagOverflowModule } from '@app/components/shared/tag-overflow/tag-overflow.module'
import { TagInfo } from '@app/components/shared/tag-overflow/tag-overflow.component'
import { CvcEmptyValueModule } from '@app/forms/components/empty-value/empty-value.module'
import { CvcCellContext } from '@app/tables'
import { injectContext } from '@taiga-ui/polymorpheus'
import { UserBrowseTableRowFieldsFragment } from './users-table.query.gql.generated'

/**
 * The users browse table's Organizations column, as a `kind: 'custom'`
 * cell: `cvc-tag-overflow` is a separate, non-cache-driven pileup mechanism
 * from `@app/tags`, same reasoning as the organizations browse table's
 * Sub Organizations column.
 *
 * A user with no organizations renders the shared `cvc-empty-value` — the
 * legacy cell's bespoke italic "None specified", normalised onto the one
 * empty-state component every built-in cell kind already uses.
 *
 * The column's live filter value reaches the cell via `ctx.filterText()`;
 * the overflow widget sorts matching organizations to the front of the
 * line and annotates the "+N" badge with the hidden-match count.
 */
@Component({
  selector: 'cvc-user-organizations-cell',
  imports: [CvcTagOverflowModule, CvcEmptyValueModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (tags().length > 0) {
      <cvc-tag-overflow
        tagType="organization"
        [maxDisplayCount]="1"
        [matchingText]="ctx.filterText()"
        [enablePopover]="!ctx.isScrolling"
        [tags]="tags()" />
    } @else {
      <cvc-empty-value
        [cvcEmptyCategory]="ctx.column.emptyValue ?? 'unspecified'" />
    }
  `,
})
export class CvcUserOrganizationsCellComponent {
  protected readonly ctx =
    injectContext<CvcCellContext<UserBrowseTableRowFieldsFragment>>()

  protected tags(): TagInfo[] {
    return this.ctx.row.organizations.map((org) => ({
      id: org.id,
      name: org.name,
      link: `/organizations/${org.id}`,
    }))
  }
}

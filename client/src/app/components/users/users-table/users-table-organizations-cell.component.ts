import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcTagOverflowModule } from '@app/components/shared/tag-overflow/tag-overflow.module'
import { TagInfo } from '@app/components/shared/tag-overflow/tag-overflow.component'
import { CvcCellContext } from '@app/tables'
import { injectContext } from '@taiga-ui/polymorpheus'
import { UserBrowseTableRowFieldsFragment } from './users-table.query.gql.generated'

/**
 * The users browse table's Organizations column, as a `kind: 'custom'`
 * cell: `cvc-tag-overflow` is a separate, non-cache-driven pileup mechanism
 * from `@app/tags`, same reasoning as the organizations browse table's
 * Sub Organizations column.
 *
 * The legacy cell also passed `[matchingText]="orgNameInput"`, highlighting
 * hidden overflow tags that match the current organization filter —
 * `CvcCellContext` has no filter-value accessor, so this is dropped as a
 * minor, accepted UX simplification; the overflow popover still lists every
 * organization, just without the highlight.
 */
@Component({
  selector: 'cvc-user-organizations-cell',
  imports: [CvcTagOverflowModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <cvc-tag-overflow
      tagType="organization"
      [maxDisplayCount]="1"
      [enablePopover]="!ctx.isScrolling"
      [tags]="tags()" />
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

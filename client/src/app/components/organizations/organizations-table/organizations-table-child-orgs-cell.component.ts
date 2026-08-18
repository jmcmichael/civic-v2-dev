import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcTagOverflowModule } from '@app/components/shared/tag-overflow/tag-overflow.module'
import { TagInfo } from '@app/components/shared/tag-overflow/tag-overflow.component'
import { CvcCellContext } from '@app/tables'
import { injectContext } from '@taiga-ui/polymorpheus'
import { OrganizationBrowseTableRowFieldsFragment } from './organizations-table.query.gql.generated'

/**
 * The organizations browse table's Sub Organizations column, as a `kind:
 * 'custom'` cell: `cvc-tag-overflow` (`tagType="organization"`) is a
 * separate, non-cache-driven pileup-tag mechanism from `@app/tags` — it
 * takes plain `{id, name, link}` data directly, never resolves through
 * `watchFragment`, and has no generic-kind equivalent. No sort or filter on
 * this column, matching the legacy table.
 *
 * The mapping to `TagInfo` lives in a method: Angular template expressions
 * have no arrow-function syntax, so `.map((org) => ...)` cannot appear
 * inline in the binding.
 */
@Component({
  selector: 'cvc-organization-child-orgs-cell',
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
export class CvcOrganizationChildOrgsCellComponent {
  protected readonly ctx =
    injectContext<CvcCellContext<OrganizationBrowseTableRowFieldsFragment>>()

  protected tags(): TagInfo[] {
    return this.ctx.row.childOrganizations.map((org) => ({
      id: org.id,
      name: org.name,
      link: `/organizations/${org.id}`,
    }))
  }
}

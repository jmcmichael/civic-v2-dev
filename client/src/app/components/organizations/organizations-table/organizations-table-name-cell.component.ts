import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcOrganizationTagModule } from '@app/components/organizations/organization-tag/organization-tag.module'
import { CvcCellContext } from '@app/tables'
import { injectContext } from '@taiga-ui/polymorpheus'
import { OrganizationBrowseTableRowFieldsFragment } from './organizations-table.query.gql.generated'

/**
 * The organizations browse table's Organization column, as a `kind:
 * 'custom'` cell (`organizations-table.config.ts`): `Organization` is not a
 * taggable typename (no `entity-tag-specs.ts` entry, no `Linkable*`
 * fragment, no `TAG_POPOVERS` entry), so the generic `entity-tag` kind
 * can't address it. Wraps the existing bespoke `cvc-organization-tag`,
 * which has its own popover, instead.
 */
@Component({
  selector: 'cvc-organization-name-cell',
  imports: [CvcOrganizationTagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <cvc-organization-tag
      [org]="{ id: ctx.row.id, name: ctx.row.name }"
      [enablePopover]="!ctx.isScrolling"
      popoverPlacement="right" />
  `,
})
export class CvcOrganizationNameCellComponent {
  protected readonly ctx =
    injectContext<CvcCellContext<OrganizationBrowseTableRowFieldsFragment>>()
}

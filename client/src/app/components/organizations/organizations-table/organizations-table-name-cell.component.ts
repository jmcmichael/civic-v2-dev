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

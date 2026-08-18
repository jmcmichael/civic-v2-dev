import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcUserTagModule } from '@app/components/users/user-tag/user-tag.module'
import { CvcCellContext } from '@app/tables'
import { injectContext } from '@taiga-ui/polymorpheus'
import { UserBrowseTableRowFieldsFragment } from './users-table.query.gql.generated'

/**
 * The users browse table's User column, as a `kind: 'custom'` cell
 * (`users-table.config.ts`): `User` is not a taggable typename (no
 * `entity-tag-specs.ts` entry, no `Linkable*` fragment, no `TAG_POPOVERS`
 * entry), so the generic `entity-tag` kind can't address it. Wraps the
 * existing bespoke `cvc-user-tag`, which has its own popover, instead. No
 * sort or filter on this column, matching the legacy table (Name, not
 * User, is where those live).
 */
@Component({
  selector: 'cvc-user-cell',
  imports: [CvcUserTagModule],
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
    <cvc-user-tag
      [user]="{
        id: ctx.row.id,
        displayName: ctx.row.displayName,
        role: ctx.row.role,
      }"
      [enablePopover]="!ctx.isScrolling"
      popoverPlacement="right" />
  `,
})
export class CvcUserCellComponent {
  protected readonly ctx =
    injectContext<CvcCellContext<UserBrowseTableRowFieldsFragment>>()
}

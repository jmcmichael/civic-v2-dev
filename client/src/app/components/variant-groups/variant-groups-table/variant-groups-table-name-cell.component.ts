import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcVariantGroupTagModule } from '@app/components/variant-groups/variant-group-tag/variant-group-tag.module'
import { CvcCellContext } from '@app/tables'
import { injectContext } from '@taiga-ui/polymorpheus'
import { BrowseVariantGroupRowFieldsFragment } from './variant-groups-table.query.gql.generated'

/**
 * The variant groups browse table's Name column, as a `kind: 'custom'`
 * cell: `VariantGroup` is not a taggable typename, so the generic
 * `entity-tag` kind can't address it. Wraps the existing bespoke
 * `cvc-variant-group-tag`, which has its own popover, instead.
 *
 * `cvc-variant-group-tag`'s `LinkableVariantgroup` input type declares a
 * `flagged` field `BrowseVariantGroup` doesn't have in the schema at all
 * (the legacy template bound the whole row here too, under looser
 * template checking); `$any()` bypasses the mismatch the same way
 * comments-table's Subject cell does for its own legacy-vs-strict gaps.
 */
@Component({
  selector: 'cvc-variant-group-name-cell',
  imports: [CvcVariantGroupTagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // subject-column tag: block display at full cell width, the same
  // treatment the entity-tag kind's `fullWidth` gives generic subject
  // columns (the bespoke tag this cell wraps has no such input)
  styles: `
    :host {
      display: block;
    }
    :host ::ng-deep nz-tag {
      width: 100%;
    }
  `,
  template: `
    <cvc-variant-group-tag
      [variantgroup]="$any(ctx.row)"
      [enablePopover]="!ctx.isScrolling"
      popoverPlacement="right" />
  `,
})
export class CvcVariantGroupNameCellComponent {
  protected readonly ctx =
    injectContext<CvcCellContext<BrowseVariantGroupRowFieldsFragment>>()
}

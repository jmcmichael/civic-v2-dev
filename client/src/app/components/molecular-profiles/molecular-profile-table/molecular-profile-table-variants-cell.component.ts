import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcTagOverflowModule } from '@app/components/shared/tag-overflow/tag-overflow.module'
import { CvcCellContext } from '@app/tables'
import { injectContext } from '@taiga-ui/polymorpheus'
import { BrowseMolecularProfilesFieldsFragment } from './molecular-profile-table.query.gql.generated'

/**
 * The molecular profiles browse table's Variants column, as a `kind:
 * 'custom'` cell wrapping the existing `cvc-tag-overflow` widget directly
 * (`tagType="variant-feature"`), rather than the generic `entity-tag` kind:
 * the row's `variants` field resolves to the schema's synthetic
 * `LinkableVariant` object type, not one of the taggable `Variant`/
 * `GeneVariant`/... typenames `ENTITY_TAG_SPECS` addresses, and each tag is
 * a composite of the variant AND its parent feature (`cvc-feature-variant-
 * tag`, rendering both), which no single-typename generic cell can express.
 *
 * `cvc-tag-overflow`'s `TagInfo` type only declares `{id, name, link,
 * matchText?}`; `cvc-feature-variant-tag` (which `tagType="variant-feature"`
 * delegates to) reads a `.feature` off the same object at runtime -- the
 * legacy template relied on this looser structural typing too, so `$any()`
 * bypasses it here the same way other tables' custom cells do for their own
 * legacy-vs-strict gaps.
 */
@Component({
  selector: 'cvc-molecular-profile-variants-cell',
  imports: [CvcTagOverflowModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <cvc-tag-overflow
      tagType="variant-feature"
      [tags]="$any(ctx.row.variants)"
      [maxDisplayCount]="2"
      [enablePopover]="!ctx.isScrolling" />
  `,
})
export class CvcMolecularProfileVariantsCellComponent {
  protected readonly ctx =
    injectContext<CvcCellContext<BrowseMolecularProfilesFieldsFragment>>()
}

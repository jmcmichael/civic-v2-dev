import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcTagOverflowModule } from '@app/components/shared/tag-overflow/tag-overflow.module'
import { TagInfo } from '@app/components/shared/tag-overflow/tag-overflow.component'
import { CvcCellContext } from '@app/tables'
import { injectContext } from '@taiga-ui/polymorpheus'
import { BrowseDiseaseRowFieldsFragment } from './diseases-table.query.gql.generated'

/**
 * The diseases browse table's Features column, as a `kind: 'custom'` cell:
 * the schema projects `BrowseDisease.features` through `LinkableFeature`
 * (a slim type with only `id`/`name`/`link` — no `flagged`/`deprecated`/
 * `featureType`), which does not satisfy the tag system's own
 * `LinkableFeature` fragment (same name, different thing: that one needs
 * all six). Feature is otherwise a taggable typename, but there is no
 * per-feature substitute value to borrow here the way variants-table
 * borrows its row's own `category` for `featureType` — a disease can list
 * several features of different types, and none of that data is in this
 * query. Faking the missing fields would render the wrong icon per
 * feature; `cvc-tag-overflow` (`cvc-feature-tag` internally) tolerates the
 * gap gracefully, matching the legacy rendering except for one deliberate
 * drop: the legacy `[matchingText]="featureNameInput"` per-tag match
 * annotation, which a custom cell cannot express (no hook into a column's
 * live filter value by design — the same trade users-table's organizations
 * cell and sources-table's authors cell document).
 */
@Component({
  selector: 'cvc-disease-features-cell',
  imports: [CvcTagOverflowModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <cvc-tag-overflow
      tagType="feature"
      [maxDisplayCount]="3"
      [enablePopover]="!ctx.isScrolling"
      [tags]="tags()" />
  `,
})
export class CvcDiseaseFeaturesCellComponent {
  protected readonly ctx =
    injectContext<CvcCellContext<BrowseDiseaseRowFieldsFragment>>()

  protected tags(): TagInfo[] {
    return this.ctx.row.features.map((feature) => ({
      id: feature.id,
      name: feature.name,
      link: feature.link,
    }))
  }
}

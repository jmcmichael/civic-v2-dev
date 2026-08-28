import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcPlainTagOverflowModule } from '@app/components/shared/plain-tag-overflow/plain-tag-overflow.module'
import { CvcCellContext } from '@app/tables'
import { injectContext } from '@taiga-ui/polymorpheus'
import { BrowseSourceRowFieldsFragment } from './sources-table.query.gql.generated'

/**
 * The sources browse table's Authors column: a `cvc-plain-tag-overflow`
 * pileup (first author as a chip, the rest collapsed into a "+N" badge) —
 * `@app/tags`' `cvc-tag-overflow` is for taggable entities, not plain
 * strings, so this reuses the same standalone `cvc-plain-tag-overflow`
 * widget the legacy table used directly, as a `kind: 'custom'` cell.
 *
 * The column's live filter value reaches the cell via `ctx.filterText()`;
 * the overflow widget sorts matching authors to the front of the line and
 * annotates the "+N" badge with the hidden-match count.
 */
@Component({
  selector: 'cvc-source-authors-cell',
  imports: [CvcPlainTagOverflowModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <cvc-plain-tag-overflow
      [tags]="ctx.row.authors"
      [maxDisplayCount]="1"
      [matchingText]="ctx.filterText()" />
  `,
})
export class CvcSourceAuthorsCellComponent {
  protected readonly ctx =
    injectContext<CvcCellContext<BrowseSourceRowFieldsFragment>>()
}

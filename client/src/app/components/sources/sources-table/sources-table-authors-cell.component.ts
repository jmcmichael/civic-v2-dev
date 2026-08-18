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
 * Legacy also passed `[matchingText]="authorInput"`, which only affects an
 * overflow-badge "N of these match" annotation — `CvcCellContext` has no
 * hook into a column's own live filter value (a custom cell owns its whole
 * rendering, deliberately outside the shared filter-highlight machinery), so
 * that one annotation is dropped rather than plumbed through for a cosmetic
 * detail. The overflow behavior itself — the actual feature — is unaffected.
 */
@Component({
  selector: 'cvc-source-authors-cell',
  imports: [CvcPlainTagOverflowModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <cvc-plain-tag-overflow
      [tags]="ctx.row.authors"
      [maxDisplayCount]="1" />
  `,
})
export class CvcSourceAuthorsCellComponent {
  protected readonly ctx =
    injectContext<CvcCellContext<BrowseSourceRowFieldsFragment>>()
}

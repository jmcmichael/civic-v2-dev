import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcPlainTagOverflowModule } from '@app/components/shared/plain-tag-overflow/plain-tag-overflow.module'
import { EnumToTitlePipe } from '@app/core/pipes/enum-to-title-pipe'
import { CvcCellContext } from '@app/tables'
import { injectContext } from '@taiga-ui/polymorpheus'
import { RevisionSetBrowseFieldsFragment } from './revisions-table.query.gql.generated'

const ENUM_TO_TITLE = new EnumToTitlePipe()

/**
 * The Revision Fields column: the set's revised field names as an overflow
 * pileup (one visible + a count, per legacy), exon-coordinate revisions
 * suffixed with their coordinate type, and the column's live filter
 * emphasized via `matchingText` (a `ctx.filterText()` restoration — the
 * legacy table bound its filter model here directly).
 */
@Component({
  selector: 'cvc-revisions-table-fields-cell',
  imports: [CvcPlainTagOverflowModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <cvc-plain-tag-overflow
      [tags]="fieldNames"
      [maxDisplayCount]="1"
      [matchingText]="ctx.filterText()" />
  `,
})
export class CvcRevisionsTableFieldsCellComponent {
  protected readonly ctx =
    injectContext<CvcCellContext<RevisionSetBrowseFieldsFragment>>()

  /** stable per cell instance — the row is fixed for this cell's lifetime */
  protected readonly fieldNames: string[] = this.ctx.row.revisions.map(
    (revision) => {
      if (revision.subject?.__typename === 'ExonCoordinate') {
        const coordinateType = ENUM_TO_TITLE.transform(
          revision.subject.coordinateType
        )
        return `${revision.fieldDisplayName} (${coordinateType})`
      }
      return revision.fieldDisplayName
    }
  )
}

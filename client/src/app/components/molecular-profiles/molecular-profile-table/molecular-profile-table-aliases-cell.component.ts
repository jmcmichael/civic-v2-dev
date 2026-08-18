import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcPlainTagOverflowModule } from '@app/components/shared/plain-tag-overflow/plain-tag-overflow.module'
import { CvcCellContext } from '@app/tables'
import { injectContext } from '@taiga-ui/polymorpheus'
import { BrowseMolecularProfilesFieldsFragment } from './molecular-profile-table.query.gql.generated'

/**
 * The molecular profiles browse table's Aliases column: a
 * `cvc-plain-tag-overflow` pileup over plain alias strings, the same
 * reasoning (and the same dropped `matchingText` overflow-badge annotation
 * -- a custom cell has no hook into a column's own live filter value) as
 * sources-table's Authors column.
 */
@Component({
  selector: 'cvc-molecular-profile-aliases-cell',
  imports: [CvcPlainTagOverflowModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <cvc-plain-tag-overflow
      [tags]="aliasNames()"
      [maxDisplayCount]="1" />
  `,
})
export class CvcMolecularProfileAliasesCellComponent {
  protected readonly ctx =
    injectContext<CvcCellContext<BrowseMolecularProfilesFieldsFragment>>()

  protected aliasNames(): string[] {
    return this.ctx.row.aliases.map((a) => a.name)
  }
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { CvcEmptyValueModule } from '@app/forms/components/empty-value/empty-value.module'
import { CvcLinkTagModule } from '@app/components/shared/link-tag/link-tag.module'
import { PhenotypeBrowseTableRowFieldsFragment } from './phenotypes-table.query.gql.generated'

/**
 * The phenotypes browse table's HPO ID column, as a `kind: 'custom'` cell
 * (`phenotypes-table.config.ts`): an external link-out to the term on the
 * Human Phenotype Ontology site, which no built-in cell kind renders (they
 * address in-app entities, not arbitrary hrefs). Row context arrives via the
 * `row` input, written by the polymorpheus outlet.
 */
@Component({
  selector: 'cvc-phenotype-hpo-id-cell',
  imports: [CvcEmptyValueModule, CvcLinkTagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (row().hpoId; as hpoId) {
      <cvc-link-tag [href]="row().url">{{ hpoId }}</cvc-link-tag>
    } @else {
      <cvc-empty-value cvcEmptyCategory="not-applicable" />
    }
  `,
})
export class CvcPhenotypeHpoIdCellComponent {
  readonly row = input.required<PhenotypeBrowseTableRowFieldsFragment>()
}

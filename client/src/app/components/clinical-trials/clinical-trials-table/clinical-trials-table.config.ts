import {
  ClinicalTrialSortColumns,
  Maybe,
} from '@app/generated/civic.apollo.types'
import { entityTableConfig } from '@app/tables'
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus'
import { CvcClinicalTrialNctIdCellComponent } from './clinical-trials-table-nct-id-cell.component'
import { ClinicalTrialsBrowseGQL } from './clinical-trials-table.query.gql.generated'

/**
 * The clinical trials browse table, as configuration. No host scope: the
 * legacy table has no `ids`/entity-id input and only one embed site
 * (clinical-trials-home), so the config takes none either.
 *
 * NCT ID has no built-in cell kind — `ClinicalTrial` is not a taggable
 * typename, see `clinical-trials-table-nct-id-cell.component.ts`. Name is
 * plain text: the legacy table's hover tooltip on overflow is dropped, but
 * the NCT ID tag's popover already surfaces the full name (plus source and
 * evidence counts), so the disclosure path survives.
 */
export function clinicalTrialsTableConfig(
  query: ClinicalTrialsBrowseGQL,
  title: Maybe<string>
) {
  return entityTableConfig({
    title: title ?? undefined,
    query,
    pageSize: 35,
    connection: (data) => data?.clinicalTrials,
    columns: [
      {
        key: 'nctId',
        label: 'NCT ID',
        width: '150px',
        fixed: 'left',
        cell: {
          kind: 'custom',
          content: new PolymorpheusComponent(
            CvcClinicalTrialNctIdCellComponent
          ),
        },
        sort: { column: ClinicalTrialSortColumns.NctId },
        filter: { kind: 'text', var: 'nctId', placeholder: 'Filter NCT ID' },
      },
      {
        key: 'name',
        label: 'Name',
        width: '600px',
        cell: { kind: 'text', text: (row) => row.name, highlight: true },
        sort: { column: ClinicalTrialSortColumns.Name },
        filter: { kind: 'text', var: 'name', placeholder: 'Filter Name' },
      },
      {
        key: 'sourceCount',
        label: 'Count',
        tooltip: 'Source Count',
        width: '75px',
        fixed: 'right',
        align: 'right',
        cell: { kind: 'text', text: (row) => row.sourceCount },
        sort: { column: ClinicalTrialSortColumns.SourceCount },
      },
      {
        key: 'evidenceCount',
        label: 'Count',
        tooltip: 'Evidence Count',
        width: '75px',
        fixed: 'right',
        align: 'right',
        cell: { kind: 'text', text: (row) => row.evidenceCount },
        sort: { column: ClinicalTrialSortColumns.EvidenceItemCount },
      },
    ],
  })
}

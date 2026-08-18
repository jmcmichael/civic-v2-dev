import {
  Maybe,
  VariantGroupsSortColumns,
} from '@app/generated/civic.apollo.types'
import { entityTableConfig, SORT_DESCEND_FIRST } from '@app/tables'
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus'
import { CvcVariantGroupNameCellComponent } from './variant-groups-table-name-cell.component'
import { BrowseVariantGroupsGQL } from './variant-groups-table.query.gql.generated'

/**
 * The variant groups browse table, as configuration. No host scope: the
 * legacy table has no `ids`/entity-id input and only one embed site
 * (variant-groups-home).
 *
 * Name is a `kind: 'custom'` cell: `VariantGroup` is not a taggable
 * typename — see `variant-groups-table-name-cell.component.ts`. Variants
 * and Features are plain string lists (no ids/links in the schema, unlike
 * diseases/features' nested entity columns), so both are `text` cells
 * with filter-match highlighting.
 */
export function variantGroupsTableConfig(
  query: BrowseVariantGroupsGQL,
  title: Maybe<string>
) {
  return entityTableConfig({
    title: title ?? undefined,
    query,
    pageSize: 30,
    connection: (data) => data?.browseVariantGroups,
    columns: [
      {
        key: 'name',
        label: 'Name',
        width: '250px',
        fixed: 'left',
        cell: {
          kind: 'custom',
          content: new PolymorpheusComponent(CvcVariantGroupNameCellComponent),
        },
        sort: { column: VariantGroupsSortColumns.Name },
        filter: { kind: 'text', var: 'name', placeholder: 'Filter Name' },
      },
      {
        key: 'variantNames',
        label: 'Variants',
        width: '600px',
        cell: {
          kind: 'text',
          text: (row) => row.variantNames ?? undefined,
          tooltip: true,
          highlight: true,
        },
        filter: {
          kind: 'text',
          var: 'variantNames',
          placeholder: 'Filter Variant Names',
        },
      },
      {
        key: 'featureNames',
        label: 'Features',
        width: '150px',
        cell: {
          kind: 'text',
          text: (row) => row.featureNames ?? undefined,
          highlight: true,
          tooltip: true,
        },
        filter: {
          kind: 'text',
          var: 'featureNames',
          placeholder: 'Filter Feature Names',
        },
      },
      {
        key: 'variantCount',
        label: 'CT.',
        tooltip: 'Variant Count',
        labelIcon: 'civic-variant',
        width: '70px',
        fixed: 'right',
        align: 'right',
        cell: { kind: 'text', text: (row) => row.variantCount },
        sort: {
          column: VariantGroupsSortColumns.VariantCount,
          default: 'descend',
          directions: SORT_DESCEND_FIRST,
        },
      },
      {
        key: 'evidenceItemCount',
        label: 'CT.',
        tooltip: 'Evidence Count',
        labelIcon: 'civic-evidence',
        width: '70px',
        fixed: 'right',
        align: 'right',
        cell: { kind: 'text', text: (row) => row.evidenceItemCount },
        sort: {
          column: VariantGroupsSortColumns.EvidenceItemCount,
          directions: SORT_DESCEND_FIRST,
        },
      },
    ],
  })
}

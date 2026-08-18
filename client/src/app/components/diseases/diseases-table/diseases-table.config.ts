import { DiseasesSortColumns, Maybe } from '@app/generated/civic.apollo.types'
import { entityTableConfig, SORT_DESCEND_FIRST } from '@app/tables'
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus'
import { CvcDiseaseFeaturesCellComponent } from './diseases-table-features-cell.component'
import { DiseaseBrowseGQL } from './diseases-table.query.gql.generated'

/** The query variables a host page scopes the table with. */
export interface DiseasesTableScope {
  ids?: Maybe<number[]>
}

/**
 * The diseases browse table, as configuration.
 *
 * `BrowseDisease` itself satisfies `LinkableDisease` (id, name, link,
 * deprecated) directly, so Name addresses it as `Disease` and gets the
 * generic tag's popover for free. Features does not — see
 * `diseases-table-features-cell.component.ts`.
 *
 * DOID links out to the term on disease-ontology.org, not an in-app
 * entity — `kind: 'external-link'`.
 */
export function diseasesTableConfig(
  query: DiseaseBrowseGQL,
  title: Maybe<string>,
  scope: DiseasesTableScope = {}
) {
  return entityTableConfig({
    title: title ?? undefined,
    query,
    pageSize: 35,
    scope: {
      ids: scope.ids ?? undefined,
    },
    connection: (data) => data?.browseDiseases,
    columns: [
      {
        key: 'name',
        label: 'Name',
        width: '200px',
        fixed: 'left',
        cell: {
          kind: 'entity-tag',
          ref: (row) => ({ __typename: 'Disease' as const, id: row.id }),
          seed: (row) => ({
            __typename: 'Disease' as const,
            id: row.id,
            name: row.name,
            link: row.link,
            deprecated: row.deprecated,
          }),
          popoverPlacement: 'right',
        },
        sort: { column: DiseasesSortColumns.Name },
        filter: { kind: 'text', var: 'name', placeholder: 'Filter Name' },
      },
      {
        key: 'doid',
        label: 'DOID',
        width: '100px',
        fixed: 'left',
        cell: {
          kind: 'external-link',
          // gated on doid, not just diseaseUrl: the external-link kind
          // falls back to rendering the href itself when `text` yields
          // nothing, so a row with a url but no doid would show the raw
          // url where the legacy table showed its empty state
          href: (row) => (row.doid ? row.diseaseUrl : undefined),
          text: (row) => (row.doid ? `DOID:${row.doid}` : undefined),
          tooltip: 'View on disease-ontology.org',
        },
        sort: { column: DiseasesSortColumns.Doid },
        filter: { kind: 'text', var: 'doid', placeholder: 'Filter DOID' },
      },
      {
        key: 'diseaseAliases',
        label: 'Aliases',
        width: '200px',
        cell: {
          kind: 'text',
          text: (row) => row.diseaseAliases ?? undefined,
          highlight: true,
        },
        filter: {
          kind: 'text',
          var: 'diseaseAlias',
          placeholder: 'Filter Aliases',
        },
      },
      {
        key: 'features',
        label: 'Features',
        width: '300px',
        cell: {
          kind: 'custom',
          content: new PolymorpheusComponent(CvcDiseaseFeaturesCellComponent),
        },
        filter: {
          kind: 'text',
          var: 'featureName',
          placeholder: 'Filter Feature Names',
        },
      },
      {
        key: 'featureCount',
        label: 'Count',
        tooltip: 'Feature Count',
        width: '75px',
        fixed: 'right',
        align: 'right',
        cell: { kind: 'text', text: (row) => row.featureCount },
        sort: {
          column: DiseasesSortColumns.FeatureCount,
          directions: SORT_DESCEND_FIRST,
        },
      },
      {
        key: 'variantCount',
        label: 'Count',
        tooltip: 'Variant Count',
        width: '75px',
        fixed: 'right',
        align: 'right',
        cell: { kind: 'text', text: (row) => row.variantCount },
        sort: {
          column: DiseasesSortColumns.VariantCount,
          directions: SORT_DESCEND_FIRST,
        },
      },
      {
        key: 'evidenceItemCount',
        label: 'Count',
        tooltip: 'Evidence Count',
        width: '75px',
        fixed: 'right',
        align: 'right',
        cell: { kind: 'text', text: (row) => row.evidenceItemCount },
        sort: {
          column: DiseasesSortColumns.EvidenceItemCount,
          default: 'descend',
          directions: SORT_DESCEND_FIRST,
        },
      },
      {
        key: 'assertionCount',
        label: 'Count',
        tooltip: 'Assertion Count',
        width: '75px',
        fixed: 'right',
        align: 'right',
        cell: { kind: 'text', text: (row) => row.assertionCount },
        sort: {
          column: DiseasesSortColumns.AssertionCount,
          directions: SORT_DESCEND_FIRST,
        },
      },
    ],
  })
}

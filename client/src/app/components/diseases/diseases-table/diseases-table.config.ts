import { DiseasesSortColumns, Maybe } from '@app/generated/civic.apollo.types'
import { entityTableConfig, SORT_DESCEND_FIRST } from '@app/tables'
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
 * generic tag's popover for free. Features seeds the cache per row — the
 * server projects full `LinkableFeature` data (including `featureType`,
 * which the fragment requires) out of each browse row's feature list.
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
    entity: 'Disease',
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
        label: 'Disease',
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
          fullWidth: true,
          popoverPlacement: 'right',
        },
        sort: { column: DiseasesSortColumns.Name },
        filter: { kind: 'text', var: 'name', placeholder: 'Filter Disease Names' },
      },
      {
        key: 'doid',
        label: 'DOID',
        width: '100px',
        cell: {
          kind: 'external-link',
          // gated on doid, not just diseaseUrl: the external-link kind
          // falls back to rendering the href itself when `text` yields
          // nothing, so a row with a url but no doid would show the raw
          // url where the legacy table showed its empty state
          href: (row) => (row.doid ? row.diseaseUrl : undefined),
          text: (row) => row.doid ?? undefined,
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
          tooltip: true,
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
        width: '315px',
        cell: {
          kind: 'entity-tag',
          ref: (row) =>
            row.features.map((f) => ({
              __typename: 'Feature' as const,
              id: f.id,
            })),
          seed: (row) =>
            row.features.map((f) => ({
              __typename: 'Feature' as const,
              id: f.id,
              name: f.name,
              link: f.link,
              flagged: f.flagged,
              deprecated: f.deprecated,
              featureType: f.featureType,
            })),
          maxTags: 3,
          truncateLabel: '100px',
        },
        filter: {
          kind: 'text',
          var: 'featureName',
          placeholder: 'Filter Feature Names',
        },
      },
      {
        key: 'featureCount',
        label: '',
        tooltip: 'Feature Count',
        labelIcon: 'civic-feature',
        width: '55px',
        fixed: 'right',
        align: 'right',
        cell: { kind: 'count-tag', count: (row) => row.featureCount },
        sort: {
          column: DiseasesSortColumns.FeatureCount,
          directions: SORT_DESCEND_FIRST,
        },
      },
      {
        key: 'variantCount',
        label: '',
        tooltip: 'Variant Count',
        labelIcon: 'civic-variant',
        width: '55px',
        fixed: 'right',
        align: 'right',
        cell: { kind: 'count-tag', count: (row) => row.variantCount },
        sort: {
          column: DiseasesSortColumns.VariantCount,
          directions: SORT_DESCEND_FIRST,
        },
      },
      {
        key: 'evidenceItemCount',
        label: '',
        tooltip: 'Evidence Count',
        labelIcon: 'civic-evidence',
        width: '55px',
        fixed: 'right',
        align: 'right',
        cell: {
          kind: 'count-tag',
          count: (row) => row.evidenceItemCount,
          fetch: (row) => ({
            entity: 'EvidenceItem',
            scope: { diseaseId: row.id },
          }),
        },
        sort: {
          column: DiseasesSortColumns.EvidenceItemCount,
          default: 'descend',
          directions: SORT_DESCEND_FIRST,
        },
      },
      {
        key: 'assertionCount',
        label: '',
        tooltip: 'Assertion Count',
        labelIcon: 'civic-assertion',
        width: '55px',
        fixed: 'right',
        align: 'right',
        cell: {
          kind: 'count-tag',
          count: (row) => row.assertionCount,
          fetch: (row) => ({
            entity: 'Assertion',
            scope: { diseaseId: row.id },
          }),
        },
        sort: {
          column: DiseasesSortColumns.AssertionCount,
          directions: SORT_DESCEND_FIRST,
        },
      },
    ],
  })
}

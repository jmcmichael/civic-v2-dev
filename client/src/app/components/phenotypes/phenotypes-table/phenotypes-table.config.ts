import { Maybe, PhenotypeSortColumns } from '@app/generated/civic.apollo.types'
import { entityTableConfig } from '@app/tables'
import { PhenotypesBrowseGQL } from './phenotypes-table.query.gql.generated'

/** The query variables a host page scopes the table with. */
export interface PhenotypesTableScope {
  ids?: Maybe<number[]>
}

/**
 * The phenotypes browse table, as configuration.
 *
 * `BrowsePhenotype` is a flat aggregate type — it nests no other taggable
 * entity — but the row itself already satisfies `LinkablePhenotype` (id,
 * name, link), so the Name column addresses it as `Phenotype` and gets the
 * generic tag's popover for free (`TAG_POPOVERS` already has a `Phenotype`
 * entry, reusing the same `phenotype-popover.query.gql`/component the legacy
 * bespoke `cvc-phenotype-tag` embedded directly) — no framework changes
 * needed, just not reaching for a custom cell.
 *
 * HPO ID is an external link-out to the term on the Human Phenotype
 * Ontology site, not an in-app entity — `kind: 'external-link'`.
 */
export function phenotypesTableConfig(
  query: PhenotypesBrowseGQL,
  title: Maybe<string>,
  scope: PhenotypesTableScope = {}
) {
  return entityTableConfig({
    title: title ?? undefined,
    query,
    pageSize: 35,
    scope: {
      ids: scope.ids ?? undefined,
    },
    connection: (data) => data?.browsePhenotypes,
    columns: [
      {
        key: 'name',
        label: 'Name',
        width: '350px',
        fixed: 'left',
        cell: {
          kind: 'entity-tag',
          ref: (row) => ({ __typename: 'Phenotype' as const, id: row.id }),
          seed: (row) => ({
            __typename: 'Phenotype' as const,
            id: row.id,
            name: row.name,
            link: row.link,
          }),
          popoverPlacement: 'right',
        },
        sort: { column: PhenotypeSortColumns.Name },
        filter: { kind: 'text', var: 'name', placeholder: 'Filter Name' },
      },
      {
        key: 'hpoId',
        label: 'HPO ID',
        width: '150px',
        cell: {
          kind: 'external-link',
          href: (row) => row.url,
          text: (row) => row.hpoId,
        },
        sort: { column: PhenotypeSortColumns.HpoId },
        filter: { kind: 'text', var: 'hpoId', placeholder: 'Filter HPO ID' },
      },
      {
        key: 'evidenceCount',
        label: 'Count',
        tooltip: 'Evidence Count',
        width: '75px',
        fixed: 'right',
        align: 'right',
        cell: { kind: 'text', text: (row) => row.evidenceCount },
        sort: {
          column: PhenotypeSortColumns.EvidenceItemCount,
          default: 'descend',
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
        sort: { column: PhenotypeSortColumns.AssertionCount },
      },
    ],
  })
}

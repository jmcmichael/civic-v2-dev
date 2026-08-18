import { Maybe, TherapySortColumns } from '@app/generated/civic.apollo.types'
import { entityTableConfig, SORT_DESCEND_FIRST } from '@app/tables'
import { TherapiesBrowseGQL } from './therapies-table.query.gql.generated'

/** The query variables a host page scopes the table with. */
export interface TherapiesTableScope {
  ids?: Maybe<number[]>
}

/**
 * The therapies browse table, as configuration.
 *
 * `BrowseTherapy` satisfies `LinkableTherapy` directly (id, name, link,
 * deprecated all present at the row's own top level), so Name addresses
 * it as `Therapy` and gets the generic tag's popover for free.
 *
 * NCIt Code links out to the term on the NCI Thesaurus, not an in-app
 * entity — `kind: 'external-link'`. Aliases is plain text with
 * filter-match highlighting, same pattern as diseases'/variants' alias
 * columns.
 */
export function therapiesTableConfig(
  query: TherapiesBrowseGQL,
  title: Maybe<string>,
  scope: TherapiesTableScope = {}
) {
  return entityTableConfig({
    title: title ?? undefined,
    query,
    pageSize: 35,
    scope: {
      ids: scope.ids ?? undefined,
    },
    connection: (data) => data?.browseTherapies,
    columns: [
      {
        key: 'name',
        label: 'Name',
        width: '400px',
        fixed: 'left',
        cell: {
          kind: 'entity-tag',
          ref: (row) => ({ __typename: 'Therapy' as const, id: row.id }),
          seed: (row) => ({
            __typename: 'Therapy' as const,
            id: row.id,
            name: row.name,
            link: row.link,
            deprecated: row.deprecated,
          }),
          fullWidth: true,
          popoverPlacement: 'right',
        },
        sort: { column: TherapySortColumns.Name },
        filter: { kind: 'text', var: 'name', placeholder: 'Filter Name' },
      },
      {
        key: 'ncitId',
        label: 'NCIt Code',
        width: '120px',
        cell: {
          kind: 'external-link',
          href: (row) => row.therapyUrl,
          text: (row) => row.ncitId,
        },
        sort: { column: TherapySortColumns.NcitId },
        filter: {
          kind: 'text',
          var: 'ncitId',
          placeholder: 'Filter NCIt Code',
        },
      },
      {
        key: 'therapyAliases',
        label: 'Aliases',
        width: '250px',
        cell: {
          kind: 'text',
          text: (row) => row.therapyAliases ?? undefined,
          highlight: true,
        },
        filter: {
          kind: 'text',
          var: 'therapyAlias',
          placeholder: 'Filter Aliases',
        },
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
          column: TherapySortColumns.EvidenceItemCount,
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
          column: TherapySortColumns.AssertionCount,
          directions: SORT_DESCEND_FIRST,
        },
      },
    ],
  })
}

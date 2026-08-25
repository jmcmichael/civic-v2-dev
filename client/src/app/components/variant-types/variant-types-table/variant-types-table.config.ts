import {
  Maybe,
  VariantTypeSortColumns,
} from '@app/generated/civic.apollo.types'
import { entityTableConfig } from '@app/tables'
import { VariantTypesBrowseGQL } from './variant-types-table.query.gql.generated'

/** The query variables a host page scopes the table with. */
export interface VariantTypesTableScope {
  ids?: Maybe<number[]>
}

/**
 * The variant types browse table, as configuration.
 *
 * `BrowseVariantType` nests no other taggable entity, and the row already
 * satisfies `LinkableVariantType` (id, name, link), so the Name column
 * addresses it as `VariantType` and gets the generic tag's popover for free
 * (`TAG_POPOVERS` already has a `VariantType` entry) — same shape as
 * `phenotypes-table.config.ts`, not a coincidence: it is the recipe.
 *
 * SOID links out to the term on sequenceontology.org, not an in-app entity —
 * `kind: 'external-link'`.
 */
export function variantTypesTableConfig(
  query: VariantTypesBrowseGQL,
  title: Maybe<string>,
  scope: VariantTypesTableScope = {}
) {
  return entityTableConfig({
    title: title ?? undefined,
    query,
    pageSize: 35,
    scope: {
      ids: scope.ids ?? undefined,
    },
    connection: (data) => data?.variantTypes,
    columns: [
      {
        key: 'name',
        label: 'Name',
        width: '450px',
        fixed: 'left',
        cell: {
          kind: 'entity-tag',
          ref: (row) => ({ __typename: 'VariantType' as const, id: row.id }),
          seed: (row) => ({
            __typename: 'VariantType' as const,
            id: row.id,
            name: row.name,
            link: row.link,
          }),
        },
        sort: { column: VariantTypeSortColumns.Name },
        filter: { kind: 'text', var: 'name', placeholder: 'Filter Name' },
      },
      {
        key: 'soid',
        label: 'SOID',
        width: '150px',
        cell: {
          kind: 'external-link',
          href: (row) => row.url,
          text: (row) => row.soid,
          tooltip: 'View on sequenceontology.org',
        },
        sort: { column: VariantTypeSortColumns.Soid },
        filter: { kind: 'text', var: 'soid', placeholder: 'Filter SOID' },
      },
      {
        key: 'variantCount',
        label: 'Count',
        tooltip: 'Variant Count',
        width: '75px',
        fixed: 'right',
        align: 'right',
        cell: { kind: 'text', text: (row) => row.variantCount },
        sort: { column: VariantTypeSortColumns.VariantCount },
      },
    ],
  })
}

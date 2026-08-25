import { VariantsSortColumns } from '@app/generated/civic.apollo.types'
import { entityTableConfig } from '@app/tables'
import { VariantManagerGQL } from './variant-manager.query.gql.generated'

/**
 * The variant manager's table, as configuration.
 *
 * `filter.var` and `sort.column` are checked against the query's generated
 * types, so a filter or sorter cannot silently name a variable or column the
 * query does not have — `variant-manager.config.spec.ts` additionally pins
 * that every filter variable is declared *and* reaches a field.
 *
 * `aliases` deliberately declares no sort: `VariantsSortColumns` has no alias
 * member, so the column is not sortable and cannot claim to be (a sorter
 * sending `sortBy: { column: undefined }` fails the whole query).
 *
 * Rows are `BrowseVariant`s, which flatten their entities into scalar columns,
 * so the entity-tag columns declare `seed` projections — see
 * `CvcEntityTagCell.seed`.
 */
export function variantManagerConfig(query: VariantManagerGQL) {
  return entityTableConfig({
    entity: 'Variant',
    title: 'Use checkboxes to select or deselect Variants',
    query,
    pageSize: 50,
    connection: (data) => data?.browseVariants,
    columns: [
      {
        // no label: the header is 25px wide, so any text is clipped
        key: 'selected',
        label: '',
        width: '25px',
        align: 'center',
        fixed: 'left',
        omitFromPrefs: true,
        cell: { kind: 'select' },
      },
      {
        key: 'variant',
        label: 'Variant',
        width: '215px',
        fixed: 'left',
        // ref is identity only — cvc-tag renders from the Apollo cache; the
        // `seed` below writes Variant:<id> so the tag can resolve it
        cell: {
          kind: 'entity-tag',
          ref: (row) => ({ __typename: 'Variant' as const, id: row.id }),
          seed: (row) => ({
            __typename: 'Variant' as const,
            id: row.id,
            name: row.name,
            link: row.link,
            flagged: row.flagged,
            deprecated: row.deprecated,
          }),
          fullWidth: true,
          truncateLabel: '200px',
        },
        sort: { column: VariantsSortColumns.VariantName, default: 'ascend' },
        filter: {
          kind: 'text',
          var: 'variantName',
          placeholder: 'Filter Variant Name',
        },
      },
      {
        key: 'aliases',
        label: 'Aliases',
        width: '150px',
        cell: {
          kind: 'text',
          text: (row) => row.aliases.map((alias) => alias.name),
          highlight: true,
        },
        // no VariantsSortColumns member exists for aliases; see the doc above
        filter: {
          kind: 'text',
          var: 'variantAlias',
          placeholder: 'Filter Aliases',
        },
      },
      {
        key: 'feature',
        label: 'Feature',
        width: '135px',
        cell: {
          kind: 'entity-tag',
          ref: (row) => ({ __typename: 'Feature' as const, id: row.featureId }),
          // `category` stands in for featureType: VariantCategories and
          // FeatureInstanceTypes have identical members, and a variant's
          // category is its feature's type. LinkableFeature selects the field
          // but nothing reads it — it exists only to make `complete` true.
          seed: (row) => ({
            __typename: 'Feature' as const,
            id: row.featureId,
            name: row.featureName,
            link: row.featureLink,
            flagged: row.featureFlagged,
            deprecated: row.featureDeprecated,
            featureType: row.category,
          }),
          truncateLabel: '125px',
        },
        sort: { column: VariantsSortColumns.FeatureName },
        filter: {
          kind: 'text',
          var: 'featureName',
          placeholder: 'Filter Feature Name',
        },
      },
      {
        key: 'diseases',
        label: 'Diseases',
        width: '250px',
        cell: {
          kind: 'entity-tag',
          ref: (row) => row.diseases,
          maxTags: 1,
          truncateLabel: '175px',
        },
        sort: { column: VariantsSortColumns.DiseaseName },
        filter: {
          kind: 'text',
          var: 'diseaseName',
          placeholder: 'Filter Disease Names',
          entityTypename: 'Disease',
        },
      },
      {
        key: 'therapies',
        label: 'Therapies',
        width: '275px',
        cell: {
          kind: 'entity-tag',
          ref: (row) => row.therapies,
          maxTags: 2,
          truncateLabel: '150px',
        },
        sort: { column: VariantsSortColumns.TherapyName },
        filter: {
          kind: 'text',
          var: 'therapyName',
          placeholder: 'Filter Therapy Names',
          entityTypename: 'Therapy',
        },
      },
    ],
  })
}

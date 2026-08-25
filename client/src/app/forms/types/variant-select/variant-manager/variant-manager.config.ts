import { VariantsSortColumns } from '@app/generated/civic.apollo.types'
import { entityTableConfig } from '@app/tables'
import { writeCachedEntity } from '@app/tags'
import { Apollo } from 'apollo-angular'
import {
  VariantManagerFieldsFragment,
  VariantManagerGQL,
} from './variant-manager.query.gql.generated'

/**
 * The variant manager's table, as configuration.
 *
 * Replaces `VariantManagerConfig` — a class that built a column array, then
 * walked it attaching a `BehaviorSubject` to every sort and filter, and
 * published two arrays of streams for the component to `combineLatest`. The
 * column array is all that is left; the streams were the mechanism by which a
 * filter's value lived in a mutated config object, which is why resetting the
 * table never cleared its own inputs.
 *
 * Three lookup tables also go, replaced by fields the compiler checks:
 *
 * - `columnKeyToSortColumnMap` -> `sort.column`, typed `VariantsSortColumns`
 * - `columnKeyToQueryVariableMap` -> `filter.var`, typed `keyof` this query's
 *   variables
 * - `omittedFromPrefs` -> the per-column `omitFromPrefs` flag
 *
 * That retypes one live bug out of existence: `aliases` declared `sort: {}`
 * with no entry in the sort map, so clicking its sorter sent
 * `sortBy: { column: undefined }` against a non-null `VariantsSort.column` and
 * failed the whole query. There is no alias member in `VariantsSortColumns` —
 * the column is not sortable, and now cannot claim to be.
 */
export function variantManagerConfig(query: VariantManagerGQL, apollo: Apollo) {
  return entityTableConfig({
    title: 'Use checkboxes to select or deselect Variants',
    query,
    // the managers sent no `first` at all, so the first page silently took the
    // server's default of 100 while every page after it was 50
    pageSize: 50,
    connection: (data) => data?.browseVariants,
    seedCache: (rows) => rows.forEach((row) => seedRowEntities(apollo, row)),
    columns: [
      {
        // no label: the header is 25px wide, so any text is clipped to a
        // fragment. The old config said 'Select' and never rendered it — the
        // select column had its own <th> branch with no label at all.
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
        emptyValue: 'unspecified',
        // identity only: cvc-tag renders from the Apollo cache, so the name and
        // link the old row projection carried here were never read. The manager
        // seeds Variant:<id> from the row instead.
        cell: {
          kind: 'entity-tag',
          ref: (row) => ({ __typename: 'Variant' as const, id: row.id }),
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
        emptyValue: 'unspecified',
        cell: {
          kind: 'text',
          text: (row) => row.aliases.map((alias) => alias.name),
          highlight: true,
        },
        // no VariantsSortColumns member exists for aliases; see the class note
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
        emptyValue: 'unspecified',
        cell: {
          kind: 'entity-tag',
          ref: (row) => ({ __typename: 'Feature' as const, id: row.featureId }),
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
        emptyValue: 'unspecified',
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
        emptyValue: 'unspecified',
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

/**
 * Writes a row's variant and feature into the cache under the fragments
 * `cvc-tag` reads them from.
 *
 * Without this the Variant and Feature columns render `#<id>` skeletons:
 * `browseVariants` normalises to `BrowseVariant:<id>`, so `Variant:<id>` and
 * `Feature:<id>` are cache misses. Diseases and Therapies come back as real
 * nested entities and have always rendered — the contrast is the whole
 * diagnosis.
 *
 * Both writes must satisfy their fragment exactly; `watchFragment` treats one
 * missing field as an incomplete entity and the tag stays a skeleton.
 * `category` stands in for the feature's `featureType`, since
 * `VariantCategories` and `FeatureInstanceTypes` have identical members and a
 * variant's category is its feature's type. That avoids removing an unread
 * field from the shared `LinkableFeature` fragment — nothing reads
 * `featureType` off it; it exists only to make `complete` true.
 */
function seedRowEntities(
  apollo: Apollo,
  row: VariantManagerFieldsFragment
): void {
  writeCachedEntity(apollo, 'Variant', {
    __typename: 'Variant',
    id: row.id,
    name: row.name,
    link: row.link,
    flagged: row.flagged,
    deprecated: row.deprecated,
  })
  writeCachedEntity(apollo, 'Feature', {
    __typename: 'Feature',
    id: row.featureId,
    name: row.featureName,
    link: row.featureLink,
    flagged: row.featureFlagged,
    deprecated: row.featureDeprecated,
    featureType: row.category,
  })
}

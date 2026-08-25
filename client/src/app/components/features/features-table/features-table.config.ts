import { TitleCasePipe } from '@angular/common'
import {
  FeatureInstanceTypes,
  FeaturesSortColumns,
  Maybe,
} from '@app/generated/civic.apollo.types'
import { entityTableConfig, SORT_DESCEND_FIRST } from '@app/tables'
import { BrowseFeaturesGQL } from './features-table.query.gql.generated'

const titlecase = new TitleCasePipe()

/**
 * `enumFilterOptions()`'s `InputEnum` is closed over the evidence/variant/
 * assertion domain enums `formatEvidenceEnum` knows how to label --
 * `FeatureInstanceTypes` isn't one of them (same reasoning as users-table's
 * hand-built role options). Built by hand with the same titlecase
 * formatting the Type column's own text cell uses.
 */
const FEATURE_TYPE_OPTIONS = Object.values(FeatureInstanceTypes).map(
  (value) => ({
    label: titlecase.transform(value),
    value,
  })
)

/** The query variables a host page scopes the table with. */
export interface FeaturesTableScope {
  ids?: Maybe<number[]>
}

/**
 * The features browse table, as configuration.
 *
 * `BrowseFeature` satisfies `LinkableFeature` directly (id, name, link,
 * flagged, deprecated all present at the row's own top level;
 * `featureInstanceType` stands in for `featureType` — the same
 * FeatureInstanceTypes/VariantCategories drift guard variants-table's
 * `category` substitution relies on applies here too), so Name addresses
 * it as `Feature` and gets the generic tag's popover for free.
 *
 * Diseases and Therapies arrive as real nested `Disease`/`Therapy`
 * entities with every `Linkable*` field already selected, so they
 * normalise on their own — no `seed` needed, same as variants-table's
 * disease/therapy columns.
 */
export function featuresTableConfig(
  query: BrowseFeaturesGQL,
  title: Maybe<string>,
  scope: FeaturesTableScope = {}
) {
  return entityTableConfig({
    title: title ?? undefined,
    query,
    pageSize: 35,
    scope: {
      ids: scope.ids ?? undefined,
    },
    connection: (data) => data?.browseFeatures,
    columns: [
      {
        key: 'name',
        label: 'Name',
        width: '150px',
        fixed: 'left',
        cell: {
          kind: 'entity-tag',
          ref: (row) => ({ __typename: 'Feature' as const, id: row.id }),
          seed: (row) => ({
            __typename: 'Feature' as const,
            id: row.id,
            name: row.name,
            link: row.link,
            flagged: row.flagged,
            deprecated: row.deprecated,
            featureType: row.featureInstanceType,
          }),
          fullWidth: true,
          popoverPlacement: 'right',
        },
        sort: { column: FeaturesSortColumns.FeatureName },
        filter: {
          kind: 'text',
          var: 'featureName',
          placeholder: 'Filter Name',
        },
      },
      {
        key: 'fullName',
        label: 'Full Name',
        width: '150px',
        fixed: 'left',
        cell: {
          kind: 'text',
          text: (row) => titlecase.transform(row.fullName) ?? undefined,
          tooltip: true,
        },
        sort: { column: FeaturesSortColumns.FeatureFullName },
        filter: {
          kind: 'text',
          var: 'featureFullName',
          placeholder: 'Filter Full Name',
        },
      },
      {
        key: 'featureInstanceType',
        label: 'Type',
        width: '90px',
        cell: {
          kind: 'text',
          text: (row) =>
            titlecase.transform(row.featureInstanceType) ?? undefined,
        },
        filter: {
          kind: 'enum',
          control: 'select',
          placeholder: 'Any',
          var: 'featureType',
          options: FEATURE_TYPE_OPTIONS,
          showIcons: false,
        },
      },
      {
        key: 'featureAliases',
        label: 'Aliases',
        width: '200px',
        cell: {
          kind: 'text',
          text: (row) => row.featureAliases ?? undefined,
          highlight: true,
          tooltip: true,
        },
        filter: {
          kind: 'text',
          var: 'featureAlias',
          placeholder: 'Filter Aliases',
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
        },
        filter: {
          kind: 'text',
          var: 'diseaseName',
          placeholder: 'Filter Disease Names',
        },
      },
      {
        key: 'therapies',
        label: 'Therapies',
        width: '225px',
        cell: {
          kind: 'entity-tag',
          ref: (row) => row.therapies,
          maxTags: 1,
        },
        filter: {
          kind: 'text',
          var: 'therapyName',
          placeholder: 'Filter Therapy Names',
        },
      },
      {
        key: 'molecularProfileCount',
        label: 'Ct.',
        tooltip: 'Molecular Profile Count',
        labelSecondary: true,
        labelIcon: 'civic-molecularprofile',
        width: '70px',
        fixed: 'right',
        align: 'right',
        cell: { kind: 'text', text: (row) => row.molecularProfileCount },
        sort: {
          column: FeaturesSortColumns.MolecularProfileCount,
          directions: SORT_DESCEND_FIRST,
        },
      },
      {
        key: 'variantCount',
        label: 'Ct.',
        tooltip: 'Variant Count',
        labelSecondary: true,
        labelIcon: 'civic-variant',
        width: '70px',
        fixed: 'right',
        align: 'right',
        cell: { kind: 'text', text: (row) => row.variantCount },
        sort: {
          column: FeaturesSortColumns.VariantCount,
          default: 'descend',
          directions: SORT_DESCEND_FIRST,
        },
      },
      {
        key: 'evidenceItemCount',
        label: 'Ct.',
        tooltip: 'Evidence Count',
        labelSecondary: true,
        labelIcon: 'civic-evidence',
        width: '70px',
        fixed: 'right',
        align: 'right',
        cell: { kind: 'text', text: (row) => row.evidenceItemCount },
        sort: {
          column: FeaturesSortColumns.EvidenceItemCount,
          directions: SORT_DESCEND_FIRST,
        },
      },
      {
        key: 'assertionCount',
        label: 'Ct.',
        tooltip: 'Assertion Count',
        labelSecondary: true,
        labelIcon: 'civic-assertion',
        width: '70px',
        fixed: 'right',
        align: 'right',
        cell: { kind: 'text', text: (row) => row.assertionCount },
        sort: {
          column: FeaturesSortColumns.AssertionCount,
          directions: SORT_DESCEND_FIRST,
        },
      },
    ],
  })
}

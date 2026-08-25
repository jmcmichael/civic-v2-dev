import { formatEvidenceEnum } from '@app/core/utilities/enum-formatters/format-evidence-enum'
import {
  Maybe,
  VariantCategories,
  VariantsSortColumns,
} from '@app/generated/civic.apollo.types'
import {
  entityTableConfig,
  enumFilterOptions,
  SORT_DESCEND_FIRST,
} from '@app/tables'
import { BrowseVariantsGQL } from './variants-table.query.gql.generated'

/**
 * The query variables a host page scopes the table with. `hasNoVariantType`
 * carries the legacy Variant Types "None" header filter, now a toolbar
 * toggle in the facade.
 */
export interface VariantsTableScope {
  ids?: Maybe<number[]>
  variantTypeId?: Maybe<number>
  variantGroupId?: Maybe<number>
  hasNoVariantType?: Maybe<boolean>
}

/**
 * The variants browse table, as configuration — the browse twin of
 * `variant-manager.config.ts`, plus the browse-only columns (feature-type
 * category, variant types, evidence count) and the host-scoped variables.
 *
 * `aliases` deliberately declares no sort: `VariantsSortColumns` has no alias
 * member, so the column is not sortable and cannot claim to be.
 *
 * Rows are `BrowseVariant`s, which flatten the variant and its feature into
 * scalar columns, so those two columns declare `seed` projections; diseases,
 * therapies and variant types arrive as real nested entities and normalise
 * on their own (see `CvcEntityTagCell.seed`).
 */
export function variantsTableConfig(
  query: BrowseVariantsGQL,
  title: Maybe<string>,
  scope: VariantsTableScope = {}
) {
  return entityTableConfig({
    title: title ?? undefined,
    query,
    pageSize: 35,
    scope: {
      ids: scope.ids ?? undefined,
      variantTypeId: scope.variantTypeId ?? undefined,
      variantGroupId: scope.variantGroupId ?? undefined,
      // absent rather than false: a cleared toggle must not reach the resolver
      hasNoVariantType: scope.hasNoVariantType || undefined,
    },
    connection: (data) => data?.browseVariants,
    columns: [
      {
        key: 'variant',
        label: 'Variant',
        width: '150px',
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
          truncateLabel: '125px',
        },
        sort: { column: VariantsSortColumns.VariantName },
        filter: {
          kind: 'text',
          var: 'variantName',
          placeholder: 'Filter Variant Name',
        },
      },
      {
        key: 'category',
        label: 'Type',
        tooltip: 'Feature Type',
        labelIcon: 'civic-feature',
        width: '130px',
        fixed: 'left',
        cell: { kind: 'text', text: (row) => formatEvidenceEnum(row.category) },
        filter: {
          kind: 'enum',
          control: 'select',
          placeholder: 'Select Type',
          var: 'category',
          options: enumFilterOptions(VariantCategories),
          // no civic-* icons exist for the feature categories
          showIcons: false,
        },
      },
      {
        key: 'feature',
        label: 'Feature',
        width: '110px',
        cell: {
          kind: 'entity-tag',
          ref: (row) => ({ __typename: 'Feature' as const, id: row.featureId }),
          // `category` stands in for featureType — see the identical seed in
          // variant-manager.config.ts for the enum-identity reasoning
          seed: (row) => ({
            __typename: 'Feature' as const,
            id: row.featureId,
            name: row.featureName,
            link: row.featureLink,
            flagged: row.featureFlagged,
            deprecated: row.featureDeprecated,
            featureType: row.category,
          }),
          truncateLabel: '100px',
        },
        sort: { column: VariantsSortColumns.FeatureName },
        filter: {
          kind: 'text',
          var: 'featureName',
          placeholder: 'Filter Feature Name',
        },
      },
      {
        key: 'aliases',
        label: 'Variant Aliases',
        width: '170px',
        cell: {
          kind: 'text',
          text: (row) => row.aliases.map((alias) => alias.name),
          highlight: true,
          tooltip: true,
        },
        filter: {
          kind: 'text',
          var: 'variantAlias',
          placeholder: 'Filter Aliases',
        },
      },
      {
        key: 'variantTypes',
        label: 'Variant Types',
        width: '180px',
        cell: {
          kind: 'entity-tag',
          // the schema types these LinkableVariantType, a slim projection —
          // the ref readdresses them as the VariantType the tag spec knows,
          // and the seed writes that entity so the tag can resolve it
          ref: (row) =>
            row.variantTypes.map((vt) => ({
              __typename: 'VariantType' as const,
              id: vt.id,
            })),
          seed: (row) =>
            row.variantTypes.map((vt) => ({
              __typename: 'VariantType' as const,
              id: vt.id,
              name: vt.name,
              link: vt.link,
            })),
          maxTags: 1,
          truncateLabel: '125px',
        },
        filter: {
          kind: 'text',
          var: 'variantTypeName',
          placeholder: 'Filter Type Names',
        },
      },
      {
        key: 'diseases',
        label: 'Diseases',
        width: '200px',
        cell: {
          kind: 'entity-tag',
          ref: (row) => row.diseases,
          maxTags: 1,
          truncateLabel: '150px',
        },
        sort: { column: VariantsSortColumns.DiseaseName },
        filter: {
          kind: 'text',
          var: 'diseaseName',
          placeholder: 'Filter Disease Names',
        },
      },
      {
        key: 'therapies',
        label: 'Therapies',
        width: '180px',
        cell: {
          kind: 'entity-tag',
          ref: (row) => row.therapies,
          maxTags: 1,
          truncateLabel: '125px',
        },
        sort: { column: VariantsSortColumns.TherapyName },
        filter: {
          kind: 'text',
          var: 'therapyName',
          placeholder: 'Filter Therapy Names',
        },
      },
      {
        key: 'evidenceCount',
        label: '',
        tooltip: 'Evidence Count',
        labelIcon: 'civic-evidence',
        width: '55px',
        fixed: 'right',
        align: 'right',
        cell: { kind: 'text', text: (row) => row.evidenceItemCount },
        sort: {
          column: VariantsSortColumns.EvidenceItemCount,
          default: 'descend',
          directions: SORT_DESCEND_FIRST,
        },
      },
    ],
  })
}

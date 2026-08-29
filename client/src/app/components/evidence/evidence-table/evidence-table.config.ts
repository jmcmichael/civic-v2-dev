import { EnumToTitlePipe } from '@app/core/pipes/enum-to-title-pipe'
import { evidenceEnumDisplay } from '@app/core/pipes/evidence-enum-display-type'
import {
  EvidenceDirection,
  EvidenceLevel,
  EvidenceSignificance,
  EvidenceSortColumns,
  EvidenceStatusFilter,
  EvidenceType,
  Maybe,
  OrganizationFilter,
  TherapyInteraction,
  VariantOrigin,
} from '@app/generated/civic.apollo.types'
import {
  CVC_ATTRIBUTE_COLUMNS,
  CvcEnumOption,
  entityTableConfig,
  enumFilterOptions,
  SORT_DESCEND_FIRST,
} from '@app/tables'
import { EvidenceBrowseGQL } from './evidence-table.query.gql.generated'

const enumToTitle = new EnumToTitlePipe()

/** an EID typed with or without its prefix; anything else matches nothing */
const EID_PATTERN = /^(?:EID)?(\d+)$/i

/** the star ratings, which are numbers rather than a schema enum */
const RATING_OPTIONS = [1, 2, 3, 4, 5].map((stars) => ({
  label: `${stars} stars`,
  value: stars,
}))

/**
 * The status funnel's choices, hand-ordered from the baseline outward (the
 * generated enum would alphabetize). Shared with the assertions table, whose
 * status filter is this same enum.
 *
 * Labelled through `enumToTitle` rather than by hand: `enumFilterOptions()`
 * cannot label this one — `EvidenceStatusFilter` is a browse-input enum, not
 * one of the domain enums `formatEvidenceEnum` closes over.
 */
export const EVIDENCE_STATUS_FILTER_OPTIONS: CvcEnumOption<EvidenceStatusFilter>[] =
  [
    EvidenceStatusFilter.NonRejected,
    EvidenceStatusFilter.Accepted,
    EvidenceStatusFilter.Submitted,
    EvidenceStatusFilter.Rejected,
    EvidenceStatusFilter.All,
  ].map((value) => ({ label: enumToTitle.transform(value), value }))

/**
 * The query variables a host page scopes the table with. Every embed passes
 * at most one entity id plus a title; `status` defaults to NON_REJECTED the
 * way the legacy table always has, and `organization` carries the org pages'
 * include-subgroups choice.
 */
export interface EvidenceTableScope {
  assertionId?: Maybe<number>
  clinicalTrialId?: Maybe<number>
  diseaseId?: Maybe<number>
  therapyId?: Maybe<number>
  phenotypeId?: Maybe<number>
  sourceId?: Maybe<number>
  userId?: Maybe<number>
  variantId?: Maybe<number>
  molecularProfileId?: Maybe<number>
  ids?: Maybe<number[]>
  organization?: Maybe<OrganizationFilter>
  status?: Maybe<EvidenceStatusFilter>
}

/**
 * The evidence browse table, as configuration — the browse twin of
 * `evidence-manager.config.ts`: no select column, a variant-origin column
 * the manager lacks, the browse query's own variable names (`evidenceRating`
 * rather than the manager's `rating`), and the host-scoped variables.
 *
 * No `seed` on any entity-tag column: `evidenceItems` returns real
 * `EvidenceItem`s whose entities normalise into the cache on their own.
 *
 * The molecular-profile column is `hidden` when the host embeds the table on
 * a molecular-profile page — every row would name the page itself.
 */
export function evidenceTableConfig(
  query: EvidenceBrowseGQL,
  title: Maybe<string>,
  scope: EvidenceTableScope = {},
  options: { displayMolecularProfile?: boolean } = {}
) {
  return entityTableConfig({
    entity: 'Evidence',
    title: title ?? undefined,
    query,
    pageSize: 35,
    scope: {
      assertionId: scope.assertionId ?? undefined,
      clinicalTrialId: scope.clinicalTrialId ?? undefined,
      diseaseId: scope.diseaseId ?? undefined,
      therapyId: scope.therapyId ?? undefined,
      phenotypeId: scope.phenotypeId ?? undefined,
      sourceId: scope.sourceId ?? undefined,
      userId: scope.userId ?? undefined,
      variantId: scope.variantId ?? undefined,
      molecularProfileId: scope.molecularProfileId ?? undefined,
      ids: scope.ids ?? undefined,
      organization: scope.organization ?? undefined,
      status: scope.status ?? EvidenceStatusFilter.NonRejected,
    },
    connection: (data) => data?.evidenceItems,
    columns: [
      {
        key: 'id',
        label: 'Evidence',
        width: '100px',
        fixed: 'left',
        omitFromPrefs: true,
        cell: {
          kind: 'entity-tag',
          ref: (row) => ({ __typename: 'EvidenceItem' as const, id: row.id }),
          fullWidth: true,
          popoverPlacement: 'right',
        },
        sort: { column: EvidenceSortColumns.Id },
        filter: {
          kind: 'text',
          var: 'id',
          placeholder: 'EID',
          // 'EID123' and '123' both mean 123; anything else clears the filter
          transform: (value) => {
            const match = value?.toString().trim().match(EID_PATTERN)
            return match ? +match[1] : null
          },
        },
        // the status funnel shares its variable with the scope: cleared, the
        // scope's baseline (NON_REJECTED unless the host sets one) stands.
        // Meaningless when the host pins explicit ids, so omitted there.
        ...(scope.ids?.length
          ? {}
          : {
              extraFilter: {
                kind: 'enum' as const,
                var: 'status' as const,
                showIcons: false,
                options: EVIDENCE_STATUS_FILTER_OPTIONS,
              },
            }),
      },
      {
        key: 'molecularProfile',
        label: 'Molecular Profile',
        width: '320px',
        hidden: !(options.displayMolecularProfile ?? true),
        cell: {
          kind: 'entity-tag',
          ref: (row) => row.molecularProfile,
          truncateLabel: '250px',
        },
        sort: { column: EvidenceSortColumns.MolecularProfileName },
        filter: {
          kind: 'text',
          var: 'molecularProfileName',
          placeholder: 'Filter Molecular Profiles',
        },
      },
      {
        key: 'disease',
        label: 'Disease',
        width: '300px',
        cell: {
          kind: 'entity-tag',
          ref: (row) => row.disease,
          truncateLabel: '250px',
        },
        sort: { column: EvidenceSortColumns.DiseaseName },
        filter: {
          kind: 'text',
          var: 'diseaseName',
          placeholder: 'Filter Disease Names',
        },
      },
      {
        key: 'therapies',
        label: 'Therapies',
        width: '350px',
        cell: {
          kind: 'entity-tag',
          ref: (row) => row.therapies,
          maxTags: 2,
          truncateLabel: '150px',
        },
        sort: { column: EvidenceSortColumns.TherapyName },
        filter: {
          kind: 'text',
          var: 'therapyName',
          placeholder: 'Filter Therapy Names',
        },
        // the legacy INT column, folded in: interaction type filters from a
        // funnel beside the therapy-name input (the value itself shows in
        // evidence popovers)
        extraFilter: {
          kind: 'enum',
          var: 'therapyInteractionType',
          options: enumFilterOptions(TherapyInteraction),
        },
      },
      {
        ...CVC_ATTRIBUTE_COLUMNS.Evidence.description,
        // a narrow fixed-tag column: widening only pads the compact tag
        resizable: false,
        fixed: 'right',
        cell: { kind: 'text-tag', text: (row) => row.description },
        sort: { column: EvidenceSortColumns.Description },
        filter: {
          kind: 'text',
          var: 'description',
          placeholder: 'Search Descriptions',
        },
      },
      {
        ...CVC_ATTRIBUTE_COLUMNS.Evidence.evidenceLevel,
        fixed: 'right',
        cell: {
          kind: 'enum-tag',
          value: (row) => row.evidenceLevel,
          tooltip: (row) => evidenceEnumDisplay(row.evidenceLevel),
        },
        sort: { column: EvidenceSortColumns.EvidenceLevel },
        filter: {
          kind: 'enum',
          var: 'evidenceLevels',
          options: enumFilterOptions(EvidenceLevel),
          control: 'icon-select',
          multiple: true,
        },
      },
      {
        ...CVC_ATTRIBUTE_COLUMNS.Evidence.evidenceType,
        fixed: 'right',
        cell: {
          kind: 'enum-tag',
          value: (row) => row.evidenceType,
          tooltip: (row) => evidenceEnumDisplay(row.evidenceType),
        },
        sort: { column: EvidenceSortColumns.EvidenceType },
        filter: {
          kind: 'enum',
          var: 'evidenceTypes',
          options: enumFilterOptions(EvidenceType),
          control: 'icon-select',
          multiple: true,
        },
      },
      {
        ...CVC_ATTRIBUTE_COLUMNS.Evidence.evidenceDirection,
        fixed: 'right',
        cell: {
          kind: 'enum-tag',
          value: (row) => row.evidenceDirection,
          tooltip: (row) => evidenceEnumDisplay(row.evidenceDirection),
        },
        sort: { column: EvidenceSortColumns.EvidenceDirection },
        filter: {
          kind: 'enum',
          var: 'evidenceDirections',
          options: enumFilterOptions(EvidenceDirection),
          control: 'icon-select',
          multiple: true,
        },
      },
      {
        ...CVC_ATTRIBUTE_COLUMNS.Evidence.significance,
        fixed: 'right',
        cell: {
          kind: 'enum-tag',
          value: (row) => row.significance,
          tooltip: (row) => evidenceEnumDisplay(row.significance),
        },
        sort: { column: EvidenceSortColumns.Significance },
        filter: {
          kind: 'enum',
          var: 'significances',
          options: enumFilterOptions(EvidenceSignificance),
          control: 'icon-select',
          multiple: true,
        },
      },
      {
        ...CVC_ATTRIBUTE_COLUMNS.Evidence.variantOrigin,
        fixed: 'right',
        cell: {
          kind: 'enum-tag',
          value: (row) => row.variantOrigin,
          tooltip: (row) => evidenceEnumDisplay(row.variantOrigin),
        },
        sort: { column: EvidenceSortColumns.VariantOrigin },
        filter: {
          kind: 'enum',
          var: 'variantOrigins',
          options: enumFilterOptions(VariantOrigin),
          control: 'icon-select',
          multiple: true,
        },
      },
      {
        ...CVC_ATTRIBUTE_COLUMNS.Evidence.evidenceRating,
        fixed: 'right',
        cell: {
          kind: 'enum-tag',
          // the number, not a rendering of it: the tag's icon resolver reads
          // a number as a rating and the string '4' as evidence level 4
          value: (row) => row.evidenceRating,
          tooltip: (row) => evidenceEnumDisplay(row.evidenceRating),
        },
        sort: {
          column: EvidenceSortColumns.EvidenceRating,
          directions: SORT_DESCEND_FIRST,
        },
        filter: {
          // the column key is singular, the variable plural — the query
          // declares `$evidenceRatings`, not `$evidenceRating`
          kind: 'enum',
          var: 'evidenceRatings',
          options: RATING_OPTIONS,
          control: 'icon-select',
          multiple: true,
        },
      },
    ],
  })
}

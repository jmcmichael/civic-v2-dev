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
  entityTableConfig,
  enumFilterOptions,
  SORT_DESCEND_FIRST,
} from '@app/tables'
import { EvidenceBrowseGQL } from './evidence-table.query.gql.generated'

/** an EID typed with or without its prefix; anything else matches nothing */
const EID_PATTERN = /^(?:EID)?(\d+)$/i

/** the star ratings, which are numbers rather than a schema enum */
const RATING_OPTIONS = [1, 2, 3, 4, 5].map((stars) => ({
  label: `${stars} stars`,
  value: stars,
}))

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
      },
      {
        key: 'molecularProfile',
        label: 'Molecular Profile',
        width: '320px',
        hidden: !(options.displayMolecularProfile ?? true),
        cell: {
          kind: 'entity-tag',
          ref: (row) => row.molecularProfile,
          truncateLabel: '200px',
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
        width: '250px',
        cell: {
          kind: 'entity-tag',
          ref: (row) => row.disease,
          truncateLabel: '200px',
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
        width: '400px',
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
      },
      {
        key: 'therapyInteractionType',
        label: 'INT',
        tooltip: 'Therapy Interaction Type',
        width: '40px',
        align: 'center',
        emptyValue: 'not-applicable',
        cell: {
          kind: 'enum-tag',
          value: (row) => row.therapyInteractionType,
          tooltip: (row) => evidenceEnumDisplay(row.therapyInteractionType),
        },
        // no filter: unlike the manager's query, EvidenceBrowse declares no
        // therapyInteractionType variable — a filter here cannot compile
        sort: { column: EvidenceSortColumns.TherapyInteractionType },
      },
      {
        key: 'description',
        label: 'DSC',
        tooltip: 'Evidence Description',
        width: '40px',
        align: 'center',
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
        key: 'evidenceLevel',
        label: 'EL',
        tooltip: 'Evidence Level',
        width: '40px',
        align: 'center',
        fixed: 'right',
        cell: {
          kind: 'enum-tag',
          value: (row) => row.evidenceLevel,
          tooltip: (row) => evidenceEnumDisplay(row.evidenceLevel),
        },
        sort: { column: EvidenceSortColumns.EvidenceLevel },
        filter: {
          kind: 'enum',
          var: 'evidenceLevel',
          options: enumFilterOptions(EvidenceLevel),
        },
      },
      {
        key: 'evidenceType',
        label: 'ET',
        tooltip: 'Evidence Type',
        width: '40px',
        align: 'center',
        fixed: 'right',
        cell: {
          kind: 'enum-tag',
          value: (row) => row.evidenceType,
          tooltip: (row) => evidenceEnumDisplay(row.evidenceType),
        },
        sort: { column: EvidenceSortColumns.EvidenceType },
        filter: {
          kind: 'enum',
          var: 'evidenceType',
          options: enumFilterOptions(EvidenceType),
        },
      },
      {
        key: 'evidenceDirection',
        label: 'ED',
        tooltip: 'Evidence Direction',
        width: '40px',
        align: 'center',
        fixed: 'right',
        cell: {
          kind: 'enum-tag',
          value: (row) => row.evidenceDirection,
          tooltip: (row) => evidenceEnumDisplay(row.evidenceDirection),
        },
        sort: { column: EvidenceSortColumns.EvidenceDirection },
        filter: {
          kind: 'enum',
          var: 'evidenceDirection',
          options: enumFilterOptions(EvidenceDirection),
        },
      },
      {
        key: 'significance',
        label: 'SI',
        tooltip: 'Significance',
        width: '40px',
        align: 'center',
        fixed: 'right',
        cell: {
          kind: 'enum-tag',
          value: (row) => row.significance,
          tooltip: (row) => evidenceEnumDisplay(row.significance),
        },
        sort: { column: EvidenceSortColumns.Significance },
        filter: {
          kind: 'enum',
          var: 'significance',
          options: enumFilterOptions(EvidenceSignificance),
        },
      },
      {
        key: 'variantOrigin',
        label: 'VO',
        tooltip: 'Variant Origin',
        width: '40px',
        align: 'center',
        fixed: 'right',
        cell: {
          kind: 'enum-tag',
          value: (row) => row.variantOrigin,
          tooltip: (row) => evidenceEnumDisplay(row.variantOrigin),
        },
        sort: { column: EvidenceSortColumns.VariantOrigin },
        filter: {
          kind: 'enum',
          var: 'variantOrigin',
          options: enumFilterOptions(VariantOrigin),
        },
      },
      {
        key: 'evidenceRating',
        label: 'ER',
        tooltip: 'Evidence Rating',
        width: '45px',
        align: 'center',
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
          // the browse query names this `evidenceRating`; the manager's
          // otherwise-identical column filters its query's `rating`
          kind: 'enum',
          var: 'evidenceRating',
          options: RATING_OPTIONS,
        },
      },
    ],
  })
}

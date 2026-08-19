import { AmpFormatPipe } from '@app/core/pipes/amp-format-pipe'
import { evidenceEnumDisplay } from '@app/core/pipes/evidence-enum-display-type'
import { formatEvidenceEnum } from '@app/core/utilities/enum-formatters/format-evidence-enum'
import {
  AmpLevel,
  AssertionSignificance,
  AssertionSortColumns,
  EvidenceDirection,
  EvidenceStatusFilter,
  EvidenceType,
  Maybe,
  OrganizationFilter,
  TherapyInteraction,
} from '@app/generated/civic.apollo.types'
import {
  CvcEnumOption,
  entityTableConfig,
  enumFilterOptions,
  SORT_DESCEND_FIRST,
} from '@app/tables'
import { AssertionsBrowseGQL } from './assertions-table.query.gql.generated'

/** an AID typed with or without its prefix; anything else matches nothing */
const AID_PATTERN = /^(?:AID)?(\d+)$/i

const AMP_FORMAT = new AmpFormatPipe()

/**
 * Assertion types only — assertions cannot be FUNCTIONAL, and the legacy
 * filter deliberately omitted it.
 */
const ASSERTION_TYPE_OPTIONS = enumFilterOptions(EvidenceType).filter(
  (option) => option.value !== EvidenceType.Functional
)

/**
 * The significance filter's five clinical contexts, exactly as the legacy
 * select grouped them: shared values (NA, the predisposing/oncogenic ACMG
 * levels) repeat under each context they apply to.
 */
const SIGNIFICANCE_GROUPS: ReadonlyArray<
  [string, ReadonlyArray<AssertionSignificance>]
> = [
  [
    'Predictive',
    [
      AssertionSignificance.Sensitivityresponse,
      AssertionSignificance.Resistance,
      AssertionSignificance.AdverseResponse,
      AssertionSignificance.ReducedSensitivity,
      AssertionSignificance.Na,
    ],
  ],
  [
    'Prognostic',
    [
      AssertionSignificance.BetterOutcome,
      AssertionSignificance.PoorOutcome,
      AssertionSignificance.Na,
    ],
  ],
  [
    'Diagnostic',
    [AssertionSignificance.Positive, AssertionSignificance.Negative],
  ],
  [
    'Predisposing',
    [
      AssertionSignificance.Pathogenic,
      AssertionSignificance.LikelyPathogenic,
      AssertionSignificance.Benign,
      AssertionSignificance.LikelyBenign,
      AssertionSignificance.UncertainSignificance,
    ],
  ],
  [
    'Oncogenic',
    [
      AssertionSignificance.Oncogenic,
      AssertionSignificance.LikelyOncogenic,
      AssertionSignificance.Benign,
      AssertionSignificance.LikelyBenign,
      AssertionSignificance.UncertainSignificance,
    ],
  ],
]

const SIGNIFICANCE_OPTIONS: CvcEnumOption<AssertionSignificance>[] =
  SIGNIFICANCE_GROUPS.flatMap(([group, values]) =>
    values.map((value) => ({
      label: formatEvidenceEnum(value),
      value,
      group,
    }))
  )

/**
 * The tiers an assertion can actually carry, in the legacy filter's order —
 * NA and TIER_IV exist on the enum but were never offered.
 */
const AMP_LEVEL_OPTIONS: CvcEnumOption<AmpLevel>[] = [
  AmpLevel.TierILevelA,
  AmpLevel.TierILevelB,
  AmpLevel.TierIiLevelC,
  AmpLevel.TierIiLevelD,
  AmpLevel.TierIii,
].map((value) => ({
  label: AMP_FORMAT.transform(value, 'verbose'),
  // the icon-select's collapsed state — 'IA', as the ACAT cells render
  shortLabel: AMP_FORMAT.transform(value, 'compact'),
  value,
}))

/**
 * The query variables a host page scopes the table with: at most one entity
 * id plus a title, `status` defaulting to NON_REJECTED the way the legacy
 * table always has, and the two org-page OrganizationFilter wrappers
 * (submitting and approving), which carry include-subgroups. Unscoped hosts
 * send neither wrapper — the legacy table sent both as
 * `{ids: [], includeSubgroups: false}`, which the resolvers treat
 * identically.
 */
export interface AssertionsTableScope {
  evidenceId?: Maybe<number>
  molecularProfileId?: Maybe<number>
  userId?: Maybe<number>
  phenotypeId?: Maybe<number>
  diseaseId?: Maybe<number>
  therapyId?: Maybe<number>
  ids?: Maybe<number[]>
  organization?: Maybe<OrganizationFilter>
  approvingOrganizations?: Maybe<OrganizationFilter>
  status?: Maybe<EvidenceStatusFilter>
}

/**
 * The assertions browse table, as configuration — evidence-table's sibling:
 * same subject/entity/attribute column shape, assertions' own sort enum and
 * filter vocabulary (the grouped significance select, the FUNCTIONAL-less
 * type filter, the AMP tier filter), and the AMP category rendered as a
 * labeled text-tag ('IA' in the tag, 'Tier I - Level A' in its tooltip).
 *
 * No `seed` on any entity-tag column: `assertions` returns real `Assertion`s
 * whose entities normalise into the cache on their own.
 */
export function assertionsTableConfig(
  query: AssertionsBrowseGQL,
  title: Maybe<string>,
  scope: AssertionsTableScope = {}
) {
  return entityTableConfig({
    entity: 'Assertion',
    title: title ?? undefined,
    query,
    pageSize: 25,
    scope: {
      evidenceId: scope.evidenceId ?? undefined,
      molecularProfileId: scope.molecularProfileId ?? undefined,
      userId: scope.userId ?? undefined,
      phenotypeId: scope.phenotypeId ?? undefined,
      diseaseId: scope.diseaseId ?? undefined,
      therapyId: scope.therapyId ?? undefined,
      ids: scope.ids ?? undefined,
      organization: scope.organization ?? undefined,
      approvingOrganizations: scope.approvingOrganizations ?? undefined,
      status: scope.status ?? EvidenceStatusFilter.NonRejected,
    },
    connection: (data) => data?.assertions,
    columns: [
      {
        key: 'id',
        label: 'Assertion',
        width: '100px',
        fixed: 'left',
        omitFromPrefs: true,
        cell: {
          kind: 'entity-tag',
          ref: (row) => ({ __typename: 'Assertion' as const, id: row.id }),
          fullWidth: true,
          popoverPlacement: 'right',
        },
        sort: { column: AssertionSortColumns.Id },
        filter: {
          kind: 'text',
          var: 'id',
          placeholder: 'AID',
          // 'AID123' and '123' both mean 123; anything else clears the filter
          transform: (value) => {
            const match = value?.toString().trim().match(AID_PATTERN)
            return match ? +match[1] : null
          },
        },
      },
      {
        key: 'molecularProfile',
        label: 'Molecular Profile',
        width: '320px',
        cell: {
          kind: 'entity-tag',
          ref: (row) => row.molecularProfile,
          truncateLabel: '200px',
        },
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
        emptyValue: 'not-applicable',
        cell: {
          kind: 'entity-tag',
          ref: (row) => row.disease,
          truncateLabel: '200px',
        },
        sort: { column: AssertionSortColumns.DiseaseName },
        filter: {
          kind: 'text',
          var: 'diseaseName',
          placeholder: 'Filter Disease Names',
        },
      },
      {
        key: 'therapies',
        label: 'Therapies',
        width: '260px',
        emptyValue: 'not-applicable',
        cell: {
          kind: 'entity-tag',
          ref: (row) => row.therapies,
          maxTags: 2,
          truncateLabel: '150px',
        },
        filter: {
          kind: 'text',
          var: 'therapyName',
          placeholder: 'Filter Therapy Names',
        },
        // the legacy INT column, folded in: interaction type filters from a
        // funnel beside the therapy-name input (the value itself shows in
        // evidence/assertion popovers)
        extraFilter: {
          kind: 'enum',
          var: 'therapyInteractionType',
          options: enumFilterOptions(TherapyInteraction),
        },
      },
      {
        // wide enough that text-tag renders the summary string itself
        // (ellipsized, full text on hover) and the filter box takes a real
        // search phrase
        key: 'summary',
        label: 'Summary',
        // carries the quarter trimmed from Therapies
        width: '240px',
        cell: { kind: 'text-tag', text: (row) => row.summary },
        sort: { column: AssertionSortColumns.Summary },
        filter: {
          kind: 'text',
          var: 'summary',
          placeholder: 'Search Summaries',
        },
      },
      {
        key: 'assertionType',
        label: 'ATYP',
        tooltip: 'Assertion Type',
        width: '60px',
        align: 'center',
        fixed: 'right',
        cell: {
          kind: 'enum-tag',
          value: (row) => row.assertionType,
          tooltip: (row) => evidenceEnumDisplay(row.assertionType),
        },
        sort: { column: AssertionSortColumns.AssertionType },
        filter: {
          kind: 'enum',
          var: 'assertionType',
          options: ASSERTION_TYPE_OPTIONS,
          control: 'icon-select',
        },
      },
      {
        key: 'assertionDirection',
        label: 'ADIR',
        tooltip: 'Assertion Direction',
        width: '60px',
        align: 'center',
        fixed: 'right',
        cell: {
          kind: 'enum-tag',
          value: (row) => row.assertionDirection,
          tooltip: (row) => evidenceEnumDisplay(row.assertionDirection),
        },
        sort: { column: AssertionSortColumns.AssertionDirection },
        filter: {
          kind: 'enum',
          var: 'assertionDirection',
          options: enumFilterOptions(EvidenceDirection),
          control: 'icon-select',
        },
      },
      {
        key: 'significance',
        label: 'ASIG',
        tooltip: 'Significance',
        width: '60px',
        align: 'center',
        fixed: 'right',
        cell: {
          kind: 'enum-tag',
          value: (row) => row.significance,
          tooltip: (row) => evidenceEnumDisplay(row.significance),
        },
        sort: { column: AssertionSortColumns.Significance },
        filter: {
          kind: 'enum',
          var: 'significance',
          options: SIGNIFICANCE_OPTIONS,
          control: 'icon-select',
        },
      },
      {
        key: 'ampLevel',
        label: 'ACAT',
        tooltip: 'AMP/ASCO/CAP Category',
        width: '60px',
        // a narrow fixed-tag column: widening only pads the compact tag
        resizable: false,
        align: 'center',
        fixed: 'right',
        emptyValue: 'not-applicable',
        cell: {
          kind: 'text-tag',
          label: (row) =>
            row.ampLevel
              ? AMP_FORMAT.transform(row.ampLevel, 'compact')
              : undefined,
          text: (row) =>
            row.ampLevel
              ? AMP_FORMAT.transform(row.ampLevel, 'verbose')
              : undefined,
        },
        sort: { column: AssertionSortColumns.AmpLevel },
        filter: {
          kind: 'enum',
          var: 'ampLevel',
          options: AMP_LEVEL_OPTIONS,
          // AMP tiers have no civic-* icon set: the icon-select collapses
          // to each option's compact shortLabel instead
          showIcons: false,
          control: 'icon-select',
        },
      },
      {
        key: 'evidenceItemsCount',
        label: '',
        labelIcon: 'civic-evidence',
        tooltip: 'Evidence Item Count',
        width: '55px',
        align: 'right',
        fixed: 'right',
        cell: {
          kind: 'count-tag',
          count: (row) => row.evidenceItemsCount,
          fetch: (row) => ({
            entity: 'EvidenceItem',
            scope: { assertionId: row.id },
          }),
        },
        sort: {
          column: AssertionSortColumns.EvidenceItemsCount,
          directions: SORT_DESCEND_FIRST,
        },
      },
    ],
  })
}

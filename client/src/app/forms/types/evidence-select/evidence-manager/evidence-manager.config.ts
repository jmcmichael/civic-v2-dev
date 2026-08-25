import { evidenceEnumDisplay } from '@app/core/pipes/evidence-enum-display-type'
import {
  EvidenceDirection,
  EvidenceLevel,
  EvidenceSignificance,
  EvidenceSortColumns,
  EvidenceType,
  TherapyInteraction,
} from '@app/generated/civic.apollo.types'
import { entityTableConfig, enumFilterOptions } from '@app/tables'
import { EvidenceManagerGQL } from './evidence-manager.query.gql.generated'

/** an EID typed with or without its prefix; anything else matches nothing */
const EID_PATTERN = /^(?:EID)?(\d+)$/i

/** the star ratings, which are numbers rather than a schema enum */
const RATING_OPTIONS = [1, 2, 3, 4, 5].map((stars) => ({
  label: `${stars} stars`,
  value: stars,
}))

/**
 * The evidence manager's table, as configuration.
 *
 * The larger of the two managers and the one that exercises the whole cell
 * union: six enum tags, four entity tags, a text tag, the select column and
 * one column hidden by default. `filter.var` and `sort.column` are checked
 * against the query's generated types, so a filter or sorter cannot silently
 * name a variable or column the query does not have —
 * `evidence-manager.config.spec.ts` additionally pins that every filter
 * variable is declared *and* reaches a field.
 *
 * No `seed` on any entity-tag column: `evidenceItems` returns real
 * `EvidenceItem`s and the query spreads the `Linkable*` fragments, so every
 * entity here normalises into the cache on its own. Seeding is a `Browse*`
 * concern — see the variant manager, whose rows arrive flattened.
 */
export function evidenceManagerConfig(query: EvidenceManagerGQL) {
  return entityTableConfig({
    title: 'Use checkboxes to select or deselect Evidence Items',
    query,
    pageSize: 50,
    connection: (data) => data?.evidenceItems,
    columns: [
      {
        // no label: 25px clips any text to a fragment
        key: 'selected',
        label: '',
        width: '25px',
        align: 'center',
        fixed: 'left',
        omitFromPrefs: true,
        cell: { kind: 'select' },
      },
      {
        key: 'id',
        label: 'Evidence',
        width: '95px',
        fixed: 'left',
        omitFromPrefs: true,
        cell: {
          kind: 'entity-tag',
          ref: (row) => ({ __typename: 'EvidenceItem' as const, id: row.id }),
          fullWidth: true,
          popoverPlacement: 'right',
        },
        sort: { column: EvidenceSortColumns.Id, default: 'ascend' },
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
        // sits after the pinned-left block: a prefs-shown column must not
        // interleave between pinned columns — sticky offsets assume each
        // pinned run is contiguous at its edge
        key: 'status',
        label: 'Status',
        width: '50px',
        hidden: true,
        cell: { kind: 'text', text: (row) => row.status },
      },
      {
        key: 'molecularProfile',
        label: 'Molecular Profile',
        width: '240px',
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
          entityTypename: 'MolecularProfile',
        },
      },
      {
        key: 'disease',
        label: 'Disease',
        width: '240px',
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
        sort: { column: EvidenceSortColumns.TherapyName },
        filter: {
          kind: 'text',
          var: 'therapyName',
          placeholder: 'Filter Therapy Names',
          entityTypename: 'Therapy',
        },
      },
      {
        key: 'therapyInteractionType',
        label: 'INT',
        tooltip: 'Therapy Interaction Type',
        width: '40px',
        align: 'center',
        // an evidence item with one therapy cannot have an interaction type, so
        // its absence is a property of the record rather than missing curation
        emptyValue: 'not-applicable',
        cell: {
          kind: 'enum-tag',
          value: (row) => row.therapyInteractionType,
          tooltip: (row) => evidenceEnumDisplay(row.therapyInteractionType),
        },
        sort: { column: EvidenceSortColumns.TherapyInteractionType },
        filter: {
          kind: 'enum',
          var: 'therapyInteractionType',
          options: enumFilterOptions(TherapyInteraction),
        },
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
        sort: { column: EvidenceSortColumns.EvidenceRating },
        filter: {
          // the column key and the query variable genuinely differ here: the
          // query declares `$rating`, not `$evidenceRating`
          kind: 'enum',
          var: 'rating',
          options: RATING_OPTIONS,
        },
      },
    ],
  })
}

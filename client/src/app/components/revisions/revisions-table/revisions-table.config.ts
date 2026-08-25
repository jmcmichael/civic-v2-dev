import { formatDate } from '@angular/common'
import { formatEvidenceEnum } from '@app/core/utilities/enum-formatters/format-evidence-enum'
import {
  ActivitySubjectInput,
  DateSortColumns,
  Maybe,
  RevisionStatus,
} from '@app/generated/civic.apollo.types'
import {
  CvcEnumOption,
  entityTableConfig,
  SORT_DESCEND_FIRST,
} from '@app/tables'
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus'
import { CvcRevisionsTableFieldsCellComponent } from './revisions-table-fields-cell.component'
import { CvcRevisionsTableOrganizationCellComponent } from './revisions-table-organization-cell.component'
import { CvcRevisionsTableSubjectCellComponent } from './revisions-table-subject-cell.component'
import { CvcRevisionsTableSubmitterCellComponent } from './revisions-table-submitter-cell.component'
import { RevisionsBrowseGQL } from './revisions-table.query.gql.generated'

/**
 * The subject types a revision set can target, exactly the six the legacy
 * select offered (the enum carries more — Comment, Flag, Source… — but
 * revision subjects are these).
 */
const SUBJECT_TYPE_OPTIONS: CvcEnumOption<ActivitySubjectInput>[] = [
  ActivitySubjectInput.Assertion,
  ActivitySubjectInput.EvidenceItem,
  ActivitySubjectInput.Feature,
  ActivitySubjectInput.MolecularProfile,
  ActivitySubjectInput.Variant,
  ActivitySubjectInput.VariantGroup,
  // formatEvidenceEnum types its input as the union of form enums, which
  // predates ActivitySubjectInput; the formatting (underscores to spaced
  // title case) applies the same
].map((value) => ({
  label: formatEvidenceEnum(
    value as unknown as Parameters<typeof formatEvidenceEnum>[0]
  ),
  value,
}))

/** The query variables a host page scopes the table with. */
export interface RevisionsTableScope {
  ids?: Maybe<number[]>
  /** the signed-in curator's id, when "exclude my own" is checked */
  excludeRevisionsFromUserId?: Maybe<number>
}

/**
 * The revisions browse table, as configuration — a FLAT table of
 * RevisionSets: the legacy row expansion (per-set diff details) is dropped
 * by design, its content the province of the entity revise pages and the
 * queued activity-feed abstraction. Rows keep the set's flattened field
 * names; the per-set diffs are one subject-tag click away.
 *
 * Scope carries the ids/status coupling: an `[ids]` search-result scope
 * drops the pending queue's NEW filter (search names specific sets,
 * whatever their status). The Submitted column is new — the legacy table
 * rendered no date and had ZERO sortable columns, silently riding the
 * server's created_at DESC default; the server's `sortBy: DateSort` arg
 * makes it explicit and user-flippable.
 *
 * Subject/Submitter/Organization/Fields are custom cells: the subject union
 * spans a dozen typenames with bespoke tags (no Linkable coverage), User
 * and Organization are not taggable typenames, and the fields pileup is
 * `cvc-plain-tag-overflow`.
 */
export function revisionsTableConfig(
  query: RevisionsBrowseGQL,
  title: Maybe<string>,
  scope: RevisionsTableScope = {}
) {
  return entityTableConfig({
    title: title ?? undefined,
    query,
    pageSize: 25,
    scope: {
      ids: scope.ids ?? undefined,
      status: scope.ids?.length ? undefined : RevisionStatus.New,
      excludeRevisionsFromUserId: scope.excludeRevisionsFromUserId ?? undefined,
    },
    connection: (data) => data?.revisionSets,
    columns: [
      {
        key: 'subject',
        label: 'Revision Subject',
        width: '320px',
        fixed: 'left',
        omitFromPrefs: true,
        cell: {
          kind: 'custom',
          content: new PolymorpheusComponent(
            CvcRevisionsTableSubjectCellComponent
          ),
        },
        filter: {
          kind: 'enum',
          var: 'subjectType',
          control: 'select',
          placeholder: 'Any',
          options: SUBJECT_TYPE_OPTIONS,
        },
      },
      {
        key: 'submitter',
        label: 'Submitter',
        width: '200px',
        cell: {
          kind: 'custom',
          content: new PolymorpheusComponent(
            CvcRevisionsTableSubmitterCellComponent
          ),
        },
        filter: {
          kind: 'text',
          var: 'originatingUserName',
          placeholder: 'Filter Submitters',
        },
      },
      {
        key: 'organization',
        label: 'Organization',
        width: '180px',
        cell: {
          kind: 'custom',
          content: new PolymorpheusComponent(
            CvcRevisionsTableOrganizationCellComponent
          ),
        },
        filter: {
          kind: 'text',
          var: 'organizationName',
          placeholder: 'Filter Organizations',
        },
      },
      {
        key: 'fields',
        label: 'Revision Fields',
        width: '350px',
        cell: {
          kind: 'custom',
          content: new PolymorpheusComponent(
            CvcRevisionsTableFieldsCellComponent
          ),
        },
        filter: {
          kind: 'text',
          var: 'fieldName',
          placeholder: 'Filter Field Names',
        },
      },
      {
        key: 'createdAt',
        label: 'Submitted',
        width: '110px',
        align: 'right',
        cell: {
          kind: 'text',
          text: (row) =>
            row.creationActivity?.createdAt
              ? formatDate(
                  row.creationActivity.createdAt,
                  'mediumDate',
                  'en-US'
                )
              : undefined,
        },
        sort: {
          column: DateSortColumns.Created,
          directions: SORT_DESCEND_FIRST,
          default: 'descend',
        },
      },
    ],
  })
}

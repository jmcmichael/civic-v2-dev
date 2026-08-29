import { formatDate } from '@angular/common'
import { evidenceEnumDisplay } from '@app/core/pipes/evidence-enum-display-type'
import { formatSourceSuggestionStatusEnum } from '@app/core/utilities/enum-formatters/format-source-suggestion-status-enum'
import { formatSourceTypeEnum } from '@app/core/utilities/enum-formatters/format-source-type-enum'
import {
  Maybe,
  SourceSource,
  SourceSuggestionsSortColumns,
  SourceSuggestionStatus,
} from '@app/generated/civic.apollo.types'
import {
  CvcEnumOption,
  entityTableConfig,
  SORT_DESCEND_FIRST,
} from '@app/tables'
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus'
import { CvcSourceSuggestionActionsCellComponent } from './source-suggestions-table-actions-cell.component'
import { CvcSourceSuggestionCommentCellComponent } from './source-suggestions-table-comment-cell.component'
import { CvcSourceSuggestionStatusCellComponent } from './source-suggestions-table-status-cell.component'
import { CvcSourceSuggestionSubmitterCellComponent } from './source-suggestions-table-submitter-cell.component'
import { BrowseSourceSuggestionsGQL } from './source-suggestions-table.query.gql.generated'

/**
 * Statuses in workflow order, not the enum's alphabetical one; labelled by
 * the same formatter the status cell renders with (the legacy select showed
 * them lowercased).
 */
const STATUS_OPTIONS: CvcEnumOption<SourceSuggestionStatus>[] = [
  SourceSuggestionStatus.New,
  SourceSuggestionStatus.Curated,
  SourceSuggestionStatus.Rejected,
].map((value) => ({ label: formatSourceSuggestionStatusEnum(value), value }))

/**
 * Every SourceSource member — the legacy select offered only PubMed/ASCO,
 * silently omitting ASH; the preprint servers joined with #1466.
 * `formatSourceTypeEnum` carries the capitalization these acronyms need.
 */
const SOURCE_TYPE_OPTIONS: CvcEnumOption<SourceSource>[] = [
  SourceSource.Pubmed,
  SourceSource.Asco,
  SourceSource.Ash,
  SourceSource.Biorxiv,
  SourceSource.Medrxiv,
].map((value) => ({ label: formatSourceTypeEnum(value), value }))

/** The query variables a host page scopes the table with. */
export interface SourceSuggestionsTableScope {
  sourceId?: Maybe<number>
  submitterId?: Maybe<number>
}

/**
 * The source-suggestions browse table, as configuration — the first table
 * with mutation-wired custom cells: the Actions column hosts the existing
 * `CvcUpdateSourceSuggestionForm` in a per-row click popover (see the cell
 * component). The default NEW status filter arrives via the facade's
 * `settings` (filters open populated AND on the wire), not the scope: it is
 * a live column select the curator can change or clear, exactly as legacy.
 *
 * The Citation subject entity-tags need no `seed`: rows carry full
 * `Source`s (with `name`) that normalise into the cache on their own; same
 * for MP and Disease. Submitter is a custom cell — `User` is not a taggable
 * typename (the users-table precedent).
 */
export function sourceSuggestionsTableConfig(
  query: BrowseSourceSuggestionsGQL,
  title: Maybe<string>,
  scope: SourceSuggestionsTableScope = {},
  options: { hideSubmitterFilter?: boolean } = {}
) {
  return entityTableConfig({
    entity: 'Source Suggestion',
    title: title ?? undefined,
    query,
    pageSize: 35,
    scope: {
      sourceId: scope.sourceId ?? undefined,
      submitterId: scope.submitterId ?? undefined,
    },
    connection: (data) => data?.sourceSuggestions,
    columns: [
      {
        key: 'status',
        label: 'Status',
        width: '100px',
        fixed: 'left',
        cell: {
          kind: 'custom',
          content: new PolymorpheusComponent(
            CvcSourceSuggestionStatusCellComponent
          ),
        },
        filter: {
          kind: 'enum',
          var: 'status',
          control: 'select',
          placeholder: 'Any',
          options: STATUS_OPTIONS,
        },
      },
      {
        key: 'citation',
        label: 'Citation',
        width: '400px',
        fixed: 'left',
        omitFromPrefs: true,
        cell: {
          kind: 'entity-tag',
          ref: (row) => row.source,
          fullWidth: true,
        },
        sort: { column: SourceSuggestionsSortColumns.Citation },
        filter: {
          kind: 'text',
          var: 'citation',
          placeholder: 'Filter Citations',
        },
      },
      {
        key: 'submitterComment',
        label: '',
        labelIcon: 'civic-comment',
        tooltip: 'Submitter Comment',
        width: '40px',
        // a narrow single-icon column: widening only pads the comment icon
        resizable: false,
        align: 'center',
        cell: {
          kind: 'custom',
          content: new PolymorpheusComponent(
            CvcSourceSuggestionCommentCellComponent
          ),
        },
      },
      {
        key: 'submitter',
        label: 'Submitter',
        width: '200px',
        cell: {
          kind: 'custom',
          content: new PolymorpheusComponent(
            CvcSourceSuggestionSubmitterCellComponent
          ),
        },
        sort: { column: SourceSuggestionsSortColumns.Submitter },
        ...(options.hideSubmitterFilter
          ? {}
          : {
              filter: {
                kind: 'text' as const,
                var: 'submitter' as const,
                placeholder: 'Filter Submitters',
              },
            }),
      },
      {
        key: 'sourceType',
        label: 'Type',
        width: '90px',
        cell: { kind: 'text', text: (row) => row.source?.displayType },
        sort: { column: SourceSuggestionsSortColumns.SourceType },
        filter: {
          kind: 'enum',
          var: 'sourceType',
          control: 'select',
          placeholder: 'Any',
          options: SOURCE_TYPE_OPTIONS,
        },
      },
      {
        key: 'citationId',
        label: 'ID',
        width: '80px',
        cell: { kind: 'text', text: (row) => row.source?.citationId },
        sort: { column: SourceSuggestionsSortColumns.CitationId },
        filter: { kind: 'numeric', var: 'citationId', placeholder: 'ID' },
      },
      {
        key: 'molecularProfile',
        label: 'Molecular Profile',
        width: '290px',
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
        width: '200px',
        cell: {
          kind: 'entity-tag',
          ref: (row) => row.disease,
          truncateLabel: '150px',
        },
        sort: { column: SourceSuggestionsSortColumns.DiseaseName },
        filter: {
          kind: 'text',
          var: 'diseaseName',
          placeholder: 'Filter Diseases',
        },
      },
      {
        key: 'therapies',
        label: 'Therapies',
        width: '220px',
        cell: {
          kind: 'entity-tag',
          ref: (row) => row.therapies,
          maxTags: 2,
          truncateLabel: '150px',
        },
        // the API sorts suggestions by disease but not therapy
        filter: {
          kind: 'text',
          var: 'therapyName',
          placeholder: 'Filter Therapies',
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
      },
      {
        key: 'createdAt',
        label: 'Submitted',
        width: '110px',
        align: 'right',
        cell: {
          kind: 'text',
          text: (row) =>
            row.createdAt
              ? formatDate(row.createdAt, 'mediumDate', 'en-US')
              : undefined,
        },
        sort: {
          column: SourceSuggestionsSortColumns.CreatedAt,
          directions: SORT_DESCEND_FIRST,
          default: 'descend',
        },
      },
      {
        key: 'actions',
        label: 'Actions',
        width: '70px',
        align: 'center',
        fixed: 'right',
        omitFromPrefs: true,
        cell: {
          kind: 'custom',
          content: new PolymorpheusComponent(
            CvcSourceSuggestionActionsCellComponent
          ),
        },
      },
    ],
  })
}

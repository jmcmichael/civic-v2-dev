import {
  Maybe,
  SourceSource,
  SourcesSortColumns,
} from '@app/generated/civic.apollo.types'
import {
  entityTableConfig,
  enumFilterOptions,
  SORT_DESCEND_FIRST,
} from '@app/tables'
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus'
import { CvcSourceAuthorsCellComponent } from './sources-table-authors-cell.component'
import { CvcSourceOpenAccessCellComponent } from './sources-table-open-access-cell.component'
import { BrowseSourcesGQL } from './sources-table.query.gql.generated'

/**
 * Parses the Open Access filter box into the boolean the `openAccess` query
 * variable needs. See the Open Access column's own comment for why this is
 * a `text` filter rather than `enum`.
 */
function parseOpenAccess(value: Maybe<string>): Maybe<boolean> {
  const v = value?.trim().toLowerCase()
  if (!v) return undefined
  if (['open', 'o', 'true', 'yes', 'y'].includes(v)) return true
  if (['closed', 'c', 'false', 'no', 'n'].includes(v)) return false
  return undefined
}

/** The query variables a host page scopes the table with. */
export interface SourcesTableScope {
  ids?: Maybe<number[]>
  clinicalTrialId?: Maybe<number>
}

/**
 * The sources browse table, as configuration.
 *
 * Citation is the generic `entity-tag` kind: `Source` is a taggable
 * typename, and `BrowseSource` (this table's own row) already carries every
 * field `LinkableSource` needs (id, name, link, deprecated, citation,
 * sourceType) — `ENTITY_TAG_SPECS.Source` derives the tag's label as
 * `citation ?? name`, the same fallback the legacy bespoke `cvc-source-tag`
 * computed by hand, and gets its popover for free from `TAG_POPOVERS`.
 * `truncateLabel: '350px'` approximates the legacy `truncateLongName`
 * (a 50-character clamp, a different mechanism — CSS width vs. character
 * count — but the same intent inside this column's 400px width).
 *
 * Name is a second, separate plain-text column (the row's own `name` field)
 * — distinct from Citation's tag, which prefers `citation`. Both exist in
 * the legacy table and both are kept.
 *
 * Authors is `kind: 'custom'`: a plain string list rendered as a
 * `cvc-plain-tag-overflow` pileup, not the generic `text` kind's
 * comma-joined inline text — see `sources-table-authors-cell.component.ts`.
 *
 * Open Access is `kind: 'custom'`: an icon-only column keyed off a boolean,
 * which no generic kind expresses — see
 * `sources-table-open-access-cell.component.ts`. Its filter is `kind:
 * 'text'` rather than the legacy `nz-select`'s Open/Closed dropdown:
 * `CvcColumnFilter`'s `enum` arm renders every option through
 * `cvc-attribute-tag` (`cvc-enum-filter-menu`), which resolves a value's
 * icon/color/label against CIViC's generated attribute enums — a plain
 * boolean isn't one, and even bypassing the type would show literal
 * "true"/"false" rather than a real tag. `parseOpenAccess` accepts
 * open/o/true/yes/y and closed/c/false/no/n (case-insensitive); anything
 * else clears the filter. A free-text box in place of a two-option dropdown
 * is a real, deliberate UX step down — flagged rather than quietly
 * shipped — but correct filtering beats no filtering, and this framework
 * has no generic label/value dropdown that isn't attribute-enum-shaped.
 *
 * Type/ID/Year/Journal are plain `text` cells. ID and Year use `kind:
 * 'numeric'` filters (an `nz-input-number` box, producing a number
 * natively) rather than the legacy text input's manual `+this.
 * citationIdInput`/`+this.yearInput` coercion — the query's `citationId`/
 * `year` variables are `Int`. Type's filter is `enumFilterOptions
 * (SourceSource)` (in the closed `InputEnum` union, unlike UserRole/
 * FeatureInstanceTypes); its generic titlecase labels ("Asco"/"Ash") differ
 * slightly from the legacy hand-written ones ("ASCO"/"ASH") — accepted for
 * consistency with every other enum filter in this framework, also with
 * `showIcons: false`.
 */
export function sourcesTableConfig(
  query: BrowseSourcesGQL,
  title: Maybe<string>,
  scope: SourcesTableScope = {}
) {
  return entityTableConfig({
    title: title ?? undefined,
    query,
    pageSize: 35,
    scope: {
      ids: scope.ids ?? undefined,
      clinicalTrialId: scope.clinicalTrialId ?? undefined,
    },
    connection: (data) => data?.browseSources,
    columns: [
      {
        key: 'citation',
        label: 'Citation',
        width: '250px',
        fixed: 'left',
        cell: {
          kind: 'entity-tag',
          ref: (row) => ({ __typename: 'Source' as const, id: row.id }),
          seed: (row) => ({
            __typename: 'Source' as const,
            id: row.id,
            // BrowseSource.name is nullable even though Source.name is not;
            // citation is always present, so it's the fallback
            name: row.name ?? row.citation,
            link: row.link,
            deprecated: row.deprecated,
            citation: row.citation,
            sourceType: row.sourceType,
          }),
          // no truncateLabel: fullWidth bounds the label at the cell edge,
          // where the tag's own overflow ellipsis takes over
          fullWidth: true,
          popoverPlacement: 'right',
        },
      },
      {
        key: 'name',
        label: 'Name',
        width: '350px',
        cell: {
          kind: 'text',
          text: (row) => row.name ?? undefined,
          highlight: true,
          tooltip: true,
        },
        sort: { column: SourcesSortColumns.Name },
        filter: { kind: 'text', var: 'name', placeholder: 'Filter Name' },
      },
      {
        key: 'authors',
        label: 'Authors',
        width: '275px',
        cell: {
          kind: 'custom',
          content: new PolymorpheusComponent(CvcSourceAuthorsCellComponent),
        },
        sort: { column: SourcesSortColumns.Authors },
        filter: {
          kind: 'text',
          var: 'author',
          placeholder: 'Filter Authors',
        },
      },
      {
        key: 'sourceType',
        label: 'Type',
        width: '75px',
        cell: { kind: 'text', text: (row) => row.displayType ?? undefined },
        sort: { column: SourcesSortColumns.SourceType },
        filter: {
          kind: 'enum',
          var: 'sourceType',
          options: enumFilterOptions(SourceSource),
          showIcons: false,
        },
      },
      {
        key: 'citationId',
        label: 'ID',
        width: '80px',
        cell: { kind: 'text', text: (row) => row.citationId ?? undefined },
        sort: { column: SourcesSortColumns.CitationId },
        filter: { kind: 'numeric', var: 'citationId' },
      },
      {
        key: 'publicationYear',
        label: 'Year',
        width: '75px',
        cell: {
          kind: 'text',
          text: (row) => row.publicationYear ?? undefined,
        },
        sort: { column: SourcesSortColumns.Year },
        filter: { kind: 'numeric', var: 'year' },
      },
      {
        key: 'journal',
        label: 'Journal',
        width: '150px',
        cell: {
          kind: 'text',
          text: (row) => row.journal ?? undefined,
          tooltip: true,
        },
        sort: { column: SourcesSortColumns.Journal },
        filter: {
          kind: 'text',
          var: 'journal',
          placeholder: 'Filter Journal',
        },
      },
      {
        key: 'openAccess',
        label: 'Open Access',
        width: '80px',
        fixed: 'right',
        cell: {
          kind: 'custom',
          content: new PolymorpheusComponent(CvcSourceOpenAccessCellComponent),
        },
        filter: {
          kind: 'text',
          var: 'openAccess',
          placeholder: 'open or closed',
          transform: parseOpenAccess,
        },
      },
      {
        key: 'evidenceItemCount',
        label: '',
        tooltip: 'Evidence Count',
        labelIcon: 'civic-evidence',
        width: '55px',
        fixed: 'right',
        align: 'right',
        cell: { kind: 'text', text: (row) => row.evidenceItemCount },
        sort: {
          column: SourcesSortColumns.EvidenceCount,
          default: 'descend',
          directions: SORT_DESCEND_FIRST,
        },
      },
      {
        key: 'sourceSuggestionCount',
        label: '',
        tooltip: 'Suggestion Count',
        labelIcon: 'civic-queue',
        width: '55px',
        fixed: 'right',
        align: 'right',
        cell: { kind: 'text', text: (row) => row.sourceSuggestionCount },
        sort: {
          column: SourcesSortColumns.SuggestionCount,
          directions: SORT_DESCEND_FIRST,
        },
      },
    ],
  })
}

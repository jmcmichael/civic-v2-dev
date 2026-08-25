import { CvcEmptyValueCategory } from '@app/forms/components/empty-value/empty-value.component'
import { Maybe } from '@app/generated/civic.apollo.types'
import {
  CvcTagLabelMax,
  EntityTagRef,
  LinkableEntity,
  PopoverPlacement,
  TaggableTypename,
} from '@app/tags'
import { NzTableSortOrder } from 'ng-zorro-antd/table'

/**
 * The column model: one flat column type for every column.
 *
 * The discriminant covers only the cell's *contents* (`cell.kind`). Everything
 * to do with layout lives on the column itself, so one `<th>` and one `<td>`
 * serve every column and the union is narrowed once, at the point it actually
 * varies.
 *
 * Layout members are typed facades over nz-table's per-cell directive inputs
 * (`key` → `nzColumnKey`, `width` → `nzWidth`, `align` → `nzAlign`, `fixed` →
 * `nzLeft`/`nzRight`, sort → `nzSortOrder`/`nzSortFn`); the component applies
 * them in its single `<th>`/`<td>`. See docs/01-architecture.md for the full
 * mapping table.
 *
 * @template TRow row/node type the table renders; must satisfy the host
 *   component's `{ id: number }` constraint
 * @template TVars the query's generated variables type; checked by
 *   `filter.var`
 * @template TSortColumn the generated `*SortColumns` enum; checked by
 *   `sort.column`
 */
export interface CvcColumn<
  TRow,
  TVars = unknown,
  TSortColumn extends string = string,
> {
  /**
   * Stable identity: addresses the column in prefs, filters, `data-column`
   * test hooks, and ng-zorro's `nzColumnKey`.
   */
  key: string
  label: string
  /**
   * Passed to `th[nzWidth]`; use px, e.g. '215px' — sticky offsets for
   * pinned columns are computed arithmetically from these.
   */
  width: string
  /** `th`/`td` `nzAlign`; same union as ng-zorro's */
  align?: 'left' | 'center' | 'right'
  /**
   * Pins the column while the table scrolls horizontally. Rendered as a
   * computed CSS length on `nzLeft`/`nzRight` (`NzCellFixedDirective`) —
   * deliberately never the boolean auto-measure mode; see
   * `CvcEntityTableComponent.stickyOffsets`.
   */
  fixed?: 'left' | 'right'
  /** initial visibility; the preferences panel toggles it thereafter */
  hidden?: boolean
  /** tooltip on the column label */
  tooltip?: string
  /** keep the column out of the visible-columns panel, e.g. the select column */
  omitFromPrefs?: boolean
  /**
   * Rendered when the cell accessor yields nothing. Defaults to
   * `DEFAULT_EMPTY_VALUE`; override per column where the distinction is real
   * (an evidence item with no therapy interaction is not-applicable; one with
   * no description is unspecified).
   */
  emptyValue?: CvcEmptyValueCategory
  cell: CvcCellSpec<TRow>
  sort?: CvcColumnSort<TSortColumn>
  filter?: CvcColumnFilter<TVars>
}

/**
 * What to draw inside a cell.
 *
 * Every variant reads its data through an accessor checked against `TRow`,
 * never by indexing `row[col.key]` — a column's data need not share its key.
 *
 * An `<ng-template cvcCell="key">` in the host overrides whatever is declared
 * here, for the cases no built-in kind covers.
 */
export type CvcCellSpec<TRow> =
  | CvcSelectCell
  | CvcEntityTagCell<TRow>
  | CvcEnumTagCell<TRow>
  | CvcTextTagCell<TRow>
  | CvcTextCell<TRow>
  | CvcCustomCell

/** row checkbox; the table owns the selection, the column just marks the slot */
export interface CvcSelectCell {
  kind: 'select'
}

/**
 * One or more `cvc-tag`s, overflowing into a `cvc-collection-tag`.
 *
 * There is deliberately no `showStatus` toggle: `cvc-tag` applies its
 * deprecated/flagged/status classes from the cached entity unconditionally.
 */
export interface CvcEntityTagCell<TRow> {
  kind: 'entity-tag'
  /** a single ref, a list, or nothing */
  ref: (row: TRow) => Maybe<EntityTagRef> | ReadonlyArray<EntityTagRef>
  /**
   * Projects this column's entity back out of a denormalised row, so the tag
   * can resolve it.
   *
   * `cvc-tag` renders from the Apollo cache alone, keyed `__typename:id`. A
   * `Browse*` row flattens its entities into scalar columns — `BrowseVariant`
   * carries `featureId`/`featureName`/`featureLink` rather than a `feature`
   * object — so it normalises to `BrowseVariant:<id>` and no `Feature:<id>`
   * entry is ever written. The tag then renders `#<id>` even though the name is
   * right there in the response.
   *
   * Declared beside `ref` because the two describe the same entity: `ref` says
   * how to address it, this says how to reconstitute it. The table writes them
   * with `writeCachedEntity`, which satisfies the right fragment and refuses to
   * overwrite an entity a real query already cached. Omit it when the column's
   * entities arrive as real nested objects — those normalise on their own.
   *
   * The returned object must satisfy the typename's `Linkable*` fragment
   * completely; `watchFragment` treats one missing field as incomplete.
   */
  seed?: (row: TRow) => Maybe<LinkableEntity> | ReadonlyArray<LinkableEntity>
  /** tags shown before the rest collapse into a collection tag */
  maxTags?: number
  truncateLabel?: CvcTagLabelMax
  fullWidth?: boolean
  popoverPlacement?: PopoverPlacement
}

/**
 * `cvc-attribute-tag` for a generated enum value.
 *
 * There is deliberately no `showLabel` or `showIcon`: every one of these cells
 * uses `cvcContext="compact"`, which sets `cvcShowLabel = false` in the tag's
 * own ngOnChanges, so such bindings would have no effect.
 */
export interface CvcEnumTagCell<TRow> {
  kind: 'enum-tag'
  /**
   * The raw value, not a rendering of it. `string | number` because evidence
   * ratings are numbers, and the tag's icon resolver switches on the type: a
   * number picks `civic-rating4`, while the string '4' is read as a
   * single-character evidence level and resolves to `civic-level4`, which does
   * not exist — the cell then renders nothing at all.
   */
  value: (row: TRow) => Maybe<string | number>
  /**
   * Tooltip text for the tag. An accessor rather than a flag because the
   * expansion is entity-specific — the evidence manager pipes its enums through
   * `evidenceEnumDisplay` to turn `PREDICTIVE` into a sentence, and a generic
   * table cannot know which pipe an enum wants.
   */
  tooltip?: (row: TRow) => Maybe<string>
}

/** long text shown as a tag, with the full string in a tooltip */
export interface CvcTextTagCell<TRow> {
  kind: 'text-tag'
  text: (row: TRow) => Maybe<string>
}

/** plain text, or a comma-joined list of it */
export interface CvcTextCell<TRow> {
  kind: 'text'
  text: (row: TRow) => Maybe<string | number | ReadonlyArray<string>>
  /** emphasise the active filter substring within the value */
  highlight?: boolean
}

/** drawn entirely by an `<ng-template cvcCell="key">` in the host */
export interface CvcCustomCell {
  kind: 'custom'
}

/**
 * Server-side sort for a column.
 *
 * `column` is a member of the query's generated `*SortColumns` enum, carried
 * as a type parameter so a wrong member is a compile error (the zorro table's
 * own `nzColumnKey` path erases this type entirely). Sort *order* speaks
 * ng-zorro's vocabulary — `NzTableSortOrder` is `'ascend' | 'descend' | null`
 * — and is translated to the generated `SortDirection` only at the query
 * boundary.
 */
export interface CvcColumnSort<TSortColumn extends string> {
  column: TSortColumn
  /** initial sort, as `th[nzSortOrder]` */
  default?: NzTableSortOrder
  /** render the column without a sorter (`nzShowSort` false) */
  disabled?: boolean
}

/**
 * A column's filter control, rendered in a second `thead` row (ant's
 * filter-row idiom). Text/numeric kinds render `nz-input`/`nz-input-number`
 * boxes; the enum kind renders ng-zorro's `nz-filter-trigger` funnel with a
 * dropdown menu — deliberately not `th[nzFilters]`, whose option values are
 * untyped (see `CvcEnumOption`).
 */
export type CvcColumnFilter<TVars> =
  | CvcTextFilter<TVars>
  | CvcNumericFilter<TVars>
  | CvcEnumFilter<TVars>

interface CvcFilterBase<TVars> {
  /**
   * The query variable this filter sets.
   *
   * Typed against the query's own variables so a filter cannot name one the
   * query does not declare — an undeclared variable is silently ignored by the
   * server, producing a filter control that filters nothing.
   */
  var: keyof TVars & string
}

export interface CvcTextFilter<TVars> extends CvcFilterBase<TVars> {
  kind: 'text'
  placeholder?: string
  /** normalise input before it reaches the query, e.g. 'EID123' -> 123 */
  transform?: (value: Maybe<string>) => unknown
  /**
   * Set when the column filters by NAME but is driven externally by ID — the
   * table resolves the id to a display name out of the Apollo cache.
   */
  entityTypename?: TaggableTypename
}

export interface CvcNumericFilter<TVars> extends CvcFilterBase<TVars> {
  kind: 'numeric'
  placeholder?: string
  transform?: (value: Maybe<number>) => unknown
}

/**
 * One choice in an enum column's filter menu.
 *
 * `TValue` carries the generated enum through, so `enumFilterOptions(
 * EvidenceType)` yields options whose values are `EvidenceType` members rather
 * than bare strings — the filter cannot offer a value the schema does not have.
 * It defaults to `string | number` because not every enum column filters on a
 * schema enum: evidence ratings are the numbers 1-5.
 *
 * Deliberately not ng-zorro's `NzTableFilterList`, which types `value` as
 * `any`; the component maps to the vendor shape at the boundary.
 */
export interface CvcEnumOption<TValue = string | number> {
  label: string
  value: TValue
}

export interface CvcEnumFilter<
  TVars,
  TValue = string | number,
> extends CvcFilterBase<TVars> {
  kind: 'enum'
  options: ReadonlyArray<CvcEnumOption<TValue>>
}

/** a column's current filter value, keyed by column */
export type CvcFilterState = Readonly<Record<string, unknown>>

/** the active sort, or none; `order` is ng-zorro's three-valued sort union */
export interface CvcSortState {
  key: string
  order: NzTableSortOrder
}

/**
 * Externally-driven column filter, e.g. from a sibling form field.
 *
 * `value` is what the column's query variable should receive — except for a
 * text filter declaring `entityTypename`, where the host passes an entity
 * **id** and the table resolves it to a display name via the Apollo cache
 * before it reaches the query.
 */
export interface CvcFilterChange {
  key: string
  value: unknown
}

/** externally-driven column visibility */
export interface CvcColumnPref {
  key: string
  visible: boolean
}

/**
 * What a column renders when its accessor yields nothing, absent an override.
 * One value for every cell kind, so a column's empty rendering can be read
 * off its config.
 */
export const DEFAULT_EMPTY_VALUE: CvcEmptyValueCategory = 'unspecified'

/** what a host passes to drive filters and visibility from outside the table */
export interface CvcTableSettings {
  filters?: ReadonlyArray<CvcFilterChange>
  preferences?: ReadonlyArray<CvcColumnPref>
}

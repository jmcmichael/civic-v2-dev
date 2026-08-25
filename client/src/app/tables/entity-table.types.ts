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
 * The column model.
 *
 * Replaces the managers' six-member discriminated union of column types, whose
 * own author noted (variant-manager.types.ts:335) that it never removed the need
 * for guard predicates. The cost of that design was structural: because each
 * union member was a whole column, every column type needed its own `guardType`
 * branch in each of the header, filter and cell sections, and the same
 * width/align/fixed bindings were rewritten in twelve near-identical th/td
 * blocks.
 *
 * Here the discriminant covers only the cell's *contents*. Everything to do with
 * layout lives on the column itself, so one `<th>` and one `<td>` serve every
 * column and the union is narrowed once, at the point it actually varies.
 */
export interface CvcColumn<
  TRow,
  TVars = unknown,
  TSortColumn extends string = string,
> {
  /** stable identity: addresses the column in prefs, filters and data-column */
  key: string
  label: string
  /** passed to th[nzWidth]; use px, e.g. '215px' */
  width: string
  align?: 'left' | 'center' | 'right'
  /** pins the column while the table scrolls horizontally */
  fixed?: 'left' | 'right'
  /** initial visibility; the preferences panel toggles it thereafter */
  hidden?: boolean
  /** tooltip on the column label */
  tooltip?: string
  /** keep the column out of the visible-columns panel, e.g. the select column */
  omitFromPrefs?: boolean
  /**
   * Rendered when the cell accessor yields nothing. Defaults to
   * `DEFAULT_EMPTY_VALUE` for every cell kind.
   *
   * The template used to default per kind — 'not-applicable' for entity tags,
   * 'unspecified' elsewhere — so a column's empty rendering could not be read
   * off its config. One default, overridden per column where the distinction is
   * real (an evidence item with no therapy interaction is not-applicable; one
   * with no description is unspecified).
   *
   * The set of categories is itself unsettled — see
   * agent-artifacts/entity-mgr-table-refactor/empty-value-audit.md.
   */
  emptyValue?: CvcEmptyValueCategory
  cell: CvcCellSpec<TRow>
  sort?: CvcColumnSort<TSortColumn>
  filter?: CvcColumnFilter<TVars>
}

/**
 * What to draw inside a cell.
 *
 * Every variant reads its data through an accessor rather than by indexing
 * `row[col.key]`, and the accessor is checked against `TRow`.
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
 * one or more `cvc-tag`s, overflowing into a `cvc-collection-tag`
 *
 * There is deliberately no `showStatus`. Both manager configs set one and both
 * types files declared one, but no template ever read it — `cvc-tag` applies its
 * deprecated/flagged/status classes from the cached entity unconditionally. It
 * was dead config in the originals; it is not carried forward.
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
 * There is deliberately no `showLabel` or `showIcon`, for the same reason
 * `CvcEntityTagCell` has no `showStatus`: both managers' configs declared them
 * and neither template ever bound them. `cvcContext="compact"` — which every
 * one of these cells uses — sets `cvcShowLabel = false` in the tag's own
 * ngOnChanges regardless, so binding them would not have worked either.
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
 * `column` is the generated `*SortColumns` member, which closes the `any` in
 * `core/utilities/datatable-helpers.ts:13` — whose comment concedes "using `any`
 * here because the zorro table erases the type you pass into it". The table
 * carries the enum as a type parameter, so a wrong member is a compile error.
 */
export interface CvcColumnSort<TSortColumn extends string> {
  column: TSortColumn
  default?: NzTableSortOrder
  disabled?: boolean
}

export type CvcColumnFilter<TVars> =
  | CvcTextFilter<TVars>
  | CvcNumericFilter<TVars>
  | CvcEnumFilter<TVars>

interface CvcFilterBase<TVars> {
  /**
   * The query variable this filter sets.
   *
   * Typed against the query's own variables, so a filter naming a variable the
   * query does not declare fails to compile instead of filtering nothing.
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
 * Replaces ng-zorro's `NzTableFilterList`, which typed `value` as `any` and put
 * a vendor shape in the config surface; the component maps to it at the
 * boundary instead.
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

/** the active sort, or none */
export interface CvcSortState {
  key: string
  order: NzTableSortOrder
}

/** externally-driven column filter, e.g. from a sibling form field */
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
 *
 * One value for every cell kind. The template used to pick per kind, which made
 * a column's empty rendering unreadable from its config and forced the variant
 * manager to override it on all five columns.
 */
export const DEFAULT_EMPTY_VALUE: CvcEmptyValueCategory = 'unspecified'

/** what a host passes to drive filters and visibility from outside the table */
export interface CvcTableSettings {
  filters?: ReadonlyArray<CvcFilterChange>
  preferences?: ReadonlyArray<CvcColumnPref>
}

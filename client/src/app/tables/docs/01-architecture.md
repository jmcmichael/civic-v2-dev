# cvc-entity-table — architecture

The entity table is one configurable, virtual-scrolled, server-driven table
component. A host describes its table as **data** — an `EntityTableSpec`
produced by `entityTableConfig()` — and renders `<cvc-entity-table
[spec]="spec()">`. Everything else (the query pipeline, filtering, sorting,
column preferences, selection, infinite scroll, error display) is owned by the
component and shared by every table built on it.

Two production tables consume it today, each through a thin **facade**
component:

- `cvc-evidence-manager` — `forms/types/evidence-select/evidence-manager/`
  (13 columns: entity tags, six enum tags, a text-tag, EID filter transform)
- `cvc-variant-manager` — `forms/types/variant-select/variant-manager/`
  (7 columns over denormalised `BrowseVariant` rows, with cache seeding)

The 17 browse tables under `views/` are the intended future consumers.

```
  form field (evidence-select / variant-select)
      │  [cvcSelectedIds] (cvcSelectedIdsChange) [cvcTableSettings]
      ▼
  facade (cvc-evidence-manager / cvc-variant-manager)
      │  translates field vocabulary → CvcTableSettings
      │  builds spec = entityTableConfig({ query, columns, … })
      ▼
  cvc-entity-table  ── owns QueryRef, filters, sort, prefs, selection
      │            ╲
      ▼             ╲ (reports up: selectedIdsChange)
  nz-table + cvcTableScrollObserver + filter widgets + cell renderers
```

## The pieces

| File                                                  | Role                                                                                                                            |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `entity-table.component.ts/.html/.less`               | The component: card chrome, toolbar, header/filter/body rows, query pipeline, all user-input state                              |
| `entity-table.types.ts`                               | The column model: `CvcColumn`, the `CvcCellSpec` union, filters, sort, settings types                                           |
| `entity-table-config.ts`                              | `entityTableConfig()` — type-checks a config literal against its query's generated types, then erases them to `EntityTableSpec` |
| `connection.types.ts`                                 | `CvcConnection<TNode>` (the common shape of all 42 `*Connection` types), `connectionNodes()`, `displayedCount()`                |
| `table-scroll.directive.ts`                           | `cvcTableScrollObserver` — scroll phase + next-page requests for the CDK virtual-scroll viewport                                |
| `cell.directive.ts`                                   | `cvcCell` — typed `ng-template` overrides for one-off cells                                                                     |
| `filters/table-filter-input.component.ts`             | Text/numeric filter box in the filter row                                                                                       |
| `filters/enum-filter-menu.component.ts`               | The funnel-icon dropdown for enum filters                                                                                       |
| `enum-filter-options.ts`                              | `enumFilterOptions(Enum)` — filter options derived from a generated enum                                                        |
| `index.ts`                                            | Barrel; its doc names the consumer surface vs. internals                                                                        |
| `testing/entity-table.harness.ts` (in `app/testing/`) | `describeEntityTableContract` — the 12-behaviour contract every table must pass                                                 |

Rendering inside cells is delegated to the tag core: `cvc-tag`,
`cvc-tag-list`, `cvc-collection-tag` (`@app/tags`, cache-driven via
`watchFragment`), `cvc-attribute-tag` (enum values), and `cvc-empty-value`.

## The component

```ts
export class CvcEntityTableComponent<TRow extends { id: number }>
```

`TRow` is the connection's node type. **`id: number` is required** — selection
(`selectedIds`, `isSelected`) and virtual-scroll row tracking key on it.

### Inputs / outputs

| Binding           | Type                               | Notes                                                                               |
| ----------------- | ---------------------------------- | ----------------------------------------------------------------------------------- |
| `[spec]`          | `EntityTableSpec<TRow>` (required) | Produce only via `entityTableConfig()`                                              |
| `[(selectedIds)]` | `number[]` (model)                 | The **complete** selection on every change, not a delta. Emits `selectedIdsChange`. |
| `[settings]`      | `CvcTableSettings`                 | Externally-driven filters + column visibility (see "Settings injection")            |
| `[height]`        | `string` (CSS length)              | Omit to fill available space via the flex chain; set for a fixed-height region      |
| content children  | `ng-template[cvcCell]`             | Per-column cell overrides (see the guide)                                           |

There are no other outputs: filters, sort and preferences are internal state;
the observable consequence of all of them is the query the table sends.

### Internal state (all signals)

- `filterValues: Map<columnKey, unknown>` — the **single home** of every
  filter's value. The query variables and the filter inputs both read it,
  which is why reset cannot desynchronise them.
- `sortState: Maybe<CvcSortState>` — three states, deliberately:
  `undefined` = untouched (column `sort.default` applies); `{key, order}` =
  user sort; `{key, order: null}` = user cleared the sort, which must _not_
  spring back to the default.
- `hiddenOverrides: Map<columnKey, boolean>` — visibility overrides from the
  prefs panel or `settings`, layered over each column's declared `hidden`.
- `result`, `fetchingMore`, `requestError`, `scrollPhase`, `scrollToIndex`.

Derived: `columns` (spec + overrides), `visibleColumns`, `stickyOffsets`
(computed px offsets for pinned columns — ng-zorro's `nzLeft="true"`
auto-measurement does not work in this composition), `queryVars`,
`connection` → `rows` / `pageInfo` / `displayedTotal`, `selectedSet`.

## The column model (`entity-table.types.ts`)

One flat `CvcColumn<TRow, TVars, TSortColumn>` per column. Layout
(`width`/`align`/`fixed`/`hidden`/`tooltip`/`omitFromPrefs`/`emptyValue`)
lives on the column; only the cell contents vary by `cell.kind`, so the
template has exactly one `<th>` for headers, one for filters, and one `<td>`.

Cell kinds (`CvcCellSpec<TRow>` union):

| kind         | renders                                           | key fields                                                                                                                                              |
| ------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `select`     | row checkbox                                      | — (the table owns the selection)                                                                                                                        |
| `entity-tag` | `cvc-tag` / `cvc-tag-list` + `cvc-collection-tag` | `ref(row)` (single, list or nothing), `seed(row)` (cache projection for denormalised rows), `maxTags`, `truncateLabel`, `fullWidth`, `popoverPlacement` |
| `enum-tag`   | `cvc-attribute-tag`                               | `value(row)` — the raw enum value/number, `tooltip(row)`                                                                                                |
| `text-tag`   | icon tag, full text in tooltip                    | `text(row)`                                                                                                                                             |
| `text`       | plain text with filter-match highlighting         | `text(row)` (string, number or list), `highlight`                                                                                                       |
| `custom`     | host-supplied `ng-template[cvcCell]`              | —                                                                                                                                                       |

Every kind reads through an **accessor** (`ref`/`value`/`text`) checked
against `TRow` — a column's data need not share its key, and there is no
untyped `row[col.key]` indexing anywhere.

Filters (`CvcColumnFilter<TVars>` union): `text` (with optional `transform`
normaliser and `entityTypename` for id→name resolution), `numeric`, `enum`
(options usually from `enumFilterOptions(GeneratedEnum)`). Every filter's
`var` is `keyof TVars & string` — a filter cannot name a variable the query
does not declare.

Sort (`CvcColumnSort<TSortColumn>`): `column` is a member of the query's
generated `*SortColumns` enum; `default` seeds the initial sort; `disabled`
shows no sorter.

## How the column model maps onto ng-zorro

`CvcColumn` is largely a typed facade over `nz-table`'s per-cell directive
inputs — the config describes once what the old templates re-bound in every
`th`/`td` block. When debugging rendering, this is the translation table
(bindings applied in `entity-table.component.html`):

| `CvcColumn` member                   | ng-zorro binding / type                                                                                                    | Notes                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`                                | `[nzColumnKey]` on `th`                                                                                                    | also the `data-column` test hook                                                                                                                                                                                                                                                                                                             |
| `width`                              | `[nzWidth]` on `th`                                                                                                        | px strings only — sticky offsets are computed from them                                                                                                                                                                                                                                                                                      |
| `align`                              | `[nzAlign]` on `th`/`td`                                                                                                   | `'left' \| 'center' \| 'right'`, same union                                                                                                                                                                                                                                                                                                  |
| `fixed: 'left'/'right'`              | `[nzLeft]` / `[nzRight]` (`NzCellFixedDirective`)                                                                          | we pass a **CSS length**, never `true`: a string disables ng-zorro's auto-offset measurement (`isAutoLeft` is only true for `''`/`true`), which mis-stacks in this composition — offsets are computed in `stickyOffsets` and the edge-shadow classes (`ant-table-cell-fix-left-last`, `ant-table-cell-fix-right-first`) are applied manually |
| `sort.default`, `CvcSortState.order` | `NzTableSortOrder` (`'ascend' \| 'descend' \| null`)                                                                       | imported directly from `ng-zorro-antd/table` — our sort state speaks ng-zorro's vocabulary and translates to the generated `SortDirection` only at the query boundary                                                                                                                                                                        |
| `sort` presence                      | `[nzShowSort]`, `[nzSortFn]`, `[nzSortOrder]`, `(nzSortOrderChange)`                                                       | `nzSortFn` is set to `true` (server-side contract: "don't sort locally"); actual sorting is the `sortBy` query variable                                                                                                                                                                                                                      |
| `filter` (enum)                      | `nz-filter-trigger` + `nz-dropdown-menu`                                                                                   | deliberately **not** `[nzFilters]`/`NzTableFilterList`, which types option values as `any`; `CvcEnumOption<TValue>` carries the generated enum through and the menu maps to ng-zorro at the boundary                                                                                                                                         |
| `filter` (text/numeric)              | plain `nz-input` / `nz-input-number` in a second `thead` row                                                               | ant expects the filter row inside `thead`                                                                                                                                                                                                                                                                                                    |
| `hidden` / prefs panel               | `nz-checkbox-group` `[nzOptions]`                                                                                          | `columnPrefs()` produces exactly ng-zorro 22's `NzCheckboxOption` shape (`{label, value}`); checked values ride `ngModel` separately (the v22 API split)                                                                                                                                                                                     |
| — (table level)                      | `[nzScroll]="{ x, y }"`, `[nzVirtualItemSize]="28"`, `[nzVirtualForTrackBy]`, `[nzFrontPagination]="false"`, `[nzLoading]` | `nzScroll.y` is written verbatim to the CDK viewport's `style.height`, which is why `'100%'` + the flex chain works                                                                                                                                                                                                                          |

Similarly, `CvcTableQuery` is a structural facade over apollo-angular's
generated `Query` service (over `watch` rather than `fetch`), and the scroll
directive is a reporting wrapper around ng-zorro's embedded
`CdkVirtualScrollViewport` (`measureScrollOffset`, `checkViewportSize`,
`scrollToIndex`, `renderedRangeStream`).

## Configuration (`entity-table-config.ts`)

```ts
export function evidenceManagerConfig(query: EvidenceManagerGQL) {
  return entityTableConfig({
    title: 'Use checkboxes to select or deselect Evidence Items',
    query, // the generated *GQL service
    pageSize: 50, // sent as `first` on EVERY query
    connection: (data) => data?.evidenceItems, // picks the connection
    // scope: { assertionId: 7 },            // always-sent, non-user variables
    // sortVar: 'sortBy',                    // the default
    columns: [
      /* CvcColumn literals */
    ],
  })
}
```

`entityTableConfig()` infers `TData`/`TVars` from the GQL service,
`TNode` from `connection`'s return, and `TSortColumn` from the sort members
used — so the literal is fully type-checked with **zero explicit type
arguments** — then erases the query types so the component carries only
`TRow`. It also throws in dev mode on duplicate column keys (keys address
columns in prefs, filters, sticky offsets and the `data-testid` contract, so
a duplicate is a silent aliasing bug).

Three type-level guarantees, all pinned by self-enforcing `@ts-expect-error`
assertions in `entity-table-config.spec.ts` (an _unused_ `@ts-expect-error`
is itself a compile error, so they cannot rot):

1. `filter.var` must be a declared query variable.
2. Cell accessors must exist on `TRow`.
3. `sort.column` must be a `*SortColumns` member.

What types cannot see — a variable that is _declared but never passed to a
field_ — is covered by a runtime invariant in each manager's config spec,
which walks the query document and requires every filter variable to be
declared **and** used. (That is the exact shape of the historical
`evidenceRating`/`$rating` bug.)

> Note: `EntityTableConfig.seedCache` is declared but currently consumed by
> nothing — real cache seeding is per-column via `cell.seed` (see below).
> Treat it as vestigial; do not build on it.

## Runtime flows

### Initial query

1. `queryVars` (computed) assembles `{...scope, first: pageSize}` + the
   effective sort (`sortState ?? defaultSort`, translated through
   `sort.column` and the generated `SortDirection`) + one entry per filter
   column (transform applied; `null`/`''` become `undefined` so a cleared
   filter is an **absent** variable, never an explicit null).
2. The vars stream is debounced **300 ms** (`QUERY_DEBOUNCE_MS` — collapses
   keystrokes and the one-change-per-column storm of a reset) and deduplicated
   by `JSON.stringify` (`queryVars` builds a fresh object per read, so
   identical variable sets would otherwise re-emit — this is what stops a
   host's mount-time `settings` push from issuing a duplicate opening query).
3. First emission: `queryRef = spec.query.watch({ variables })` — an
   **options object**, never positional (see troubleshooting §1) — and a
   single `valueChanges` subscription feeds `result`.
4. `loading()` is true until the first response, so first paint is a spinner.

### Filter / sort / prefs changes

- `onFilterChange(col, value)` writes `filterValues` — the same map the
  filter inputs and text-highlighting read.
- `onSortChange(col, order)` always writes a state (even `order: null`), so
  "cleared" and "never sorted" stay distinct. One sort at a time.
- `onPrefsChange(visibleKeys)` rewrites `hiddenOverrides`; `omitFromPrefs`
  columns (the select column) never appear in the panel and are never hidden
  by it.
- `onResetFilters()` = `filterValues.set(new Map())` +
  `sortState.set(undefined)`. Sort returns to the configured default;
  visibility is deliberately untouched.
- Any resulting variable change flows through the same debounced pipeline
  into `queryRef.refetch(vars)` (positional — the API differs from `watch`),
  which also clears the in-flight cursor guard and scrolls back to row 0.

### Infinite scroll / fetchMore

`cvcTableScrollObserver` sits on the `nz-table` and **reports rather than
acts**:

- `(scrollPhase)`: `'scroll'` (throttled 250 ms) → `'stop'` (300 ms debounce)
  → the component's `isScrolling()` suspends tag popovers and tooltips while
  a gesture is in flight; `'bottom'` + `hasNextPage === false` shows the
  "No more rows" tag.
- `(fetchRequest)`: when the current offset is within `targetHeight`
  (140 px) of the bottom, throttled 500 ms, it emits
  `{ first: fetchCount, after: endCursor }` via the pure `nextFetch()`
  helper. Bottom detection reads the **current** offset — no `pairwise()` —
  so a single-motion scrollbar drag to the end still fires.
- The directive re-reports the same cursor on repeated near-bottom events.
  **Dedup is the component's job** (`onFetchRequest`): it ignores a cursor
  already in flight and resets that guard when a refetch replaces the
  variables — only the QueryRef's owner can know a cursor went stale, and
  relay cursors are positional, so a post-refetch first page routinely ends
  on the same cursor string.
- `fetchMore({ variables: { ...queryVars(), ...fetch } })` carries the
  current filters and sort; Apollo's `relayStylePagination` policy — keyed on
  **all** the query's arguments in `graphql.type-policies.ts` — appends the
  page into the same cache entry. The component never concatenates rows.

The directive also owns viewport measurement: CDK measures once at first
render (typically before the flex chain has sized the container), so a
`ResizeObserver` on the viewport and its parent triggers rAF-coalesced
`checkViewportSize()` calls. Sizing itself is pure CSS — `nzScroll.y: '100%'`
resolves through the `min-height: 0` flex chain in
`entity-table.component.less`; nothing computes a pixel height in JS.

### Row pipeline and cache seeding

`result → spec.connection(data) → connectionNodes()` (drops null edges)
`→ rows()`. `displayedTotal()` prefers `filteredCount` over `totalCount`
because on `Browse*` connections `totalCount` ignores the filters entirely
(see `connection.types.ts` for the full 42-connection audit).

An effect passes each arriving page to `seedRows`: every `entity-tag` column
declaring `seed(row)` has its projection written with `writeCachedEntity`,
which satisfies the typename's `Linkable*` fragment and **refuses to
overwrite** an entity a real query already cached. This exists for
denormalised `Browse*` rows (e.g. `BrowseVariant` carries
`featureId`/`featureName`/… as scalars, so no `Feature:<id>` entity would
otherwise ever exist and tags would render as `#<id>` skeletons). Queries
returning real nested entities (the evidence manager) spread `Linkable*`
fragments instead and need no seeds.

### Settings injection (host-driven filters and visibility)

`[settings]: CvcTableSettings = { filters?: CvcFilterChange[], preferences?:
CvcColumnPref[] }`. `applySettings` merges filters into `filterValues` and
preferences into `hiddenOverrides`. One subtlety: a text filter declaring
`entityTypename` is _driven by entity id_ but _filters by name_ — the id is
resolved to a display name synchronously out of the Apollo cache
(`readCachedEntityName`); an entity never cached is skipped rather than
guessed at.

The facades translate between vocabularies at this boundary. The evidence
facade accepts the field's existing shape (`preferences` as
`{value, checked}`) so `evidence-select.type.ts` needed no edits, and gates
preference application behind `cvcApplyColumnPreferences` (default **off** —
auto-showing a required sibling's column is a rejected feature kept testable
as a switch). On the field side, `connectTableSettings()` in
`evidence-select.type.ts` builds the payload as a `computed` over the form
state's signals, mapping sibling fields to columns via
`SYNCHRONIZED_FIELD_TO_COL` and required-flags via `REQUIRED_FIELD_TO_COL`.

### Selection

The `select` cell kind renders a checkbox bound to `isSelected(row)`
(an `O(1)` lookup in a `Set` derived from `selectedIds`).
`onRowSelectedChange` emits the complete id set. The facades forward this as
`[cvcSelectedIds]` / `(cvcSelectedIdsChange)` — the frozen contract the form
fields bind.

### Errors

`splitError` separates Apollo 4's single `ErrorLike` into GraphQL errors and
transport errors so the toolbar can label them differently. Errors from
imperative `refetch`/`fetchMore` do **not** surface on `valueChanges`
(apollographql/apollo-client#6857), so each promise's result is inspected
too.

## Testing

- `entity-table.component.spec.ts` — drives the component directly with a
  synthetic three-column spec: variable routing, transforms, sort states,
  reset, selection, prefs, sticky offsets, highlighting, fetchMore dedup.
- `describeEntityTableContract` (`app/testing/entity-table.harness.ts`) — the
  12 behaviours _every_ table must have, run against the manager's **real**
  config in a **real** `cvc-entity-table` over a recording Apollo link. It
  derives coverage from the spec (filters every filterable column, sorts
  every sortable one) rather than naming columns, and asserts **what reaches
  the link**, not what `queryVars` computes — the two came apart once and
  nothing noticed.
- Rows are not asserted in unit tests: the CDK viewport measures real layout
  and renders nothing in jsdom. Row-level behaviour lives in the Playwright
  goldens (`client/e2e/evidence-manager.golden.spec.ts`), which address the
  table through the `data-testid` contract (`entity-table`, `row`,
  `column-header`, `column-filter`, `row-count`, `filter-reset`,
  `column-prefs-trigger/-panel`, all with `data-column`/`data-row-id`).

See `02-authoring-guide.md` for how to build and modify tables, and
`03-troubleshooting.md` for the gotchas.

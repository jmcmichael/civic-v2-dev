# cvc-entity-table — authoring guide

Recipes for the common tasks, using the two shipped tables as worked
examples: `forms/types/evidence-select/evidence-manager/` (rich cell mix,
filter transform) and `forms/types/variant-select/variant-manager/`
(denormalised `Browse*` rows, cache seeding). Read
`01-architecture.md` first if the terms here are unfamiliar — in particular
[The layers](01-architecture.md#the-layers) for where a change belongs,
[The type layer](01-architecture.md#the-type-layer) for what the generics check
and why they erase, and
[What you see, and what draws it](01-architecture.md#what-you-see-and-what-draws-it)
for the region-by-region map of the rendered table.

The general shape of every task: **edit the config, let the compiler tell you
what else must change, then run the config spec.** Column behaviour is data;
the component and template should rarely need edits.

---

## 1. Modifying an existing table

### Change a column's layout

Users can drag-resize columns live: resizable headers carry an
`nz-resizable` right handle (`nzMinWidth` 40, preview line while
dragging). A resize is a **boundary transfer**: the drag moves the edge
the column shares with its next resizable neighbor, so space shifts
between the two, the total stays constant, and the edge lands exactly at
the drop point (`resizeColumnWidths` — every visible column is frozen at
its rendered width in the same write, because the table stretches
specified widths to fill its container and only a sum-preserving write
renders exactly). A handle renders only where a boundary can transfer:
the rightmost resizable column has none — its right edge is the
table's own edge, which stays fixed. Resizes are session state in the table's
`widthOverrides` — the config's `width` stays the source of truth, and
the settings popover's Reset Columns restores it along with visibility.

Icon-only `enum-tag` columns and the select column are not resizable —
widening one only pads its icon until tags can disclose labels at width.
Mark other narrow fixed-tag columns (a compact `text-tag` category
column, a single-icon custom cell) `resizable: false`; the flag also
overrides the kind-based default in either direction.

`width`, `align`, `fixed`, `hidden`, `tooltip`, `emptyValue` are plain column
fields — edit them in the manager's `*.config.ts`. Two constraints:

- `width` should be a **px string** (`'240px'`). It seeds the colgroup;
  pinned-column offsets come from ng-zorro's own measured widths, so the
  declared value no longer has to be arithmetic-exact — but px keeps the
  layout predictable.
- If you pin (`fixed`), keep pinned columns contiguous at their edge —
  ng-zorro sums only the measured widths of the _pinned_ cells before/after
  each one, so a non-pinned column interleaved into a pinned run mis-stacks.
- Never wrap the body's `nz-virtual-scroll` template in `<tbody>` (see
  troubleshooting §11 — it silently zeroes every pinned offset).

### Number columns

`kind: 'number'` delivers the raw value and lets the table format it
(locale grouping, tabular figures). `decimalAlign: true` aligns the
column on the decimal point: every value renders at the highest fraction
precision among the loaded rows — whole numbers zero-fill (891 →
'891.00' beside 406.25) — so with `align: 'right'` the separators stack.
Precision only grows as pages load; rows never reflow back. MP's Score
is the reference use.

### Style a column

`styles` on a column carries inline styles for its three rows — `header`
and `filter` (static), and `cell`, which may be row-driven: statuses,
states, and value ranges. Every cell KIND also carries its own `style`,
layered over the column's `styles.cell` so a kind can override its column.
`heatmapStyle` maps a numeric range onto a background tint:

```ts
{
  key: 'evidenceItemCount',
  // …
  styles: {
    cell: (row) => heatmapStyle(row.evidenceItemCount, { max: 500 }),
  },
}
```

### Change a filter

Enum filters render as the funnel-icon dropdown by default — plain
ng-zorro menu items, the value's civic icon plus its label (`showIcons:
false` drops the icon for enums without a civic set). Set
`control: 'select'` on columns wide enough to show the inline `nz-select`
(users' Role, features'/sources'/variants' Type). Keep the select's
`placeholder` as short as possible — the convention is `'Any'` — and size
the column to the smallest px width that fits the header label and that
prompt (90px fits 'Type'/'Role' + 'Any').

Narrow attribute columns (icon-only `enum-tag` cells) instead set
`control: 'icon-select'` — `cvc-enum-icon-select`, an always-visible
select collapsed to a single glyph: an `All` prompt when clear, the
standard icon + label option list open, and the selected value's civic
icon (label in its tooltip) with ng-zorro's circle-x clear — shown
whenever a value is set — once chosen. No arrow — the prompt is the
affordance. Enums without a civic icon set (`showIcons: false`) collapse
to each option's `shortLabel` instead: assertions' AMP category shows
'IA' the way its cells do, with 'Tier I - Level A' in the option list
and tooltip.

An icon-select may declare `multiple: true`: selections collapse to bare
glyphs side by side (three, then `+N`), deselection happens in the
option list, and the circle-x clears the set. Empty selections emit
null, never `[]`. The filter's `var` must then name one of the server's
PLURAL array args (`assertionTypes`, `evidenceLevels`, …) whose values
OR together — the singular args reject list-typed variables, and both
forms must never be sent together (they AND). Settings-seeded values
pass through whole for multi filters; a scalar seed becomes a one-value
array (the assertions facade's URL params).

A column may also declare `extraFilter` — a second, funnel-only enum filter
rendered beside its primary filter control (the legacy managers'
dual-control filter cell; assertions' therapy-interaction funnel beside the
therapy-name input). It lives in the shared filter state keyed
`` `${key}:extra` ``, so resets and the filter popover cover it, and the
config specs' declared∧used walk should include it.

Hosts with SCOPE state the table cannot see (assertions' status radio) can
list it in the filter popover via `[hostFilters]` +
`(hostFilterRemove)`/`(hostFiltersCleared)` — rows appear when scope departs
from the page's own seed.

Options may declare a `group`: contiguous options sharing one render as a
titled section in both controls (`nz-menu-group` under the funnel,
`nz-option-group` in the select), via `groupEnumOptions`. The same value may
repeat under several groups — assertions' significance filter lists NA per
clinical context — and every occurrence reads as selected; grouped option
loops therefore track by index, not value.

The filter's `var` must be a variable **of that table's query** — it is typed
`keyof TVars`, so a wrong name will not compile. If the variable genuinely
does not exist yet, the fix starts server-side (add the resolver `option`,
regenerate) — see how `92ac25d4d`/`0199f20da` added
`therapyInteractionType`. The manager config specs additionally assert every
filter variable is declared _and_ reaches a field in the document, so run
them after any query edit:

```
yarn ng test --no-watch --include='src/app/forms/types/**/*manager*.spec.ts'
```

Normalise user input with `transform` (text filters only). The evidence EID
filter is the worked example — `'EID123'` and `'123'` both become `123`,
anything else clears the filter by returning `null`:

```ts
filter: {
  kind: 'text',
  var: 'id',
  placeholder: 'EID',
  transform: (value) => {
    const match = value?.toString().trim().match(/^(?:EID)?(\d+)$/i)
    return match ? +match[1] : null
  },
},
```

### Change a sort

`sort.column` must be a member of the query's generated `*SortColumns` enum.
If the schema has no member for the column, the column is not sortable —
do not declare `sort: {}` hoping for the best; `sortBy: { column: undefined }`
fails the whole query (the `aliases` column in the variant manager documents
this). Adding a sort column is a server change: see `2f035db5f` for the
pattern, including the correlated-subquery approach for has-many sorts.

A count or score column should also declare
`directions: SORT_DESCEND_FIRST` — the first question such a column
answers is "which has the most", and every legacy browse table cycled
them descend-first. Omitted, ng-zorro's ascend-first click cycle applies.

### Edit the query itself

After editing a `*.query.gql`, run `yarn generate-apollo` (fast, no server
needed). Two rules:

- Spread the type's `Linkable*` fragment for any taggable entity the query
  puts in the cache (`tags/linkable.fragments.gql` states the invariant).
- If pagination variables change, check the query's `relayStylePagination`
  entry in `graphql.type-policies.ts` — keyArgs must list **all** the
  query's non-pagination arguments, spelled exactly (a misspelled keyArg
  silently merges pages across filter values; see `c9b998e95`).

---

## 2. Adding a column

Add a `CvcColumn` literal to the config's `columns` array (order = render
order). The compiler enforces the accessor against `TRow`, the filter `var`
against the query variables, and the sort against the sort enum. A minimal
enum-tag column, from the evidence manager:

```ts
{
  key: 'evidenceType',
  label: 'ET',
  tooltip: 'Evidence Type',          // also the prefs-panel label
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
```

Checklist:

- **The field must be in the query.** Add it to `*.query.gql` +
  `yarn generate-apollo` or the accessor will not compile.
- `key` must be unique — `entityTableConfig` throws in dev mode otherwise.
- A count column follows the count convention: `label: ''` with `labelIcon`
  set to its entity's civic glyph — the header renders it as a stack of five
  overlapped glyphs (~2px step; a `count-tag` cell is what triggers the
  stack), ~55px — and a `kind: 'count-tag'` cell: a full-width tag carrying
  the entity glyph + the count, whose hover popover shows the counted
  entities themselves. Give the cell `fetch`
  (`(row) => ({ entity: 'EvidenceItem', scope: { diseaseId: row.id } })`,
  resolved lazily by the app's `CVC_COUNT_ENTITY_RESOLVER` — see
  `components/shared/counted-entities/`) or `refs` when the row already
  carries seedable entities; neither renders a plain count tag (counts
  whose entities no query can scope to the row yet).
- If the rows are denormalised (`Browse*`) and the new column is an
  `entity-tag`, it needs a `seed` (see §3 below).
- New enum-tag values may resolve **civic icons** the test harness must know:
  `TABLE_ICONS` in `app/testing/entity-table.harness.ts` registers
  `civicIcons` + the ant set, and every table spec (component spec included)
  imports it — add a brand-new ant icon there, in one place. A missing icon
  throws outside the test call stack and floods the run with unhandled
  errors while every assertion stays green.
- The contract suite picks the column up automatically (it filters every
  filterable column and sorts every sortable one); add a config-spec
  assertion only for column-specific behaviour (a transform, a seed).

### Entity-tag columns on denormalised rows: `seed`

`cvc-tag` renders from the Apollo cache alone, keyed `__typename:id`. A
`Browse*` row flattens its entities into scalars, so nothing ever writes
`Feature:<id>` and the tag renders `#<id>`. Declare `seed` beside `ref` to
project the entity back out — it must satisfy the typename's `Linkable*`
fragment **completely** (`watchFragment` is all-or-nothing):

```ts
cell: {
  kind: 'entity-tag',
  ref: (row) => ({ __typename: 'Feature' as const, id: row.featureId }),
  seed: (row) => ({
    __typename: 'Feature' as const,
    id: row.featureId,
    name: row.featureName,
    link: row.featureLink,
    flagged: row.featureFlagged,
    deprecated: row.featureDeprecated,
    featureType: row.category,   // see the enum-identity note below
  }),
},
```

`writeCachedEntity` never overwrites an entity a real query cached, so seeds
only fill gaps. Pin every seed with a config-spec test that writes it and
reads it back through `readCachedEntity` (see the `cache seeds` describe in
`variant-manager.config.spec.ts`) — that is the only thing guarding the
field list against the fragment. The `featureType: row.category`
substitution works because `VariantCategories` and `FeatureInstanceTypes`
have identical members; the enum-identity test in that spec guards the drift.

---

## 3. One-off cells: `kind: 'custom'` with polymorpheus content

For a cell no built-in kind covers, declare the rendering **in the config**,
where `TRow` is already inferred — no template rendezvous, no extra imports:

```ts
// simplest: a handler returning text
{
  key: 'span',
  label: 'Span',
  width: '80px',
  cell: {
    kind: 'custom',
    content: (ctx) => `${ctx.row.start}–${ctx.row.stop}`,
  },
},

// richer: a component; context arrives via injectContext and same-named inputs
cell: {
  kind: 'custom',
  content: new PolymorpheusComponent(CvcMyCellComponent),
},
// in CvcMyCellComponent:
//   private readonly ctx = injectContext<CvcCellContext<MyRow>>()
//   — or declare `row` / `column` inputs and let the outlet write them
```

- `content` is a `PolymorpheusContent<CvcCellContext<TRow>>` — a handler, a
  `PolymorpheusComponent`, or a `TemplateRef` (grab one with `viewChild` in
  the facade). Prefer handler/component: the outlet types template contexts
  weakly.
- The context is `{ $implicit: row, row, column, isScrolling, filterText }`
  — `filterText()` is the column's live text-filter value, for match
  emphasis the way built-in kinds highlight (the users table's User tag is
  the worked example) — and suspend any
  popover/tooltip the cell renders while `isScrolling` is true, the way the
  built-in tag kinds do (§ Scroll etiquette below).
- A custom cell owns its whole rendering, including its empty state — it
  opts out of the shared filter-highlighting and empty-value handling, so
  prefer a built-in kind when one fits.
- `entityTableConfig` throws in dev mode when a custom cell has no content
  (the old string-keyed template lookup failed silently blank instead).

---

## 4. Creating a new cell kind

When a rendering pattern recurs across tables (rather than one column in one
table), extend the union instead of using `custom` everywhere:

1. **Type** — add `CvcMyKindCell<TRow>` to `entity-table.types.ts` with a
   unique `kind` discriminant and accessor(s) typed against `TRow`; add it to
   the `CvcCellSpec<TRow>` union. Follow the accessor rule: data comes
   through a function of the row, never `row[col.key]`.
2. **Template** — add an `@case ('my-kind')` to the `@switch (cell.kind)` in
   `entity-table.component.html`. Bind `@let cell = col.cell;` is already in
   scope and narrows the union. Render `<cvc-empty-value
[cvcEmptyCategory]="col.emptyValue ?? defaultEmptyValue">` when the
   accessor yields nothing — every kind has an empty state.
3. **Scroll etiquette** — if the cell renders popovers or tooltips, suspend
   them while scrolling (`[popover]="!isScrolling()"`, or `isScrolling() ?
undefined : tooltip`), as the tag and enum-tag cells do.
4. **Component support** — only if the kind needs shared logic (the way
   `text` has `textSegments()` for highlight). Keep it a pure method.
5. **Tests** — a case in `entity-table.component.spec.ts` if there is
   component logic; otherwise the config specs of the tables that adopt it.
   Register any new icons (see §2 checklist).
6. **Export** the new type from `index.ts`.

The bar for a new kind: it must be expressible as config (data + accessors),
carry its own empty state, and not need per-table branching in the template.
If it needs the latter, it is a `custom` cell.

## 5. Extending an existing cell kind

Add the optional field to the cell interface in `entity-table.types.ts`,
consume it in the template with a default (`cell.maxTags ?? list.length`
style), and leave existing configs untouched — optional-with-default is the
pattern (`maxTags`, `truncateLabel`, `fullWidth`, `popoverPlacement`,
`highlight` all work this way). Never repurpose an existing field's meaning;
configs are data shared across tables.

Same recipe for column-level options: add to `CvcColumn`, bind in the one
`<th>`/`<td>`, default in the template.

---

## 6. Creating a new table (query → config → facade)

Using the variant manager as the template (it is the smaller of the two):

1. **Query.** Write `my-table.query.gql`: one paginated connection query,
   `Linkable*` fragments spread for real nested entities, and the fields
   every column accessor needs. `yarn generate-apollo`. Add the
   `relayStylePagination` entry for the field in
   `graphql.type-policies.ts` with **all** non-pagination args as keyArgs.

2. **Config.** `my-table.config.ts`:

   ```ts
   export function myTableConfig(query: MyTableGQL) {
     return entityTableConfig({
       title: '…',
       query,
       pageSize: 50,
       connection: (data) => data?.myConnection,
       scope: {},            // always-sent variables, if any
       columns: [ … ],
     })
   }
   ```

   A function taking the GQL service (not a constant) so the config is
   testable with `TestBed.inject(MyTableGQL)` and carries no injection of its
   own.

   Keep `connection` **before** `columns`, as above — `columns`' accessors
   need `TNode` (inferred from `connection`'s return) already resolved to
   type-check; reversing the order collapses inference for the whole literal
   (docs/03-troubleshooting.md, "Odds and ends").

3. **Facade component.** A thin standalone component owning the spec and the
   host-facing vocabulary:

   ```ts
   @Component({
     selector: 'cvc-my-table',
     imports: [CvcEntityTableComponent],
     changeDetection: ChangeDetectionStrategy.OnPush,
     template: `
       <cvc-entity-table
         [spec]="spec()"
         [selectedIds]="cvcSelectedIds()"
         (selectedIdsChange)="cvcSelectedIds.set($event)"
         [settings]="settings()" />
     `,
   })
   export class CvcMyTableComponent {
     private readonly query = inject(MyTableGQL)
     readonly cvcSelectedIds = model<number[]>([])
     protected readonly spec = computed(() => myTableConfig(this.query))
   }
   ```

   Keep translation logic (host vocabulary → `CvcTableSettings`) in the
   facade, as `evidence-manager.component.ts` does — the table's types are
   not the host's contract. Write the two-way binding out longhand rather
   than `[(selectedIds)]="cvcSelectedIds"`; the banana box compiles but IDE
   analysis flags writing to a readonly signal property.

4. **Height context.** Three modes on `[height]`: a fixed CSS length
   (`'400px'` — detail-page embeds); `'auto'` — fit the visible viewport,
   stopping at the page layout's measured bottom padding rather than the
   window edge (what browse-table home pages want; the facades default to
   it when the host passes no `cvcHeight`); or omitted — fill a
   height-bounded ancestor via the flex chain (the managers' drawer does;
   see the facade `.less` files for the `flex` + `min-height: 0` +
   `min-width: 0` passthrough). With no bounded ancestor the omitted mode
   collapses to zero height — use `'auto'`.

   **Card chrome.** Two hooks for hosts whose cards carry more than a title
   string (the browse tables' downloaders and scope menus):

   ```html
   <ng-template #cardTitle
     ><i
       nz-icon
       nzType="pie-chart"></i>
     Variants</ng-template
   >
   <cvc-entity-table
     [spec]="spec()"
     [titleTemplate]="cardTitle">
     <cvc-table-downloader
       cvcTableCtrlButton
       [tableName]="'variants'" />
   </cvc-entity-table>
   ```

   `[titleTemplate]` replaces the `spec().title` text. Two toolbar
   slots: `cvcTableCtrlButton` joins the action bar's compact button
   group ahead of Filters/Settings (downloaders — wrap button text in
   `.ctrl-label` so it drops with the bar's labels at narrow
   breakpoints); `cvcTableToolbarExtra` lands beside the bar, outside
   the group (scope menus, toggles).

5. **Config spec.** Copy the shape of `variant-manager.config.spec.ts`:
   the filter declared∧used invariant, sort-members assertion, accessor
   tests, seed round-trips if any — then call
   `describeEntityTableContract({ spec, operationName, connection, rows, … })`
   with two representative rows. The contract needs your connection shape and
   (only if a filter normalises input, like the EID one) a `filterInputs`
   entry so its typed value is not vacuous.

6. **Golden spec** (optional but recommended for user-facing tables): a
   `client/e2e/*.golden.spec.ts` addressing the table through the
   `data-testid` contract only. Runs against a live dev server; keep it
   session-free if the page allows.

---

## 7. Where NOT to put things

- **Row shaping** belongs in accessors, not preprocessed row copies — the
  rows are Apollo cache objects accumulated by `relayStylePagination`;
  never map/clone them into new arrays (that breaks `trackById` stability).
- **New table state** belongs in the component only if every table needs it;
  otherwise it is facade state.
- **Query manipulation** stays in the component's single pipeline. Facades
  must not hold their own `QueryRef` — serialising refetch/fetchMore through
  one owner is what prevents the race class the old managers had.
- **`FormlyModule.forRoot`** and field registration are unrelated to tables;
  a facade used by a form field is just a component the field's template
  renders.

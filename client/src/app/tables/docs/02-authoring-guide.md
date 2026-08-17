# cvc-entity-table — authoring guide

Recipes for the common tasks, using the two shipped tables as worked
examples: `forms/types/evidence-select/evidence-manager/` (rich cell mix,
filter transform) and `forms/types/variant-select/variant-manager/`
(denormalised `Browse*` rows, cache seeding). Read
`01-architecture.md` first if the terms here are unfamiliar.

The general shape of every task: **edit the config, let the compiler tell you
what else must change, then run the config spec.** Column behaviour is data;
the component and template should rarely need edits.

---

## 1. Modifying an existing table

### Change a column's layout

`width`, `align`, `fixed`, `hidden`, `tooltip`, `emptyValue` are plain column
fields — edit them in the manager's `*.config.ts`. Two constraints:

- `width` must be a **px string** (`'240px'`). Sticky offsets for pinned
  columns are computed arithmetically from the declared widths (`pxWidth`);
  a `%`/`em` width parses to 0 and shifts every pinned column after it.
- If you pin (`fixed`), keep pinned columns contiguous at their edge — the
  offsets stack left-to-right / right-to-left in declaration order, matching
  ng-zorro's own model.

### Change a filter

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
- If the rows are denormalised (`Browse*`) and the new column is an
  `entity-tag`, it needs a `seed` (see §3 below).
- New enum-tag values may resolve **civic icons** the test harness must know:
  `TABLE_ICONS` in `app/testing/entity-table.harness.ts` already registers
  `civicIcons` + the ant set, but a brand-new ant icon in a cell must be
  added there _and_ in `entity-table.component.spec.ts`'s `NzIconModule.forRoot`
  list — a missing icon throws outside the test call stack and floods the
  run with unhandled errors while every assertion stays green.
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

## 3. One-off cells: the `cvcCell` template override

For a cell no built-in kind covers, declare `cell: { kind: 'custom' }` (or
override any kind) and supply a typed template from the host:

```html
<cvc-entity-table [spec]="spec()">
  <ng-template
    cvcCell="molecularProfile"
    [cvcCellOf]="spec()"
    let-row>
    <cvc-tag [ref]="row.molecularProfile" />
  </ng-template>
</cvc-entity-table>
```

- `cvcCell` names the column `key`; the template receives
  `{ $implicit: row, row, column }` (`CvcCellContext<TRow>`).
- `[cvcCellOf]="spec()"` exists **only to type `let-row`** — a directive's
  generic can only be inferred from its own inputs, so binding the same spec
  gives `TRow` something to infer from. Its value is never read.
- The host imports `CvcCellDirective`; the table only queries for it.
- Prefer a built-in kind when one fits: a custom cell opts out of the shared
  filter-highlighting and empty-value handling.

Caveat: a misspelled `cvcCell` key renders a silently blank cell — the
`@case ('custom')` branch has no else. Check the key against the config.

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

4. **Height context.** The table fills its container via a flex chain — the
   host must give it a definite height (the managers' drawer does; see the
   facade `.less` files for the `flex` + `min-height: 0` + `min-width: 0`
   passthrough). Alternatively pass a fixed `[height]="'400px'"`.

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

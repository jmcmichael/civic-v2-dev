# cvc-entity-table — troubleshooting, gotchas, tips

Field guide to the failure modes this library has actually produced or
inherited. Ordered roughly by how likely you are to hit them. `§` references
are to sections of this file; file references are repo-relative.

---

## 1. The query fired but sent no variables

**Symptom:** table loads, but ignores `pageSize`/`scope`/filters; page one is
100 rows (the server's `default_max_page_size`) regardless of config.

**Cause:** apollo-angular's three entry points disagree —
`Query.watch({ variables })` and `QueryRef.fetchMore({ variables })` take
**options objects**, while `QueryRef.refetch(vars)` is **positional**.
Calling `watch(vars)` against a hand-written structural type can compile and
silently pass your variables object as unrecognised _options_.

**Guards already in place:** `CvcTableQuery` types `watch` as options-only,
and the component spec's _"puts those variables on the wire"_ test records
the operation at the mock link and fails if variables stop arriving. Keep
both if you touch the pipeline; on-the-wire assertions are the only kind
that can see this class of bug (`queryVars()` assertions stay green).

## 2. A filter control that filters nothing

**Symptom:** typing/selecting in a column filter changes nothing; no error.

**Cause:** the variable never reaches a field. An undeclared variable is
silently ignored by GraphQL; a declared-but-unused one too. Historically:
the rating filter sent `evidenceRating` where the query declared `$rating`,
and `therapyInteractionType` had no server argument at all.

**Guards:** `filter.var: keyof TVars` (compile-time) plus each manager
config spec's _declared ∧ used_ document walk (runtime). If you add a filter
and the invariant test fails, the query is missing the plumbing — fix the
document (or the server resolver), don't loosen the test.

## 3. Cleared filter returns zero rows

A cleared filter must become an **absent** variable. An explicit `null`
reaches the resolver and filters for rows whose column IS null. The
component already maps `null`/`''` → `undefined` in `queryVars`; preserve
that if you add value plumbing. Related: `transform` should return `null`
for unparseable input (clears the filter), not throw or pass junk through.

## 4. Pages merge across filter values / duplicate or missing rows on scroll

**Check the type policy first.** `relayStylePagination(keyArgs)` for the
query's field in `graphql.type-policies.ts` must list **every**
non-pagination argument, spelled exactly. A misspelled or missing keyArg
does not error — it stops partitioning, so every filter value shares one
cache list and `fetchMore` pages merge across them (`c9b998e95` fixed six of
these, incl. `therapayName`).

Also remember the split of responsibilities: Apollo accumulates rows, the
component never concatenates; `fetchMore` carries `{...queryVars(), ...fetch}`
so filters/sort ride along; and in-flight-cursor dedup lives **only** in
`CvcEntityTableComponent.onFetchRequest` — the scroll directive re-reports
cursors by design. Don't add a second guard in the directive: it cannot be
reset when a refetch invalidates a cursor, and relay cursors are positional,
so a post-refetch first page routinely ends on the same cursor string
(that exact stale-guard bug shipped once).

## 5. Table renders zero rows in the browser (data is present)

Almost always height, not data. The chain that must hold:

- The **host** gives the table a definite height (flex context or
  `[height]`). The card, card body, ant's spin/table wrappers and the CDK
  viewport are all made flex columns with `min-height: 0` in
  `entity-table.component.less` — every rule in that chain is load-bearing.
- `nzScroll.y` is **not a measurement API** — ng-zorro writes it verbatim to
  the viewport's `style.height`, which is why `'100%'` works. Do not
  reintroduce the browse tables' auto-height directives here; they compute
  the number in JS on racing schedules.
- A zero-height viewport also _reads as scrolled-to-bottom_, which is why
  the scroll directive guards `getViewportSize() > 0` before bottom
  detection — remove that and a hidden/drawer-mounted table fetches page two
  before the user does anything.

In **jsdom** the viewport measures no layout and renders nothing, by design:
unit tests must not assert on rows. Row behaviour belongs to the Playwright
goldens.

## 6. Entity tags render as `#123` skeletons

`cvc-tag` renders from the Apollo cache alone. Either:

- the query returns real nested entities but doesn't spread the type's
  `Linkable*` fragment (the invariant is stated in
  `tags/linkable.fragments.gql`) — add the spread, regenerate; or
- the rows are denormalised (`Browse*`) and the column lacks a `seed`, or
  the seed misses a fragment field. `watchFragment` is **all-or-nothing**:
  one missing field leaves `complete` false and the tag stays a skeleton
  forever, silently. Pin every seed with a write-then-read config-spec test.

Also: `writeCachedEntity` deliberately refuses to overwrite an entity a real
query already cached — a "stale seed" is almost never the explanation, and a
partial seed is worse than none.

## 7. Enum-tag cell renders nothing for a valid value

The attribute tag's icon resolver switches on the **JS type** of the value:
the number `4` resolves `civic-rating4`; the _string_ `'4'` is read as a
single-character evidence level → `civic-level4`, which does not exist, and
the cell renders blank. Enum-tag `value` accessors must return the raw value
(`row.evidenceRating`, a number), never a stringified rendering. This is why
`CvcEnumOption` defaults to `string | number` and why the enum filter menu
needs `$any` for the rating options (`cvc-attribute-tag` types
`cvcAttrValue` as the string-enum union; widening it belongs to that
component).

Also note there are **two components with the `cvc-attribute-tag`
selector** — the table imports the one from
`@app/forms/components/attribute-tag`, not `@app/components/shared/…`.
Import the wrong module and templates compile against the wrong inputs.

## 8. Tests green, runner floods with "icon does not exist" errors

Ant's icon service throws **outside the test's call stack**, so every
assertion passes while unhandled errors pile up (this hit 867/run at its
worst). Any icon a cell can render must be registered:
`TABLE_ICONS` in `app/testing/entity-table.harness.ts` (ant set +
`civicIcons`) covers the contract; `entity-table.component.spec.ts` keeps
its own `NzIconModule.forRoot` list. Add new icons to the shared list, not
to a single spec.

## 9. A second identical query on mount

`queryVars` builds a fresh object on every read, so any signal it touches
re-emits it even when the variables are identical — a host pushing
`settings` on mount rewrites the filter map without changing the query, and
the table once answered with a duplicate opening request. The pipeline
dedupes with `JSON.stringify` identity behind a 300 ms debounce; if you see
double queries again, something is bypassing the debounced driver, not the
dedup being too weak.

## 10. Sort quirks

- **Three states, not two.** `undefined` = untouched (config default
  applies); `{order: null}` = user cleared it, must NOT revert to the
  default. Only `onResetFilters` returns to `undefined`. If you "simplify"
  the sort state to two states, the cleared-stays-cleared test fails.
- A column without a `*SortColumns` member is **not sortable** — declaring
  `sort: {}` sends `sortBy: { column: undefined }` and fails the whole
  query (it did, for years, on two columns).
- `nzSortFn` is `true` = "server contract"; local array sorting is never
  correct here since rows are one page of a larger set.

## 11. Pinned-column misalignment

We do not use ng-zorro's `nzLeft="true"` auto-measurement — its per-row
coordination never reached these cells (everything resolved to `left: 0` and
stacked). Offsets are **computed** from declared px widths in
`stickyOffsets`, and the edge-shadow classes are applied manually. So:

- pinned columns need px widths (anything else parses to 0 and shifts every
  offset after it);
- hiding a pinned column via prefs recomputes offsets automatically — but if
  you add a new visibility mechanism, make sure it flows through
  `visibleColumns()`;
- a string `nzLeft` is what _disables_ ng-zorro's auto mode (`isAutoLeft` is
  only true for `''`/`true`) — that is intentional, keep passing lengths.

## 12. Settings injection subtleties

- `CvcTableSettings.filters` values are query-variable values — **except**
  text filters with `entityTypename`, which are driven by entity **id** and
  resolved to a display name via the cache (`readCachedEntityName`). An
  entity that was never cached is skipped, not guessed: if a host injects an
  id before anything cached that entity, the filter silently does not apply.
  (In the form flows the id always arrives via a select whose tag query has
  already cached it.)
- The facades gate preference application: `cvcApplyColumnPreferences`
  defaults to **false** on the evidence manager — the field computes a
  preferences payload, but auto-showing required columns is a rejected
  feature kept testable as a switch. Don't "fix" the default.
- ng-zorro 22 note for the prefs panel: `nz-checkbox-group` takes options
  via `[nzOptions]` and checked values via `ngModel` **separately**; the
  pre-v21 style of passing `{label, value, checked}` objects through
  `ngModel` renders nothing, silently.

## 13. Popovers/tooltips flicker or jam while scrolling

Cell popovers/tooltips are suspended during scroll gestures via
`isScrolling()` (scroll-phase reporting: throttle 250 ms → `stop` after
300 ms quiet). New cell kinds must do the same or a fast scroll leaves
orphaned overlays. If phases seem wrong, remember both throttle _and_
debounce sit on `elementScrolled()` — events during a gesture, one `stop`
after it.

## 14. Custom cells

- A misspelled `cvcCell` key = silently blank cell (`@case ('custom')` has
  no else branch). Check against the config's `key`.
- `let-row` is only typed because `[cvcCellOf]="spec()"` gives the
  directive's generic something to infer from; the input's value is never
  read. Removing "the redundant binding" un-types every template.
- The guard only works because the selector is the structural
  `ng-template[cvcCell]` — Angular consults `ngTemplateContextGuard` under
  `strictTemplates` on structural directives only.

## 15. Odds and ends

- **`EntityTableConfig.seedCache` is vestigial** — declared, erased by the
  spec, consumed by nothing. Column-level `cell.seed` is the real mechanism.
  Either use that or delete the field; don't wire new code to it.
- **`Maybe<T>` is `T | undefined`,** but the server sends literal `null` —
  accessors that just forward a row field must survive both (the `text`
  path already checks both; copy it).
- **Edge `node` is optional** on `CvcConnection` because codegen emits
  `node?: X | undefined`; requiring it makes no generated connection
  assignable and poisons `TNode` inference with `| undefined`.
- **`totalCount` means opposite things** across the schema: post-filter on
  plain connections, pre-filter on `Browse*` (which add `filteredCount`).
  Never read either directly — use `displayedCount()`.
- **Contract tests skip silently** when a config lacks the column under test
  (`if (!column) return` sites in the harness) — a config change can delete
  coverage with a green tick. When removing a column, check what the
  contract was covering through it.
- **The two scroll directives coexist**: `cvcTableScrollObserver` (this
  library, reports) vs the app-wide `cvcTableScroll`
  (`app/directives/table-scroll/`, calls `fetchMore` itself, used by the 17
  browse tables). Never let both match one `nz-table`; the legacy one is
  deleted only when the browse tables migrate.
- **`fixture.whenStable()` never resolves** in this TestBed setup; every
  spec uses the manual `settle(ms)` pattern (400 ms clears the 300 ms query
  debounce).
- **Builds clobber `server/public`** (tracked deploy artifacts). After
  `yarn build`, from the repo root:
  `git checkout -- server/public && git clean -fdq server/public`.
- **Codegen:** `yarn generate-apollo` after `.gql` edits (no server needed);
  never run `generate-apollo:full` (needs the Rails server; schema dumps are
  run manually).

## Tips

- Debug variables at the wire, not the computed: inject `provideMockApollo`
  with a `recorded` array (or watch the Network tab) — `queryVars()` can be
  right while the wire is wrong (§1).
- Drive component tests through the public template API
  (`onFilterChange` / `onSortChange` / `onPrefsChange` / `onFetchRequest`)
  and assert on `recorded`, mirroring the existing specs.
- Every column key doubles as a **test hook**: `[data-testid][data-column]`
  on headers, filters and cells; rows carry `data-row-id`. Address e2e specs
  through those, never DOM structure.
- When behaviour differs between the two managers, diff their configs first
  — the component is shared, so a divergence is almost always config data.
- `entity-table-config.spec.ts` is the place for new _type-level_
  guarantees: assert them with `@ts-expect-error` so they are self-enforcing.

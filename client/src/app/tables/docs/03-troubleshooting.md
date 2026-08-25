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
  the viewport's `style.height`, which is why `'100%'` works. For a page
  with no height-bounded ancestor, pass `[height]="'auto'"` — the
  component's own measured viewport-fit (ViewportRuler + ResizeObserver,
  bottom reserve from the layout's computed styles). Do not reintroduce the
  legacy `cvcAutoHeightCard`/`cvcAutoHeightDiv` directives; they compute
  window math on racing schedules and ignore layout padding. Their
  `cvcAutoHeightTable` sibling is gone — it lost its last consumer when the
  browse tables migrated, and was deleted rather than left as a trap.
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

## 11. Pinned-column misalignment — the `<tbody>` trap

Pinned offsets are ng-zorro's own: boolean `nzLeft`/`nzRight`, widths from
the table's hidden measure row, edge-shadow classes applied by
`NzTrDirective`. **The one rule that keeps this working: never wrap the
body's `nz-virtual-scroll` template in `<tbody>`** — even though ng-zorro's
own virtual-scroll demo shows one.

Why (root-caused live against ng-zorro 22.0.6): in virtual mode `nz-table`
never places its projected content — the viewport supplies its own `<tbody>`
— but Angular still _instantiates_ projected content in the declaring view.
A user `<tbody>` therefore becomes a live, **detached** `NzTbodyComponent`
sharing the table's `NzTableStyleService`. Its measure row observes
parentless `<td>`s, whose ResizeObserver notifications report every width as
0, and it emits that all-zeros array into the service ~1 ms _after_ the real
measure row emits the true widths. Last write wins: every auto cell is
written `left/right: 0px` and the pinned columns stack at the edges. The
colgroup still looks right — its stream falls back to declared `nzWidth`s on
zero measurements; the offset stream has no such fallback — which is what
makes the symptom look like anything but a width problem.

If every pinned column suddenly sits at `0px`: someone re-added the wrapper
(or introduced any other never-placed `tbody` into the table's content). The
golden 'pinned columns hold their measured offsets' fails on exactly this.

The legacy browse tables (outside this library) all follow the demo pattern
and ship this bug today; migrating them onto `cvc-entity-table` fixes it per
table. Other notes:

- keep pinned columns contiguous at their edge — ng-zorro sums only the
  _pinned_ cells' measured widths on each side;
- hiding a column via prefs re-measures automatically (the offsets follow
  the real rendered widths, which may stretch beyond the declared px when
  the table does not overflow).

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
after it. A `kind: 'custom'` cell gets the same signal as a plain
`isScrolling` field on its `CvcCellContext` (it has no template-scope
access to the component) — same suspend rule applies.

## 14. Custom cells

- Content is declared in the config (`cell: { kind: 'custom', content }`),
  typed against `TRow` there; a missing `content` throws from
  `entityTableConfig` in dev mode.
- The polymorpheus outlet types a **template** arm's context weakly
  (`$implicit` narrows to `never` for object contexts) — prefer the handler
  or component arms, which are fully typed.
- A component arm reads its context via
  `injectContext<CvcCellContext<Row>>()`, and the outlet also writes context
  keys onto same-named inputs (`row`, `column`).
- A custom cell renders nothing but its content: no shared empty-value
  fallback, no filter highlighting. That is the trade for full control.

## 15. Odds and ends

- **Cache seeding is per column,** via `cell.seed` on an `entity-tag` column.
  There is no config-level seeding hook.
- **`Maybe<T>` is `T | undefined`,** but the server sends literal `null` —
  accessors that just forward a row field must survive both (the `text`
  path already checks both; copy it).
- **Edge `node` is optional** on `CvcConnection` because codegen emits
  `node?: X | undefined`; requiring it makes no generated connection
  assignable and poisons `TNode` inference with `| undefined`.
- **`totalCount` means opposite things** across the schema: post-filter on
  plain connections, pre-filter on `Browse*` (which add `filteredCount`).
  Never read either directly — use `displayedCount()`.
- **Contract tests report inapplicable behaviours as skipped** (`ctx.skip`
  with a reason). Two skips are expected today; a growing skip count means a
  config quietly stopped exercising a behaviour — investigate, don't accept.
- **`connection` must appear before `columns` in the config literal**, or
  every column's `(row) => ...` accessor silently infers `row: unknown` and
  every downstream property collapses to the same generic error the manager
  configs warn about (`'row' is of type 'unknown'` everywhere, `EntityTableSpec<unknown>`
  at every call site that reads the resulting spec). `TNode` is inferred from
  `connection`'s return type, and TypeScript resolves an object literal's
  properties in source order — `columns` earlier in the literal gets checked
  before `TNode` exists to contextually type it. Every shipped config
  (`variants-table.config.ts` et al.) puts `connection` first; match that
  order rather than rediscovering why.
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

## 16. Row height inflation from cell content

The 28px virtual rows grow (e.g. to 35px) wherever some cell's content
adds vertical space the row math didn't plan for. The subtle culprit:
`overflow: hidden` (or any overflow ≠ visible) on an INLINE-BLOCK cell
element moves its baseline to its bottom margin edge, so the host's live
line box opens descender space UNDER the element — ~6px at the default
font. Fix at the cell host: `line-height: 0` (no line box, no gap) plus
`vertical-align: top` on the inline-block. Diagnose by measuring
`getBoundingClientRect().height` down the chain (td → cell host → inner
element) — the level where the height jumps is the level with the live
line box. The count-tag cell is the reference implementation.

## 17. Toolbar projection traps

Two Angular/ng-zorro mechanics meet in the header action bar
(`cvc-entity-table-header-ctrls`) and will bite any similar refactor:

- **Re-projected content vanishes.** Forwarding host content through an
  intermediate component (`<child><ng-content select="[slot]" /></child>`)
  drops the content unless the intermediate `ng-content` re-declares the
  selector with `ngProjectAs="[slot]"` — the child's own `select` cannot
  match a bare forwarded `ng-content` node.
- **Projected buttons ignore the compact group.** `nz-space-compact`
  distributes its item classes and its `nzSize` by DI, and element
  injectors follow the LOGICAL tree (the declaration site — the facade),
  not the projection site — so a projected button never receives them.
  The bar CSS-joins projected buttons (`display: contents` on the
  wrapper + corner/border collapse) and sets `nzSize` on the group
  element, which also overrides the native buttons' own size inputs.

## Live-probing the table in a real browser

The method that root-caused §11, kept here because it generalises to any
"works in specs, wrong on screen" problem. jsdom cannot answer layout or
vendor-internals questions; a throwaway Playwright spec against the running
dev server can, in seconds per iteration.

1. **Throwaway spec.** Drop a `client/e2e/probe.spec.ts`; `npx playwright
test e2e/probe.spec.ts` attaches to the dev server already running on
   `127.0.0.1:4200` (`reuseExistingServer`). `console.log('PROBE ' +
JSON.stringify(data))` in the test, `| grep PROBE` on the run. Delete the
   spec when the question is answered.
2. **Reaching the table:** `/assertions/add` renders the evidence manager
   without a session — click the button named `/manager/i`, wait for
   `[data-testid="row"]`. Address everything through the `data-testid` /
   `data-column` contract.
3. **Angular's dev-mode `ng` global** (inside `page.evaluate`):
   `ng.getComponent(el)` and `ng.getDirectives(el)` give live instances —
   including private members, so a vendor service like `nzTableStyleService`
   is reachable from its component. `ng.getOwningComponent(el)` names the
   component whose _template declared_ an element (this is what unmasked the
   detached tbody's owner), and `ng.getHostElement(cmp)` works even for
   components whose host was never attached to the document.
4. **Reading a subject's current value** without disturbing it: subscribe,
   capture, unsubscribe — `ReplaySubject`/`BehaviorSubject` hand the latest
   value to a late subscriber synchronously.
5. **Finding a writer:** wrap the subject —
   `const orig = subj.next.bind(subj); subj.next = v => { log(v, new
Error().stack); orig(v) }` — every emission arrives with a stack trace
   that names the caller (dev builds keep real names).
6. **Fingerprinting instances:** patch the class prototype through any live
   instance (`Object.getPrototypeOf(ng.getComponent(el))`) and log
   `ng.getHostElement(this).isConnected` + an ancestor chain per call. To
   patch _before_ a component is born, patch on one instance, then destroy
   and re-create the UI (close/reopen the manager) so the new instance runs
   through it — or poll every few ms for the element and hook on sight.
7. **Timelines beat states.** Stamp everything with `performance.now()`
   relative to one `t0` and log into a single `window.__log` array: a
   MutationObserver for element births, your own `ResizeObserver` alongside
   the vendor's, and the patched subjects — ordering ambiguities (the §11
   race was two writes 0.8 ms apart) only show up on one merged timeline.
8. **Prove the build before trusting the probe.** A template edit needs the
   dev server to rebuild before the probe sees it; add a temporary sentinel
   attribute (`data-probe="exp-…"`) and `waitForSelector` it. Two rounds of
   this investigation were nearly wasted on a stale build.

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

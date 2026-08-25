# Entity stream architecture

`cvc-entity-stream` is the configurable feed: a card-framed, cursor-paginated
list of heterogeneous items, virtual-scrolled or Load-More-buttoned, whose
rendering and filtering vocabulary travel in a spec built by
`entityStreamConfig()`. It is the stream analog of `cvc-entity-table`
(`../tables/docs/01-architecture.md`) and follows the same design: configs are
type-checked against their query's generated types, then erased into the shape
the component reads.

Sibling docs: [authoring guide](./02-authoring-guide.md) ·
[troubleshooting](./03-troubleshooting.md)

## The pieces

| Piece | File | Role |
|---|---|---|
| `entityStreamConfig()` | `entity-stream-config.ts` | check-then-erase factory: `EntityStreamConfig<TQuery, TItem>` → `EntityStreamSpec<TItem>` |
| `CvcEntityStreamComponent` | `entity-stream.component.ts` | the card, layout slots, query driving, engine lifecycle, selection model |
| `CvcStreamItemComponent` | `stream-item.component.ts` | per-item shell: checkbox, toggle rail, summary/extra/footer outlets, animated lazy detail region |
| `CvcEntityStreamQuery` | `entity-stream-query.ts` | one QueryRef; run/refetch/fetchMore/refresh; `getRange` (the scroller's datasource contract) |
| `CvcStreamState` | `stream-state.ts` | expansion + selection keyed by item id, surviving view recycling |
| `CvcStreamScrollState` | `scroll/stream-scroll-state.ts` | `isScrolling`/`isAtTop`/`isAtBottom` signals for item content |
| vscroll engine | `scroll/vscroll-engine.ts` | the ONLY module importing `ngx-ui-scroll`/`vscroll`; `datasource`/`routines`/`reload()`/`check()` |

## Layers

```
facade (cvc-activity-stream, …)
  spec (entityStreamConfig)  +  [filters] patch  +  projected panels
    └─ cvc-entity-stream
         ├─ CvcEntityStreamQuery ── Apollo QueryRef ── relay connection
         ├─ scroll engine (infinite) or @for + Load More (button)
         └─ cvc-stream-item × N ── polymorpheus outlets ── facade renderers
```

- **Facades own vocabulary.** The core has no filter/column model: a facade
  converts its own filter state to a query-variables patch and binds
  `[filters]`; the core merges `{ first, ...filters, ...scope }` (scope wins
  collisions), debounces 300 ms, dedups by JSON value, and runs the query.
- **Renderers are polymorpheus content** (components preferred), receiving a
  per-view stable `CvcStreamItemContext` whose members are live reads (item,
  isScrolling, expanded, selected) plus actions (toggle, setSelected).
  Facade-specific services reach renderers through the element injector — a
  facade component `providers: [...]` wraps the stream, so content stamped
  inside it resolves those services.
- **Detail is lazy twice over**: a kind's `detail.load()` dynamic-imports its
  detail component on first expansion, and the component owns its own detail
  query — the stream's connection document stays summary-only.

## Query flow

`run(vars)` opens the QueryRef once and refetches thereafter; `fetchMore`
appends a page under the variables of the current result set (`lastVars`),
deduped per in-flight cursor; Apollo's `paginatedByAllArgs()` type policy —
not the store — accumulates pages. `getRange(index, count)` is the virtual
scroller's datasource: resolve from loaded edges, or fetch one page at the
loaded tail and resolve after it lands; short/empty resolutions signal the end
of the set, and a generation counter empties ranges awaited across a
variables change.

## Sizing

Same model as the table (see its docs): explicit CSS height; `'auto'`
(measured viewport fit, live re-measured); or omitted, filling a
height-bounded ancestor through the flex chain in
`entity-stream.component.less`. The legacy JS auto-height directives are not
used here and must not be reintroduced.

## Test layers

1. config/type guards (`entity-stream-config.spec.ts`) and pure stores
   (`entity-stream-query.spec.ts`, `scroll/*.spec.ts`)
2. component synthetic spec in `'button'` mode
   (`entity-stream.component.spec.ts`) — the full pipeline in jsdom
3. per-facade contract (`describeEntityStreamContract` in
   `testing/entity-stream.harness.ts`) — a real spec against a recording mock
   link: what actually reaches the wire
4. browser goldens — the only layer that asserts rendered items, because the
   virtual scroller renders nothing without real layout

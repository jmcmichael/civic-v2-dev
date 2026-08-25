# Stream troubleshooting

Sibling docs: [architecture](./01-architecture.md) ·
[authoring guide](./02-authoring-guide.md)

## The list renders nothing

- **`'infinite'` with no bounded height.** The scroller needs a definite
  viewport: give the stream `height: 'auto'` on a page, or put it inside a
  height-bounded ancestor (the flex chain carries it down). In jsdom this is
  expected — the scroller measures real layout; assert items only in browser
  goldens.
- **The engine exists only after the first result set.** `engine()` is
  undefined until the connection arrives; the template's `@if` around the
  scroller is load-bearing.

## Items misbehave on expand/scroll

- **Heights stale after expansion or detail load** → something skipped the
  re-measure: the shell calls `check()` on `(@details.done)` and after a
  detail lazy-load renders; custom content that changes its own height later
  must call `CvcStreamState.heightSettled()`.
- **Expansion/selection lost after scrolling away and back** → state must be
  keyed by item id in `CvcStreamState`, never held on the item view; the
  shell already does this — content should read `context.expanded`/
  `context.selected` rather than caching them.
- **Popovers vanish mid-interaction** → content is being recreated. The
  context object is per-view stable; do not spread it into new objects or
  bind template outlets with inline context literals (client/AGENTS.md
  gotcha). While diagnosing, remember popovers are suspended during scroll by
  design (`context.isScrolling`).

## Query problems

- **Two opening queries** → something bypassed the debounced driver; all
  variable changes must flow through `[filters]`/spec, never a direct
  `query.run`.
- **A filter appears to do nothing** → its key collides with `scope` (scope
  wins, by design), or its cleared value is `null` instead of `undefined`
  (null reaches the resolver and matches null-valued rows).
- **Pages replace instead of appending** → the field's type policy is
  missing or hand-listed: use `paginatedByAllArgs()` in
  `graphql.type-policies.ts`.
- **Empty nodes with interface fragments in tests** → the mock cache needs
  `possibleTypes`; use `provideMockApollo` (already wired) rather than a bare
  `InMemoryCache`.

## Icons flood test output with unhandled errors

Ant's icon service throws outside the test's call stack, so assertions pass
while the runner reports unhandled errors. Register through
`NzIconModule.forRoot(STREAM_ICONS)` (`testing/entity-stream.harness.ts`) or
add the missing icon there.

## Detail region shows the missing-renderer message

The item's `kind` has an `expandable` entry but the registry has no entry for
that discriminator (or `load` resolved a module without the expected export).
Registry keys must exactly match the `kind()` accessor's output.

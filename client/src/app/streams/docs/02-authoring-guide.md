# Authoring a stream facade

The order that works: query document → config → renderers → facade component
→ contract spec → consumer migration. `components/activities/activity-stream/`
is the worked example for every step.

Sibling docs: [architecture](./01-architecture.md) ·
[troubleshooting](./03-troubleshooting.md)

## 1. Query document

A relay connection query, **summary-only**: nodes carry what the summary line
renders and nothing else. Detail fields belong to the detail component's own
per-id query. Declare `first/last/before/after`; add option-source fields
(`@include`-gated if a panel needs them). Run `yarn generate-apollo`.

Add the field's pagination policy in `graphql.type-policies.ts` —
`paginatedByAllArgs()` — in the same commit as the first consumer.

## 2. Config

```ts
export function myStreamConfig(options: {
  query: MyStreamGQL
  scope: Partial<MyStreamQueryVariables>
  title?: string
}): EntityStreamSpec<MyStreamNode> {
  return entityStreamConfig({
    query: options.query,
    title: options.title,
    pageSize: 25,
    scope: options.scope,                       // always sent; filters cannot override
    connection: (data) => data?.myField,        // TItem inferred from this return
    counts: (c) => ({ total: c.totalCount, rows: c.edges.length }),
    emptyState: (ctx) => `Nothing matches…`,    // handler or PolymorpheusComponent
    pagination: 'infinite',                     // or 'button' for Load More
    item: {
      id: (item) => item.id,
      kind: (item) => item.__typename,          // or any discriminator
      summary: new PolymorpheusComponent(MySummaryComponent),
      extra: new PolymorpheusComponent(MyDateComponent),   // optional header-trailing
      footer: …,                                // optional, below detail
      selectable: (item) => item.status === 'NEW',  // omit for no selection UI
      kinds: {
        SomeKind: {
          expandable: true,
          detail: { load: () => import('./detail/…').then((m) => m.MyDetail) },
        },
      },
    },
  })
}
```

Dev-mode guards: an expandable kind must declare `detail` — a region that
expands to empty space is refused at config time.

## 3. Renderers

Components stamped by polymorpheus, reading
`injectContext<CvcStreamItemContext<TItem>>()`. Rules:

- read `context.isScrolling` to suspend popovers while scrolling;
- never copy context values into local state — the context's reads are live;
- facade-wide state (scope, viewer, panel-derived visibility) comes from a
  facade-provided service injected normally — provide it on the facade
  component, and declare it in the contract spec's `providers`;
- a detail component owns its data: fetch by id (the context carries the
  item), show nothing extra while loading — the shell already skeletons.

## 4. Facade component

Wraps `<cvc-entity-stream>`; converts filter state → variables patch; projects
panels into the slots:

```html
<cvc-entity-stream [spec]="spec()" [filters]="filterVars()" [height]="height()">
  <div cvcStreamHeaderExtra><my-settings-button [(settings)]="settingsState" /></div>
  @if (showFilters()) {
    <div cvcStreamSidebar><my-filter-panel [(filters)]="filtersState" /></div>
  }
</cvc-entity-stream>
```

- `cvcStreamSidebar` needs `CvcStreamSidebarDirective` imported — presence
  renders the column. Header-extra and banner are plain attribute selectors.
- Seed panel state with `linkedSignal(() => this.hostInput())` so host
  re-seeds propagate while user edits stick.
- Reach the stream (`refresh()`, `connection()`, `selectedIds`) via
  `viewChild(CvcEntityStreamComponent)`.

## 5. Contract spec

```ts
describe('my stream contract', () => {
  describeEntityStreamContract<MyStreamNode>({
    spec: () => myStreamConfig({ query: TestBed.inject(MyStreamGQL), scope: {…} }),
    operationName: 'MyStream',
    items: [itemOne, itemTwo],
    connection: (items, pageInfo) => ({ myField: { edges: …, pageInfo, … } }),
    sampleFilters: myFilterBuilder(defaults),     // the facade's REAL builder output
    providers: [MyStreamStateService],            // what the facade provides
  })
})
```

Add facade-specific `it`s beside the contract. Wire-parity specs against a
predecessor's variable builder (see `activity-stream.parity.spec.ts`) are the
cheapest insurance a migration can buy while both builders exist.

## 6. Consumer migration

One consumer per commit where shapes differ. Sizing: pages use
`height: 'auto'`; height-bounded embeds omit it; `'button'` streams flow
naturally. Bundle-check with `yarn analyze` after the first consumer and
after deleting the predecessor.

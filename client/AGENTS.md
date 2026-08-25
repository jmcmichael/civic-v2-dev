# Agent guide — client (Angular 22)

Read the root `AGENTS.md` first for repo-wide agreements, gates and dev
processes. This file covers client-specific conventions and the failure
modes that actually bite.

## Code style

- Prettier: no semicolons, single quotes, 80 columns, one attribute per
  line in templates. The tree is not uniformly prettier-clean — format only
  files you edit, or diffs fill with churn.
- Standalone components, `input()`/`model()`/signals, OnPush. Imports are
  sorted by module path.
- Check IDE inspections (Serena/JetBrains MCP) for problems, not just build
  output.

## The entity-table framework (`src/app/tables/`)

One configurable virtual-scrolled table drives all migrated browse/manager
tables. **Read `src/app/tables/docs/01-architecture.md`,
`02-authoring-guide.md` (§6 for new tables), `03-troubleshooting.md` before
touching it** — they are maintained in lockstep with the code.

Conventions every table config follows:

- Count/score columns: `label: ''`, `labelIcon: 'civic-<entity>'` (twotone,
  entity-colored), `directions: SORT_DESCEND_FIRST`, ~55px; the header
  `tooltip` carries the name and doubles as the prefs-panel label.
- Subject column (first entity column): entity-tag `fullWidth: true`
  (labels flex-ellipsize when clipped); custom subject cells use block
  host+tag styles.
- Text cells are single-line ellipsized (28px virtual rows); clip-prone
  columns opt into `tooltip: true`.
- Enum filters: funnel icon by default; `control: 'select'` (+placeholder)
  on columns wide enough (~130px).
- `[height]`: explicit px | `'auto'` (viewport-fit minus measured layout
  padding — browse facades default to it) | omitted = flex-fill inside a
  height-bounded ancestor (form managers). Never reintroduce the legacy
  auto-height directives in tables.
- `CvcCellContext` is live: `isScrolling` (suspend popovers while true) and
  `filterText()` (column's current text filter, for match emphasis).
- Locale numbers via `formatCount()`; counts render beside the card title;
  a table with no filterable columns renders no filter row.
- Type-policies: browse fields use `paginatedByAllArgs()` in
  `graphql.type-policies.ts` — never hand-maintained keyArgs lists.

## Recurring gotchas

1. **Linkable-fragment completeness**: a tag rendering `#<id>` means the
   query's selection misses a field the `Linkable*` fragment requires
   (`src/app/tags/linkable.fragments.gql`). Only the live browser shows it.
2. **NgTemplateOutlet context churn**: an inline
   `[ngTemplateOutletContext]="{...}"` literal recreates the embedded view
   every CD tick, destroying stateful content (popovers, timers). Prebuild
   stable context objects (see `tag-overflow.component.ts`).
3. **Icons**: enum filters over icon-less enums need `showIcons: false`;
   unregistered ant icons throw _outside_ the test call stack — vitest
   stays green while unhandled errors flood. Register in `TABLE_ICONS`.
4. **Config literals**: keep `connection` before `columns` — reversed order
   collapses inference ("'row' is of type 'unknown'" everywhere). A wrong
   `filter.var` produces the same symptom; fix the var, not the rows.
5. **ng-zorro lazy styles**: a component needing a style-heavy nz widget on
   a lazy route ships the stylesheet via a carrier component (see
   `activity-feed/feed-filters/date-picker-styles.component.ts`); never
   `encapsulation: None` on the consumer.
6. Popover content that loads async must re-anchor: use
   `cvcPopoverContentResize` (`src/app/tags/`) or the bespoke tags'
   `(contentRendered)` output.

## Testing

- Vitest via `@angular/build:unit-test`; explicit vitest imports, no
  globals; provider-based mocking (`src/app/testing/apollo-test.providers.ts`).
- Tables: `describeEntityTableContract` + per-table `*.config.spec.ts`
  (filter declared∧used walk, sorts, accessors, cache seeds). Rows are
  never asserted in jsdom (cdk-virtual-scroll doesn't render there) —
  row-level behavior belongs to Playwright against a live serve.
- jsdom can't do layout: height/measurement features assert their
  resolution logic only; verify visually on your own `--port 4201` serve.
- When migrating a legacy component, characterization-test it first
  (`src/app/testing/legacy-table.harness.ts`) and **commit the
  characterization spec** before the refactor commit deletes it.

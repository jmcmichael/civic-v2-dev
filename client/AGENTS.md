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
- Check IDE inspections (via the available MCP inspection tools) for
  problems, not just build output.

## The entity-table framework (`src/app/tables/`)

One configurable virtual-scrolled table drives all migrated browse/manager
tables. **Read `src/app/tables/docs/01-architecture.md`,
`02-authoring-guide.md` (§6 for new tables), `03-troubleshooting.md` before
touching it** — they are maintained in lockstep with the code.

Conventions every table config follows:

- Count/score columns: `label: ''` + `labelIcon: 'civic-<entity>'`
  (twotone, entity-colored), `directions: SORT_DESCEND_FIRST`, ~55px; the
  header `tooltip` carries the name and doubles as the prefs-panel label.
  Cells are `kind: 'count-tag'` — full-width count tags whose hover popover
  lists the counted entities (lazy `fetch` via `CVC_COUNT_ENTITY_RESOLVER`
  in `components/shared/counted-entities/`, or in-row `refs`; plain when
  no query can scope the entities to the row). Icon+label headers (variants
  Type, mp Score) get their gap from CSS — the header template is
  whitespace-controlled, never pad with spaces.
- Subject column (first entity column): entity-tag `fullWidth: true`
  (labels flex-ellipsize when clipped); custom subject cells use block
  host+tag styles.
- Text cells are single-line ellipsized (28px virtual rows); clip-prone
  columns opt into `tooltip: true`.
- Enum filters: funnel icon by default (plain menu items: civic icon +
  label; options may declare a `group` for sectioned menus/selects);
  `control: 'select'` on columns wide enough, prompt `'Any'`, column sized
  to fit label + prompt (~90px).
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
7. **Leaderboard cache policies**: `LeaderboardUser`/`LeaderboardOrganization`
   are embedded (`keyFields: false`) and `UserLeaderboards`/
   `OrganizationLeaderboards` deep-merge (`merge: true`) in
   `graphql.type-policies.ts` — normalizing the rows by id folds all four
   boards/windows into one object and clobbers rank; replacing the keyless
   namespace drops the other boards. Don't reintroduce `no-cache` on the
   leaderboard components (it only masked this) and don't normalize
   row types whose fields depend on the query that fetched them.
8. **`profileImagePath(size:)`**: fetch it only where an avatar actually
   renders (`cvc-user-avatar`/`cvc-organization-avatar` or a direct
   `nz-avatar` binding) — `cvc-user-tag`/`cvc-organization-tag` render no
   avatar, so image fields on tag-only users are dead weight. URLs are
   stable per blob+size (server proxy mode), so identical fetches are free.

## Testing

- Vitest via `@angular/build:unit-test`; explicit vitest imports, no
  globals; provider-based mocking (`src/app/testing/apollo-test.providers.ts`).
- Tables: `describeEntityTableContract` + per-table `*.config.spec.ts`
  (filter declared∧used walk, sorts, accessors, cache seeds). Rows are
  never asserted in jsdom (cdk-virtual-scroll doesn't render there) —
  row-level behavior belongs to Playwright against a live serve.
- jsdom can't do layout: height/measurement features assert their
  resolution logic only; verify visually on your own `--port 4201` serve.
- When migrating a legacy component, characterization-test it first and
  **commit the characterization spec** before the refactor commit deletes
  it. (The browse-table migration is complete — its harness was
  `legacy-table.harness.ts`, retired with the 17th table; resurrect the
  pattern from history for the next legacy family, e.g. the feeds.)
- Mutation-wired custom cells: per-row popover hosting the existing form,
  `optimisticResponse` through `MutatorWithState`'s options for the instant
  cache flip, no table refetch — see
  `source-suggestions-table-actions-cell.component.ts`.

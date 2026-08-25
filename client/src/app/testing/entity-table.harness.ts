import { Component, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import {
  AlignLeftOutline,
  CloseCircleFill,
  FilterFill,
  QuestionCircleOutline,
  RetweetOutline,
  SearchOutline,
  SettingOutline,
  SyncOutline,
} from '@ant-design/icons-angular/icons'
import {
  CvcEntityTableComponent,
  CvcPageInfo,
  CvcSpecColumn,
  EntityTableSpec,
} from '@app/tables'
import { civicIcons } from '@app/icons-provider.module'
import { readCachedEntity } from '@app/tags'
import { Apollo } from 'apollo-angular'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { describe, expect, it, type TestContext } from 'vitest'
import {
  MockGraphqlOperation,
  provideMockApollo,
} from './apollo-test.providers'

/**
 * Every icon the table's toolbar, filter row and cells can render: the ant
 * toolbar/filter icons plus the civic-* icons enum-tag cells resolve.
 *
 * Ant's icon service throws on an unregistered name, and it throws *outside*
 * the test's own call stack — so a missing icon leaves every assertion passing
 * while the runner reports a flood of unhandled errors. Registered here so no
 * caller has to rediscover that.
 */
export const TABLE_ICONS = [
  AlignLeftOutline,
  CloseCircleFill,
  FilterFill,
  QuestionCircleOutline,
  RetweetOutline,
  SearchOutline,
  SettingOutline,
  SyncOutline,
  ...civicIcons,
]

@Component({
  imports: [CvcEntityTableComponent],
  template: `<cvc-entity-table
    [spec]="spec()"
    [(selectedIds)]="selected" />`,
})
class TableHostComponent<TRow extends { id: number }> {
  readonly spec = signal<EntityTableSpec<TRow>>(undefined as never)
  selected: number[] = []
}

export interface EntityTableContractConfig<TRow extends { id: number }> {
  /**
   * Builds the table's real spec. A factory rather than a value because it has
   * to run inside the TestBed, where its generated *GQL service is injectable.
   */
  spec: () => EntityTableSpec<TRow>
  /** the GraphQL operation the spec's query issues */
  operationName: string
  /** two rows, returned as page one; the second is also page two */
  rows: [TRow, TRow]
  /** wraps rows in this query's own connection shape, under its field name */
  connection: (
    rows: ReadonlyArray<TRow>,
    pageInfo: CvcPageInfo
  ) => Record<string, unknown>
  /**
   * A value to type into a text filter. What matters is where it lands, not
   * what it selects.
   */
  filterValue?: string
  /**
   * What to type into a column whose filter normalises its input before the
   * query sees it, keyed by column. The evidence EID filter accepts 'EID123'
   * and turns it into 123; the generic sample would transform to null and make
   * that column's assertion vacuous.
   */
  filterInputs?: Record<string, string>
  /**
   * Entities the table is expected to have written into the cache from its
   * rows, as `[typename, id]`. Only the columns whose `seed` is declared;
   * everything else arrives normalised from the query itself.
   */
  seeded?: ReadonlyArray<[string, number]>
}

export interface EntityTableHarness<TRow extends { id: number }> {
  fixture: ComponentFixture<TableHostComponent<TRow>>
  table: CvcEntityTableComponent<TRow>
  apollo: Apollo
  /** every operation the table has issued, in order */
  operations: MockGraphqlOperation[]
  /** the variables of the table's own operations only */
  requests(): Record<string, any>[]
  /**
   * Flushes the query debounce and re-renders. `fixture.whenStable()` never
   * resolves in this TestBed — a zone macrotask stays pending — so waits are
   * manual, as in `enum-field.harness.ts`.
   */
  settle(ms?: number): Promise<void>
  column(key: string): CvcSpecColumn<TRow>
}

/**
 * Mounts one table's real config in a real `cvc-entity-table`, against a mock
 * Apollo link that records every operation.
 *
 * The distinction from `entity-table.component.spec.ts` is what is under test:
 * that spec drives the *component* with a synthetic three-column spec, and the
 * per-manager config specs check each config as *data*. Neither mounts a real
 * config in the table, which is where a filter wired to the wrong variable or a
 * sort that never reaches the wire would actually show.
 */
export async function createEntityTableHarness<TRow extends { id: number }>(
  config: EntityTableContractConfig<TRow>
): Promise<EntityTableHarness<TRow>> {
  const operations: MockGraphqlOperation[] = []

  // Self-contained: a spec's own `describe` may already have configured and
  // injected from the TestBed, which would make configuring again throw. The
  // contract must not care what its enclosing suite has done.
  TestBed.resetTestingModule()
  await TestBed.configureTestingModule({
    imports: [TableHostComponent, NzIconModule.forRoot(TABLE_ICONS)],
    providers: [
      provideMockApollo(
        // page two is a different row, so an appended page is distinguishable
        // from a replaced one
        (op) =>
          op.variables['after']
            ? config.connection([config.rows[1]], {
                hasNextPage: false,
                hasPreviousPage: true,
                startCursor: 'b',
                endCursor: 'b',
              })
            : config.connection(config.rows, {
                hasNextPage: true,
                hasPreviousPage: false,
                startCursor: 'a',
                endCursor: 'b',
              }),
        operations
      ),
      // cvc-tag renders a routerLink, and the dropdowns and popovers animate.
      // entity-table.component.spec.ts needs neither, because its synthetic
      // spec has no entity-tag column — a real config always does.
      provideRouter([]),
      provideNoopAnimations(),
    ],
  }).compileComponents()

  const fixture = TestBed.createComponent<TableHostComponent<TRow>>(
    TableHostComponent as never
  )
  fixture.componentInstance.spec.set(config.spec())
  fixture.detectChanges()

  const table = fixture.debugElement.children[0]
    .componentInstance as CvcEntityTableComponent<TRow>

  const harness: EntityTableHarness<TRow> = {
    fixture,
    table,
    apollo: TestBed.inject(Apollo),
    operations,
    requests: () =>
      operations
        .filter((op) => op.operationName === config.operationName)
        .map((op) => op.variables),
    async settle(ms = 400) {
      fixture.detectChanges()
      await new Promise((r) => setTimeout(r, ms))
      fixture.detectChanges()
    },
    column(key) {
      const found = table.columns().find((c) => c.key === key)
      expect(found, `no column keyed '${key}'`).toBeTruthy()
      return found!
    },
  }

  return harness
}

/**
 * The behaviour every table built on `cvc-entity-table` must have, driven
 * through one manager's real config. Call inside a `describe` for that table;
 * add config-specific `it`s alongside it.
 *
 * A behaviour this config cannot exercise — no text filter, no tooltip,
 * nothing highlighted — calls `ctx.skip` rather than returning early, so the
 * runner reports it as skipped. A silent pass for a behaviour nothing drove is
 * how a config change deletes coverage without anyone seeing it.
 *
 * Rows are deliberately never asserted on. The body is a `cdk-virtual-scroll`
 * viewport, which measures against real layout and renders nothing in jsdom —
 * the same reason `table-scroll.directive.spec.ts` tests its pure `nextFetch`
 * rather than the directive. Rendering is covered by the Playwright goldens,
 * which run in a real browser; everything below is the query, selection and
 * preferences logic, which is not.
 */
export function describeEntityTableContract<TRow extends { id: number }>(
  config: EntityTableContractConfig<TRow>
): void {
  const filterValue = config.filterValue ?? 'kinase'
  const setup = () => createEntityTableHarness(config)

  /**
   * A text column whose sample input survives its own transform. The evidence
   * manager's first text column is the EID filter, which normalises anything
   * unlike an EID to null — picking it blindly would make these assertions
   * vacuous rather than failing.
   */
  const usableTextColumn = (h: EntityTableHarness<TRow>) =>
    h.table.columns().find((column) => {
      if (column.filter?.kind !== 'text') return false
      const typed = filterInput(column, config.filterInputs, filterValue)
      return transformed(column, typed) != null
    })

  describe('entity-table contract', () => {
    it('opens with a single query carrying its page size and scope', async () => {
      const h = await setup()
      await h.settle()

      const opening = h.requests()
      expect(opening).toHaveLength(1)
      expect(opening[0]).toMatchObject({
        first: h.table.spec().pageSize,
        ...h.table.spec().scope,
      })
    })

    /**
     * `queryVars` rebuilds a fresh object whenever any signal it reads emits,
     * so a host pushing `settings` on mount used to produce a second, identical
     * opening request.
     */
    it('does not re-query when the variables come out identical', async () => {
      const h = await setup()
      await h.settle()
      const opening = h.requests().length

      h.table.onFilterChange(h.table.columns()[0], null)
      await h.settle()

      expect(h.requests()).toHaveLength(opening)
    })

    /**
     * `filter.var` is typed `keyof TVars`, so naming a variable the query does
     * not declare is a compile error. What types cannot check is that the
     * *value* arrives — which is how the evidence rating filter shipped
     * pointing at `evidenceRating` while the query declared `$rating`.
     */
    it('routes every filterable column to the variable it declares', async () => {
      const h = await setup()
      await h.settle()

      const filterColumns = h.table.columns().filter((c) => c.filter)
      const expected = new Map<string, unknown>()
      for (const column of filterColumns) {
        const typed = filterInput(column, config.filterInputs, filterValue)
        expected.set(column.key, transformed(column, typed))
        h.table.onFilterChange(column, typed)
      }
      // one settle for all of them: the debounce collapses the changes into a
      // single query, which also proves the filters coexist rather than
      // overwriting one another
      await h.settle()

      const sent = h.requests().at(-1)!
      for (const column of filterColumns) {
        const value = expected.get(column.key)
        const where = `column '${column.key}' -> $${column.filter!.var}`
        if (value === null || value === '') {
          // a value that normalises to nothing must omit the variable rather
          // than send null, which would select rows whose column is null
          expect(sent[column.filter!.var], where).toBeUndefined()
        } else {
          expect(sent[column.filter!.var], where).toEqual(value)
        }
      }
    })

    /**
     * One sort is active at a time, so unlike the filters these cannot be
     * collapsed into a single query — the loop pays a debounce per column, and
     * the evidence manager has eleven of them. Hence the explicit budget.
     */
    it('sends the generated sort column for every sortable column', async () => {
      const h = await setup()
      await h.settle()

      for (const column of h.table.columns().filter((c) => c.sort)) {
        h.table.onSortChange(column, 'ascend')
        // just past the debounce: the default settle is generous, and here it
        // is paid once per column
        await h.settle(350)

        expect(
          h.requests().at(-1)![h.table.spec().sortVar],
          `column '${column.key}' did not reach $${h.table.spec().sortVar}`
        ).toEqual({ column: column.sort!.column, direction: 'ASC' })
      }
    }, 20_000)

    it('omits a cleared filter rather than sending null', async (ctx: TestContext) => {
      const h = await setup()
      const column = usableTextColumn(h)
      if (!column) ctx.skip('no text filter survives its own transform')
      const typed = filterInput(column, config.filterInputs, filterValue)

      h.table.onFilterChange(column, typed)
      await h.settle()
      h.table.onFilterChange(column, null)
      await h.settle()

      // an explicit null reaches the resolver and selects rows whose column is
      // null; "no filter" has to be an absent key
      expect(h.requests().at(-1)![column.filter!.var]).toBeUndefined()
    })

    /**
     * Reset must clear the query and the filter inputs together. The two
     * disagree whenever a filter's value has more than one home — the
     * regression this guards, which once left the reset button reading as
     * inert.
     */
    it('reset clears the query and the filter inputs together', async (ctx: TestContext) => {
      const h = await setup()
      const column = usableTextColumn(h)
      if (!column) ctx.skip('no text filter survives its own transform')
      const typed = filterInput(column, config.filterInputs, filterValue)

      h.table.onFilterChange(column, typed)
      await h.settle()

      h.table.onResetFilters()
      await h.settle()

      expect(h.table.filterValue(column.key)).toBeNull()
      expect(h.requests().at(-1)![column.filter!.var]).toBeUndefined()
    })

    /**
     * The cursor moves through a result set; the filters and sort define which
     * one. A `fetchMore` that dropped them would append a page from a different
     * list.
     *
     * Note what this does and does not guard. Apollo merges the variables
     * passed to `fetchMore` over the QueryRef's existing ones, so simply
     * *omitting* them client-side changes nothing on the wire — verified by
     * mutation, and worth knowing before anyone "simplifies" the call site on
     * the strength of this test. What it does catch is a variable actively sent
     * wrong or blanked, and any change that stops refetch and fetchMore sharing
     * one QueryRef.
     */
    it('carries the current filters and sort into a fetchMore', async () => {
      const h = await setup()
      await h.settle()

      const filtered = usableTextColumn(h)
      const sorted = h.table.columns().find((c) => c.sort)
      const typed = filtered
        ? filterInput(filtered, config.filterInputs, filterValue)
        : undefined
      if (filtered) h.table.onFilterChange(filtered, typed)
      if (sorted) h.table.onSortChange(sorted, 'descend')
      await h.settle()

      h.table.onFetchRequest({ first: h.table.spec().pageSize, after: 'b' })
      await h.settle()

      const paged = h.requests().at(-1)!
      expect(paged['after']).toBe('b')
      if (filtered) {
        expect(paged[filtered.filter!.var]).toEqual(
          transformed(filtered, typed)
        )
      }
      if (sorted) {
        expect(paged[h.table.spec().sortVar]).toEqual({
          column: sorted.sort!.column,
          direction: 'DESC',
        })
      }
    })

    it('emits the complete selection whenever a row is toggled', async () => {
      const h = await setup()
      await h.settle()
      const [first, second] = config.rows

      h.table.onRowSelectedChange(first, true)
      h.table.onRowSelectedChange(second, true)
      h.table.onRowSelectedChange(first, false)

      expect(h.table.selectedIds()).toEqual([second.id])
      expect(h.table.isSelected(second)).toBe(true)
      expect(h.table.isSelected(first)).toBe(false)
    })

    it('hides a column through the preferences panel, but never a pinned one', async (ctx: TestContext) => {
      const h = await setup()
      await h.settle()

      const hideable = h.table
        .columns()
        .find((c) => !c.omitFromPrefs && !c.hidden)
      const omitted = h.table.columns().filter((c) => c.omitFromPrefs)
      if (!hideable) ctx.skip('every column is pinned out of the prefs panel')

      h.table.onPrefsChange(
        h.table
          .columnPrefs()
          .map((p) => p.value)
          .filter((key) => key !== hideable.key)
      )

      const visible = h.table.visibleColumns().map((c) => c.key)
      expect(visible).not.toContain(hideable.key)
      for (const column of omitted) expect(visible).toContain(column.key)
    })

    it('labels preference entries with the tooltip when a column has one', async (ctx: TestContext) => {
      const h = await setup()
      const tooltipped = h.table
        .columns()
        .find((c) => c.tooltip && !c.omitFromPrefs)
      if (!tooltipped)
        ctx.skip('no column in the prefs panel declares a tooltip')

      const entry = h.table
        .columnPrefs()
        .find((p) => p.value === tooltipped.key)
      expect(entry?.label).toBe(tooltipped.tooltip)
    })

    /**
     * A `Browse*` row flattens its entities into scalar columns, so it
     * normalises under its own typename and the tags — which render from the
     * cache alone — find nothing. A column that declares `seed` says how to
     * project the entity back out; this asserts the table actually wrote it.
     */
    it('seeds the cache for every column that declares how', async () => {
      const h = await setup()
      await h.settle()

      for (const [typename, id] of config.seeded ?? []) {
        expect(
          readCachedEntity(h.apollo, typename, id),
          `${typename}:${id} was not written to the cache`
        ).toBeTruthy()
      }

      // a seeding column missing from `seeded` would leave the loop above
      // asserting nothing at all
      const seeding = h.table
        .columns()
        .filter((c) => c.cell.kind === 'entity-tag' && !!c.cell.seed)
      if (seeding.length > 0) {
        expect(
          config.seeded ?? [],
          `${seeding.map((c) => c.key).join(', ')} declare 'seed'; name what they write in 'seeded'`
        ).not.toHaveLength(0)
      }
    })

    /**
     * `labelSegments` is plain string matching — the `highlightTypeahead` pipe
     * it replaces built a RegExp from raw filter input, so an unbalanced
     * bracket threw, and returned it through `bypassSecurityTrustHtml`.
     */
    it('emphasises the active filter inside a highlighting text column', async (ctx: TestContext) => {
      const h = await setup()
      const column = h.table
        .columns()
        .find((c) => c.cell.kind === 'text' && c.cell.highlight)
      if (!column) ctx.skip('no text column asks for highlighting')

      const plain = h.table.textSegments(column, config.rows[0])
      expect(plain.every((s) => !s.highlight)).toBe(true)

      const text = plain.map((s) => s.text).join('')
      if (text.length >= 2) {
        h.table.onFilterChange(column, text.slice(0, 2))
        const split = h.table.textSegments(column, config.rows[0])
        expect(split.some((s) => s.highlight)).toBe(true)
        expect(split.map((s) => s.text).join('')).toBe(text)
      }

      h.table.onFilterChange(column, '(unclosed[')
      expect(() => h.table.textSegments(column, config.rows[0])).not.toThrow()
    })
  })
}

/** what a spec types into this column's filter */
function filterInput(
  column: CvcSpecColumn<any>,
  overrides: Record<string, string> | undefined,
  text: string
): unknown {
  const override = overrides?.[column.key]
  if (override !== undefined) return override
  const filter = column.filter!
  if (filter.kind === 'numeric') return 1
  if (filter.kind === 'enum') return filter.options[0]?.value ?? null
  return text
}

/** what that input looks like once it reaches the query */
function transformed(column: CvcSpecColumn<any>, typed: unknown): unknown {
  const filter = column.filter!
  if (filter.kind === 'enum' || !filter.transform) return typed
  return (filter.transform as (v: unknown) => unknown)(typed)
}

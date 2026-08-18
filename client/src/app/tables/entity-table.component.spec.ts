import { Component, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  MockGraphqlOperation,
  provideMockApollo,
} from '@app/testing/apollo-test.providers'
import {
  TABLE_ICONS,
  TableHostComponent,
  settleTable,
} from '@app/testing/entity-table.harness'
import { EvidenceManagerGQL } from '@app/forms/types/evidence-select/evidence-manager/evidence-manager.query.gql.generated'
import { writeCachedEntity } from '@app/tags'
import { Apollo } from 'apollo-angular'
import { CvcEntityTableComponent } from './entity-table.component'
import { entityTableConfig, EntityTableSpec } from './entity-table-config'
import { SORT_DESCEND_FIRST } from './entity-table.types'

/**
 * Covers the parts of the table that hold its defects: what ends up in the query
 * variables, and what a reset actually clears.
 *
 * Rows are deliberately not asserted on. The body is a cdk-virtual-scroll
 * viewport, which measures itself against real layout and renders nothing in
 * jsdom — the same reason `table-scroll.directive.spec.ts` tests its pure
 * `nextFetch` rather than the directive. Row rendering is covered by the
 * Playwright goldens, which run against a real browser.
 */

interface Row {
  id: number
  name: string
}

const row = (id: number, name: string): Row => ({ id, name })

function buildSpec(
  options: {
    defaultSortOnName?: boolean
    pinned?: boolean
    /** gives the name filter an entityTypename, for the settings id→name path */
    nameFilterByEntity?: boolean
    /** gives the rating sort a descend-first click cycle */
    descendFirstRating?: boolean
    /** opts the name text cell into the full-text hover tooltip */
    nameTooltip?: boolean
    /** overrides the host-scope variables (default `{ assertionId: 7 }`) */
    scope?: Record<string, unknown>
  } = {}
): EntityTableSpec<Row> {
  const gql = TestBed.inject(EvidenceManagerGQL)
  return entityTableConfig({
    query: gql,
    pageSize: 25,
    scope: options.scope ?? { assertionId: 7 },
    connection: () => ({
      edges: [
        { cursor: 'a', node: row(1, 'one') },
        { cursor: 'b', node: row(2, 'two') },
      ],
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: 'a',
        endCursor: 'b',
      },
      totalCount: 42,
    }),
    columns: [
      {
        key: 'selected',
        label: '',
        width: '40px',
        fixed: options.pinned ? ('left' as const) : undefined,
        omitFromPrefs: true,
        cell: { kind: 'select' },
      },
      {
        key: 'name',
        label: 'Name',
        width: '200px',
        fixed: options.pinned ? ('left' as const) : undefined,
        cell: {
          kind: 'text',
          text: (r) => r.name,
          highlight: true,
          ...(options.nameTooltip ? { tooltip: true } : {}),
        },
        sort: {
          column: 'name',
          default: options.defaultSortOnName ? 'ascend' : undefined,
        },
        filter: {
          kind: 'text',
          var: 'description',
          ...(options.nameFilterByEntity
            ? { entityTypename: 'Disease' as const }
            : {}),
        },
      },
      {
        key: 'rating',
        label: 'Rating',
        tooltip: 'Evidence Rating',
        width: '60px',
        fixed: options.pinned ? ('right' as const) : undefined,
        cell: { kind: 'text', text: (r) => r.name },
        sort: {
          column: 'evidenceRating',
          ...(options.descendFirstRating
            ? { directions: SORT_DESCEND_FIRST }
            : {}),
        },
        filter: {
          kind: 'text',
          var: 'id',
          // the EID shape: 'EID123' and '123' both mean 123
          transform: (value) => {
            const match = value
              ?.toString()
              .trim()
              .match(/^(?:EID)?(\d+)$/i)
            return match ? +match[1] : null
          },
        },
      },
    ],
  }) as unknown as EntityTableSpec<Row>
}

describe('cvc-entity-table', () => {
  let fixture: ComponentFixture<TableHostComponent<Row>>
  let table: CvcEntityTableComponent<Row>
  let recorded: MockGraphqlOperation[]

  // shared with the contract harness; the default clears QUERY_DEBOUNCE_MS
  const settle = (ms?: number) => settleTable(fixture, ms)

  beforeEach(async () => {
    recorded = []
    await TestBed.configureTestingModule({
      // TABLE_ICONS carries every icon the table can render — see its doc for
      // why a missing icon fails silently-but-loudly
      imports: [TableHostComponent, NzIconModule.forRoot(TABLE_ICONS)],
      providers: [provideMockApollo(() => ({}), recorded)],
    }).compileComponents()

    fixture = TestBed.createComponent<TableHostComponent<Row>>(
      TableHostComponent as never
    )
    fixture.componentInstance.spec.set(buildSpec())
    fixture.detectChanges()
    table = fixture.debugElement.children[0]
      .componentInstance as CvcEntityTableComponent<Row>
  })

  it('sends the configured page size and scope', () => {
    expect(table.queryVars()['first']).toBe(25)
    expect(table.queryVars()['assertionId']).toBe(7)
  })

  /**
   * Asserts what reaches the link, not what `queryVars` computes — the two came
   * apart once and nothing noticed.
   *
   * `Query.watch` takes an options object; passing variables positionally
   * type-checks against a hand-written structural interface, sends no variables
   * at all, and leaves every `queryVars` assertion above still passing. The
   * table then silently used the server's default page size. Recording the
   * operation is the only assertion that can tell the difference.
   */
  it('puts those variables on the wire, not just in queryVars', async () => {
    await settle()

    const initial = recorded.filter(
      (op) => op.operationName === 'EvidenceManager'
    )
    expect(initial.length).toBeGreaterThan(0)
    expect(initial[0].variables).toMatchObject({ first: 25, assertionId: 7 })
  })

  /**
   * The facade pattern replaces every legacy `ngOnChanges`/`refresh()` with a
   * `computed()` spec, and the audit of the 12-table migration found exactly
   * why that matters: three legacy tables' refetch payloads dropped a scope
   * input (users' `ids`, sources' `clinicalTrialId`, molecular-profiles'
   * `variantId`), so a live instance whose scope input changed later never
   * reflected it — silently, forever. The fix is by construction, but until
   * this test nothing asserted the mechanism at the wire: a spec identity
   * change must re-query with the new scope.
   */
  it('re-queries with the new scope when the spec changes', async () => {
    await settle()

    fixture.componentInstance.spec.set(buildSpec({ scope: { assertionId: 9 } }))
    await settle()

    const ops = recorded.filter((op) => op.operationName === 'EvidenceManager')
    expect(ops.length).toBeGreaterThan(1)
    expect(ops.at(-1)!.variables).toMatchObject({ assertionId: 9 })
  })

  /**
   * `queryVars` is a computed that builds a fresh object each time, so any
   * signal it reads re-emits it even when the variables are identical. A host
   * pushing `settings` does exactly that on mount — writing nulls into the
   * filter map changes the map without changing the query — and the evidence
   * manager answered by issuing its opening query twice.
   */
  it('does not re-query when the variables come out identical', async () => {
    await settle()
    const opening = recorded.length

    // same value the filter already holds: the map is rewritten, the query is not
    table.onFilterChange(table.columns()[1], null)
    await settle()

    expect(recorded.length).toBe(opening)
  })

  it('routes a filter to the variable its column names, not to its key', () => {
    table.onFilterChange(table.columns()[1], 'kinase')

    expect(table.queryVars()['description']).toBe('kinase')
    expect(table.queryVars()['name']).toBeUndefined()
  })

  it('omits a cleared filter rather than sending null', () => {
    const column = table.columns()[1]
    table.onFilterChange(column, 'kinase')
    table.onFilterChange(column, null)

    // an explicit null reaches the resolver and selects rows whose column is
    // null; "no filter" has to be an absent key
    expect('description' in table.queryVars()).toBe(true)
    expect(table.queryVars()['description']).toBeUndefined()
  })

  it('applies a filter transform before the value reaches the query', () => {
    table.onFilterChange(table.columns()[2], 'EID123')

    expect(table.queryVars()['id']).toBe(123)
  })

  it('translates a sort into the generated sort column', () => {
    table.onSortChange(table.columns()[1], 'ascend')

    expect(table.queryVars()['sortBy']).toEqual({
      column: 'name',
      direction: 'ASC',
    })
  })

  it('drops the sort entirely when it is cleared', () => {
    table.onSortChange(table.columns()[1], 'ascend')
    table.onSortChange(table.columns()[1], null)

    expect(table.queryVars()['sortBy']).toBeUndefined()
  })

  // the managers seeded each sort stream with the column's default, so it was
  // part of the very first query; reading only the user's sort would show an
  // ascending sorter on a column the server never sorted by
  it('sends a column default sort before the user touches anything', () => {
    fixture.componentInstance.spec.set(buildSpec({ defaultSortOnName: true }))
    fixture.detectChanges()

    expect(table.queryVars()['sortBy']).toEqual({
      column: 'name',
      direction: 'ASC',
    })
    expect(table.sortOrderFor(table.columns()[1])).toBe('ascend')
  })

  it('lets a cleared sort stay cleared rather than reverting to the default', () => {
    fixture.componentInstance.spec.set(buildSpec({ defaultSortOnName: true }))
    fixture.detectChanges()

    table.onSortChange(table.columns()[1], null)

    expect(table.queryVars()['sortBy']).toBeUndefined()
    expect(table.sortOrderFor(table.columns()[1])).toBeNull()
  })

  it('restores the default sort on reset', () => {
    fixture.componentInstance.spec.set(buildSpec({ defaultSortOnName: true }))
    fixture.detectChanges()
    table.onSortChange(table.columns()[1], 'descend')

    table.onResetFilters()

    expect(table.queryVars()['sortBy']).toEqual({
      column: 'name',
      direction: 'ASC',
    })
  })

  it('shows no sort on other columns once one is sorted', () => {
    fixture.componentInstance.spec.set(buildSpec({ defaultSortOnName: true }))
    fixture.detectChanges()

    table.onSortChange(table.columns()[2], 'descend')

    expect(table.sortOrderFor(table.columns()[1])).toBeNull()
    expect(table.sortOrderFor(table.columns()[2])).toBe('descend')
  })

  // The click-cycle order is a per-column contract — legacy count columns
  // declared descend-first via `[nzSortDirections]`, which silently flipped
  // to ng-zorro's ascend-first as the tables migrated. Asserted through a
  // real header click because the cycle logic lives in ng-zorro's th;
  // calling `onSortChange` directly cannot regress it.
  const ratingHeader = (): HTMLElement =>
    fixture.nativeElement.querySelector(
      '[data-testid="column-header"][data-column="rating"]'
    ) as HTMLElement

  it('cycles ascend-first on a header click by default', () => {
    ratingHeader().click()
    fixture.detectChanges()

    expect(table.sortOrderFor(table.columns()[2])).toBe('ascend')
  })

  it('cycles descend-first when the column declares it', () => {
    fixture.componentInstance.spec.set(buildSpec({ descendFirstRating: true }))
    fixture.detectChanges()

    ratingHeader().click()
    fixture.detectChanges()

    expect(table.sortOrderFor(table.columns()[2])).toBe('descend')
    expect(table.queryVars()['sortBy']).toEqual({
      column: 'evidenceRating',
      direction: 'DESC',
    })
  })

  // jsdom cannot render the virtual-scroll body, so the tooltip contract is
  // asserted on the method the template binds — the same reason rows are
  // never asserted in this file.
  it('discloses a text tooltip only where the cell opts in, never mid-scroll', () => {
    fixture.componentInstance.spec.set(buildSpec({ nameTooltip: true }))
    fixture.detectChanges()
    const [, name, rating] = table.columns()

    expect(table.textTooltip(name, row(1, 'one'))).toBe('one')
    expect(table.textTooltip(rating, row(1, 'one'))).toBeNull()

    table.onScrollPhase('scroll')
    expect(table.textTooltip(name, row(1, 'one'))).toBeNull()
  })

  // the reset button read as inert in both managers: it cleared the query but
  // not the filter inputs, because a filter's value lived in a mutated config
  // object that nothing re-emitted
  it('reset clears the query and the filter inputs together', () => {
    const column = table.columns()[1]
    table.onFilterChange(column, 'kinase')
    table.onSortChange(column, 'descend')

    table.onResetFilters()

    expect(table.filterValue('name')).toBeNull()
    expect(table.queryVars()['description']).toBeUndefined()
    expect(table.queryVars()['sortBy']).toBeUndefined()
  })

  it('emits the complete selection when a row is toggled', () => {
    table.onRowSelectedChange(row(1, 'one'), true)
    table.onRowSelectedChange(row(2, 'two'), true)
    table.onRowSelectedChange(row(1, 'one'), false)

    expect(table.selectedIds()).toEqual([2])
    expect(table.isSelected(row(2, 'two'))).toBe(true)
    expect(table.isSelected(row(1, 'one'))).toBe(false)
  })

  it('hides a column when the preferences panel unchecks it', () => {
    expect(table.visibleColumns().map((c) => c.key)).toContain('name')

    table.onPrefsChange(['rating'])

    expect(table.visibleColumns().map((c) => c.key)).not.toContain('name')
    // omitFromPrefs columns are never hidden by the panel
    expect(table.visibleColumns().map((c) => c.key)).toContain('selected')
  })

  it('labels preference entries with the tooltip when there is one', () => {
    expect(table.columnPrefs()).toEqual([
      { label: 'Name', value: 'name' },
      { label: 'Evidence Rating', value: 'rating' },
    ])
  })

  it('reads counts out of the connection, preferring the filtered count', () => {
    expect(table.displayedTotal()).toBe(42)
    expect(table.rows()).toHaveLength(2)
  })

  /**
   * The scroll directive re-reports the same cursor on every near-bottom
   * event; the component is the single owner of the in-flight guard because
   * only the QueryRef's owner can reset it when a refetch invalidates the
   * cursor.
   */
  describe('fetchMore requests', () => {
    it('ignores a repeat request for a cursor already in flight', async () => {
      await settle()
      const before = recorded.length

      table.onFetchRequest({ first: 25, after: 'b' })
      table.onFetchRequest({ first: 25, after: 'b' })
      await settle(0)

      expect(recorded.length).toBe(before + 1)
    })

    // relay cursors are positional, so after a filter change the new first
    // page can end on the same cursor string; a guard that never resets
    // would block paging permanently
    it('accepts the same cursor again once the variables have changed', async () => {
      await settle()
      table.onFetchRequest({ first: 25, after: 'b' })

      table.onFilterChange(table.columns()[1], 'kinase')
      await settle()
      const before = recorded.length

      table.onFetchRequest({ first: 25, after: 'b' })
      await settle(0)

      expect(recorded.length).toBe(before + 1)
    })

    /**
     * A near-bottom fetch can land inside the query debounce window, when the
     * component's live variables are already ahead of the result set on
     * screen. The page must extend the CURRENT result set: the store fetches
     * with the variables it last ran, never the live ones — a page fetched
     * with unflushed variables would land in a cache entry whose first page
     * was never fetched.
     */
    it('pages with the current result set variables, not unflushed ones', async () => {
      await settle()

      table.onFilterChange(table.columns()[1], 'kinase')
      // deliberately no settle: the filter change is inside the debounce
      table.onFetchRequest({ first: 25, after: 'b' })
      await settle(0)

      const paged = recorded.at(-1)!.variables
      expect(paged['after']).toBe('b')
      expect(paged['description']).toBeUndefined()
    })
  })

  // Pinned-column offsets are ng-zorro's own boolean nzLeft/nzRight
  // measurement and need real layout, which jsdom does not provide — they are
  // asserted by the Playwright golden ('pinned columns hold their offsets…').
  // The one component-level invariant — that the template must not wrap the
  // virtual-scroll body in a <tbody> — is documented in the template itself.

  /**
   * The trickiest branch of applySettings: a text filter declaring
   * `entityTypename` is driven from outside by entity ID but filters by
   * NAME, so the id is resolved synchronously out of the Apollo cache. An
   * entity that was never cached is skipped, not guessed at — a wrong guess
   * would silently filter by the wrong string.
   */
  describe('settings id→name resolution', () => {
    beforeEach(() => {
      fixture.componentInstance.spec.set(
        buildSpec({ nameFilterByEntity: true })
      )
      fixture.detectChanges()
    })

    it('resolves a pushed entity id to its cached display name', async () => {
      writeCachedEntity(TestBed.inject(Apollo), 'Disease', {
        __typename: 'Disease',
        id: 7,
        name: 'Melanoma',
        link: '/diseases/7',
        deprecated: false,
      })

      fixture.componentInstance.settings.set({
        filters: [{ key: 'name', value: 7 }],
      })
      await settle()

      expect(table.filterValue('name')).toBe('Melanoma')
    })

    it('skips an entity the cache has never seen', async () => {
      fixture.componentInstance.settings.set({
        filters: [{ key: 'name', value: 999 }],
      })
      await settle()

      expect(table.filterValue('name')).toBeNull()
    })

    it('passes a plain value through for a column without entityTypename', async () => {
      fixture.componentInstance.settings.set({
        filters: [{ key: 'rating', value: 'EID12' }],
      })
      await settle()

      expect(table.filterValue('rating')).toBe('EID12')
    })
  })

  /**
   * A request, not a position: consecutive refetches all target row 0, and
   * each must be newly observable — a bare number held in a signal would be
   * swallowed by equality on the second `set(0)`, leaving the viewport
   * wherever the user had scrolled while the rows are replaced under them.
   */
  describe('refetch scroll requests', () => {
    it('issues a fresh scroll request for every landed refetch', async () => {
      await settle()

      table.onFilterChange(table.columns()[1], 'kinase')
      await settle()
      // the request lands when the refetch promise resolves, which is not
      // bound to the debounce window — poll rather than guess the timing
      await vi.waitFor(() =>
        expect(table.scrollRequest()).toEqual({ index: 0 })
      )
      const first = table.scrollRequest()

      table.onFilterChange(table.columns()[1], 'kinases')
      await settle()
      await vi.waitFor(() => {
        const second = table.scrollRequest()
        expect(second).toEqual({ index: 0 })
        expect(second).not.toBe(first)
      })
    })
  })

  describe('text cell highlighting', () => {
    const nameColumn = () => table.columns()[1]

    it('is one plain segment while no filter is set', () => {
      expect(table.textSegments(nameColumn(), row(1, 'Melanoma'))).toEqual([
        { text: 'Melanoma', highlight: false },
      ])
    })

    it('splits the value around the active filter, case-insensitively', () => {
      table.onFilterChange(nameColumn(), 'lano')

      expect(table.textSegments(nameColumn(), row(1, 'Melanoma'))).toEqual([
        { text: 'Me', highlight: false },
        { text: 'lano', highlight: true },
        { text: 'ma', highlight: false },
      ])
    })

    // the highlightTypeahead pipe this replaces did `new RegExp(searchTerm)`,
    // so an unbalanced bracket from a filter box threw
    it('survives filter text that would not compile as a regex', () => {
      table.onFilterChange(nameColumn(), '(unclosed[')

      expect(() =>
        table.textSegments(nameColumn(), row(1, 'Melanoma'))
      ).not.toThrow()
    })

    it('joins a list into one string so a match can span the separator', () => {
      const listColumn = {
        ...nameColumn(),
        cell: {
          kind: 'text' as const,
          text: () => ['V600E', 'V600K'],
        },
      }

      expect(table.textSegments(listColumn, row(1, 'x'))).toEqual([
        { text: 'V600E, V600K', highlight: false },
      ])
    })

    // empty segments are the cue to render cvc-empty-value instead
    it('yields nothing for an absent value but keeps a zero', () => {
      const empty = {
        ...nameColumn(),
        cell: { kind: 'text' as const, text: () => undefined },
      }
      const zero = {
        ...nameColumn(),
        cell: { kind: 'text' as const, text: () => 0 },
      }

      expect(table.textSegments(empty, row(1, 'x'))).toEqual([])
      expect(table.textSegments(zero, row(1, 'x'))).toEqual([
        { text: '0', highlight: false },
      ])
    })
  })

  /**
   * The card chrome the browse-table facades depend on: a host title template
   * that outranks `spec().title`, and the `[cvcTableToolbarExtra]` slot that
   * projects host content (downloaders, scope menus) into the card-extra row.
   */
  describe('card chrome', () => {
    const mountChrome = (withTitleTemplate: boolean) => {
      const chrome = TestBed.createComponent(ChromeHostComponent)
      chrome.componentInstance.spec.set({
        ...buildSpec(),
        title: 'Chrome Table',
      })
      chrome.componentInstance.withTitle.set(withTitleTemplate)
      chrome.detectChanges()
      return chrome.nativeElement as HTMLElement
    }

    it("renders the host's title template in place of the spec title", () => {
      const el = mountChrome(true)
      const custom = el.querySelector('[data-testid="host-title"]')
      expect(custom).toBeTruthy()
      expect(el.querySelector('.ant-card-head')!.textContent).not.toContain(
        'Chrome Table'
      )
    })

    it('falls back to the spec title without a template', () => {
      const el = mountChrome(false)
      expect(el.querySelector('[data-testid="host-title"]')).toBeNull()
      expect(el.querySelector('.ant-card-head')!.textContent).toContain(
        'Chrome Table'
      )
    })

    it('projects toolbar-extra content into the card-extra row', () => {
      const el = mountChrome(true)
      const extra = el.querySelector('[data-testid="host-toolbar-extra"]')
      expect(extra).toBeTruthy()
      expect(extra!.closest('.ant-card-extra')).toBeTruthy()
    })
  })
})

@Component({
  imports: [CvcEntityTableComponent],
  template: `
    <ng-template #title>
      <em data-testid="host-title">Custom Title</em>
    </ng-template>
    <cvc-entity-table
      [spec]="spec()"
      [titleTemplate]="withTitle() ? title : undefined">
      <button
        cvcTableToolbarExtra
        data-testid="host-toolbar-extra"
        type="button">
        Extra
      </button>
    </cvc-entity-table>
  `,
})
class ChromeHostComponent {
  readonly spec = signal<EntityTableSpec<Row>>(undefined as never)
  readonly withTitle = signal(true)
}

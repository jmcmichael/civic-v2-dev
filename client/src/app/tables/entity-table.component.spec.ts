import { Component, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import {
  CloseCircleFill,
  FilterFill,
  QuestionCircleOutline,
  RetweetOutline,
  SearchOutline,
  SettingOutline,
  SyncOutline,
} from '@ant-design/icons-angular/icons'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  MockGraphqlOperation,
  provideMockApollo,
} from '@app/testing/apollo-test.providers'
import { EvidenceManagerGQL } from '@app/forms/types/evidence-select/evidence-manager/evidence-manager.query.gql.generated'
import { CvcEntityTableComponent } from './entity-table.component'
import { entityTableConfig, EntityTableSpec } from './entity-table-config'

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
  options: { defaultSortOnName?: boolean; pinned?: boolean } = {}
): EntityTableSpec<Row> {
  const gql = TestBed.inject(EvidenceManagerGQL)
  return entityTableConfig({
    query: gql,
    pageSize: 25,
    scope: { assertionId: 7 },
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
        cell: { kind: 'text', text: (r) => r.name, highlight: true },
        sort: {
          column: 'name',
          default: options.defaultSortOnName ? 'ascend' : undefined,
        },
        filter: { kind: 'text', var: 'description' },
      },
      {
        key: 'rating',
        label: 'Rating',
        tooltip: 'Evidence Rating',
        width: '60px',
        fixed: options.pinned ? ('right' as const) : undefined,
        cell: { kind: 'text', text: (r) => r.name },
        sort: { column: 'evidenceRating' },
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

@Component({
  imports: [CvcEntityTableComponent],
  template: `<cvc-entity-table
    [spec]="spec()"
    [(selectedIds)]="selected" />`,
})
class HostComponent {
  readonly spec = signal<EntityTableSpec<Row>>(undefined as never)
  selected: number[] = []
}

describe('cvc-entity-table', () => {
  let fixture: ComponentFixture<HostComponent>
  let table: CvcEntityTableComponent<Row>
  let recorded: MockGraphqlOperation[]

  /**
   * Flushes the query debounce and re-renders. `fixture.whenStable()` never
   * resolves in this TestBed — a zone macrotask stays pending — so waits are
   * manual, as in `testing/enum-field.harness.ts`. The default clears
   * QUERY_DEBOUNCE_MS.
   */
  const settle = async (ms = 400) => {
    fixture.detectChanges()
    await new Promise((r) => setTimeout(r, ms))
    fixture.detectChanges()
  }

  beforeEach(async () => {
    recorded = []
    await TestBed.configureTestingModule({
      // Every ant icon the toolbar and filter row can render. Ant's icon
      // service throws on an unregistered name, and it throws *outside* the
      // test's own call stack — so a missing icon leaves every assertion
      // passing while the runner still exits non-zero. Registering them is
      // what keeps a green report honest.
      imports: [
        HostComponent,
        NzIconModule.forRoot([
          CloseCircleFill,
          FilterFill,
          QuestionCircleOutline,
          RetweetOutline,
          SearchOutline,
          SettingOutline,
          SyncOutline,
        ]),
      ],
      providers: [provideMockApollo(() => ({}), recorded)],
    }).compileComponents()

    fixture = TestBed.createComponent(HostComponent)
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
  })

  /**
   * ng-zorro can derive these itself from `nzLeft="true"`, but its per-row
   * coordination never reached these cells: every pinned column resolved to
   * `left: 0` and stacked on the next, so the select column covered the first
   * data column. The offsets are arithmetic over widths the config already
   * declares, so the table computes them rather than depending on a
   * measurement pass it does not control.
   */
  describe('pinned column offsets', () => {
    beforeEach(() => {
      fixture.componentInstance.spec.set(buildSpec({ pinned: true }))
      fixture.detectChanges()
    })

    it('stacks left-pinned columns by the widths before them', () => {
      expect(table.stickyLeft(table.columns()[0])).toBe('0px')
      expect(table.stickyLeft(table.columns()[1])).toBe('40px')
    })

    it('accumulates right-pinned columns inward from the edge', () => {
      expect(table.stickyRight(table.columns()[2])).toBe('0px')
    })

    it('reports false for a column that is not pinned', () => {
      fixture.componentInstance.spec.set(buildSpec())
      fixture.detectChanges()

      expect(table.stickyLeft(table.columns()[1])).toBe(false)
      expect(table.stickyRight(table.columns()[2])).toBe(false)
    })

    // the shadow marking the boundary between pinned and scrolling columns
    it('marks the innermost pinned column on each side', () => {
      expect(table.isLastLeft(table.columns()[0])).toBe(false)
      expect(table.isLastLeft(table.columns()[1])).toBe(true)
      expect(table.isFirstRight(table.columns()[2])).toBe(true)
    })

    // hiding a pinned column has to shift everything after it
    it('recomputes when a preceding column is hidden', () => {
      table.onPrefsChange(['rating'])

      expect(table.stickyLeft(table.columns()[0])).toBe('0px')
      expect(table.isLastLeft(table.columns()[0])).toBe(true)
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
})

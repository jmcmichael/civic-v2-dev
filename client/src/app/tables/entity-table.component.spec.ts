import { Component, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
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

function buildSpec(): EntityTableSpec<Row> {
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
        omitFromPrefs: true,
        cell: { kind: 'select' },
      },
      {
        key: 'name',
        label: 'Name',
        width: '200px',
        cell: { kind: 'text', text: (r) => r.name },
        sort: { column: 'name' },
        filter: { kind: 'text', var: 'description' },
      },
      {
        key: 'rating',
        label: 'Rating',
        tooltip: 'Evidence Rating',
        width: '60px',
        cell: { kind: 'text', text: (r) => r.name },
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

  beforeEach(async () => {
    recorded = []
    await TestBed.configureTestingModule({
      imports: [HostComponent],
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
})

import {
  CaretRightOutline,
  WarningOutline,
} from '@ant-design/icons-angular/icons'
import { Component, Type, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { provideNzIcons } from 'ng-zorro-antd/icon'
import { Maybe } from '@app/generated/civic.apollo.types'
import { CvcConnection, CvcEdge } from '@app/tables/connection.types'
import { Query } from 'apollo-angular'
import { Subject } from 'rxjs'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { CvcEntityStreamComponent } from './entity-stream.component'
import {
  EntityStreamConfig,
  EntityStreamSpec,
  entityStreamConfig,
} from './entity-stream-config'
import { CvcStreamItemContext } from './entity-stream.types'

/**
 * The component against a hand-rolled QueryRef, in `'button'` mode — the
 * presentation that exercises the full pipeline (variables, debounce,
 * items, selection, expansion, paging, empty and error states) without a
 * layout engine. `'infinite'` rendering needs real layout and is covered by
 * the browser-level golden spec.
 */

interface TestItem {
  id: number
  name: string
}

interface FakeResult {
  data: unknown
  loading: boolean
}

class FakeQueryRef {
  readonly valueChanges = new Subject<FakeResult>()
  readonly refetch = vi.fn(
    (): Promise<FakeResult> =>
      Promise.resolve({ data: undefined, loading: false })
  )
  readonly fetchMore = vi.fn(
    (): Promise<FakeResult> =>
      Promise.resolve({ data: undefined, loading: false })
  )

  emit(connection: CvcConnection<TestItem>): void {
    this.valueChanges.next({ data: connection, loading: false })
  }
}

function edge(item: TestItem): CvcEdge<TestItem> {
  return { cursor: `c${item.id}`, node: item }
}

function connection(
  items: TestItem[],
  hasNextPage = false
): CvcConnection<TestItem> {
  return {
    edges: items.map(edge),
    pageInfo: {
      hasNextPage,
      hasPreviousPage: false,
      endCursor: items.length ? `c${items.at(-1)!.id}` : undefined,
    },
    totalCount: 100,
  }
}

@Component({
  template: `<cvc-entity-stream
    [spec]="spec"
    [filters]="filters()"
    [(selectedIds)]="selected" />`,
  imports: [CvcEntityStreamComponent],
})
class HostComponent {
  spec!: EntityStreamSpec<TestItem>
  readonly filters = signal<Record<string, unknown>>({})
  selected: number[] = []
}

describe('CvcEntityStreamComponent (button mode)', () => {
  let ref: FakeQueryRef
  let watch: Mock<(options?: object) => FakeQueryRef>
  let fixture: ComponentFixture<HostComponent>
  let host: HostComponent

  function makeSpec(
    over: Partial<EntityStreamConfig<Query<unknown, object>, TestItem>> = {}
  ): EntityStreamSpec<TestItem> {
    return entityStreamConfig({
      query: { watch } as unknown as Query<unknown, object>,
      pagination: 'button',
      pageSize: 3,
      scope: { mode: 'TEST' },
      connection: (data) => data as Maybe<CvcConnection<TestItem>>,
      counts: (connection) => ({
        total: connection.totalCount,
        rows: connection.edges.length,
      }),
      item: {
        id: (item: TestItem) => item.id,
        kind: () => 'row',
        summary: (ctx: CvcStreamItemContext<TestItem>) => ctx.item.name,
      },
      ...over,
    })
  }

  async function mount(spec: EntityStreamSpec<TestItem>): Promise<void> {
    fixture = TestBed.createComponent(HostComponent)
    host = fixture.componentInstance
    host.spec = spec
    fixture.autoDetectChanges()
    // the query waits out the filter debounce before its first run
    await vi.waitFor(() => expect(watch).toHaveBeenCalled())
  }

  function text(selector: string): string {
    return (
      (fixture.nativeElement as HTMLElement).querySelector(selector)
        ?.textContent ?? ''
    )
  }

  beforeEach(() => {
    ref = new FakeQueryRef()
    watch = vi.fn(() => ref)
    TestBed.configureTestingModule({
      providers: [
        provideNoopAnimations(),
        provideNzIcons([CaretRightOutline, WarningOutline]),
      ],
    })
  })

  it('runs once with pageSize and scope after the debounce', async () => {
    await mount(makeSpec())

    expect(watch).toHaveBeenCalledTimes(1)
    expect(watch).toHaveBeenCalledWith({
      variables: { first: 3, mode: 'TEST' },
      notifyOnNetworkStatusChange: false,
    })
  })

  it('coalesces rapid filter changes into one refetch, scope winning collisions', async () => {
    await mount(makeSpec())

    host.filters.set({ userId: [1], mode: 'HIJACKED' })
    host.filters.set({ userId: [2], mode: 'HIJACKED' })
    await vi.waitFor(() => expect(ref.refetch).toHaveBeenCalledTimes(1))

    expect(ref.refetch).toHaveBeenCalledWith({
      first: 3,
      userId: [2],
      mode: 'TEST',
    })
  })

  it('does not re-query for value-identical variables', async () => {
    await mount(makeSpec())

    host.filters.set({ userId: [1] })
    await vi.waitFor(() => expect(ref.refetch).toHaveBeenCalledTimes(1))
    host.filters.set({ userId: [1] })
    await new Promise((resolve) => setTimeout(resolve, 400))

    expect(ref.refetch).toHaveBeenCalledTimes(1)
  })

  it('renders an item per edge, with identity and kind test hooks', async () => {
    await mount(makeSpec())
    ref.emit(
      connection([
        { id: 1, name: 'first' },
        { id: 2, name: 'second' },
      ])
    )

    await vi.waitFor(() => {
      const items = (fixture.nativeElement as HTMLElement).querySelectorAll(
        '[data-testid="stream-item"]'
      )
      expect(items).toHaveLength(2)
    })
    // queried inside the wait: view re-creation detaches captured nodes
    await vi.waitFor(() => {
      const item = (fixture.nativeElement as HTMLElement).querySelector(
        '[data-item-id="1"]'
      )
      expect(item?.getAttribute('data-item-kind')).toBe('row')
      expect(item?.textContent).toContain('first')
      expect(text('[data-testid="stream-counts"]')).toContain('2 of 100 loaded')
    })
  })

  it('pages through the Load More button with the tail cursor', async () => {
    await mount(makeSpec())
    ref.emit(connection([{ id: 1, name: 'first' }], true))

    await vi.waitFor(() =>
      expect(
        (fixture.nativeElement as HTMLElement).querySelector(
          '[data-testid="stream-load-more"]'
        )
      ).toBeTruthy()
    )
    ;(
      (fixture.nativeElement as HTMLElement).querySelector(
        '[data-testid="stream-load-more"]'
      ) as HTMLButtonElement
    ).click()

    expect(ref.fetchMore).toHaveBeenCalledWith({
      variables: { first: 3, mode: 'TEST', after: 'c1' },
    })
  })

  it('two-ways selection between the model and item checkboxes', async () => {
    await mount(
      makeSpec({
        item: {
          id: (item: TestItem) => item.id,
          kind: () => 'row',
          summary: (ctx: CvcStreamItemContext<TestItem>) => ctx.item.name,
          selectable: (item: TestItem) => item.id !== 2,
        },
      })
    )
    ref.emit(
      connection([
        { id: 1, name: 'first' },
        { id: 2, name: 'second' },
      ])
    )

    await vi.waitFor(() =>
      expect(
        (fixture.nativeElement as HTMLElement).querySelectorAll(
          'label.select input'
        )
      ).toHaveLength(2)
    )
    const boxes = (
      fixture.nativeElement as HTMLElement
    ).querySelectorAll<HTMLInputElement>('label.select input')

    // gating: item 2's predicate refuses selection
    expect(boxes[1].disabled).toBe(true)

    boxes[0].click()
    await vi.waitFor(() => expect(host.selected).toEqual([1]))
  })

  it('removes the checkbox where selectionVisible refuses, keeping a spacer', async () => {
    await mount(
      makeSpec({
        item: {
          id: (item: TestItem) => item.id,
          kind: () => 'row',
          summary: (ctx: CvcStreamItemContext<TestItem>) => ctx.item.name,
          selectable: () => true,
          selectionVisible: (item: TestItem) => item.id !== 2,
        },
      })
    )
    ref.emit(
      connection([
        { id: 1, name: 'first' },
        { id: 2, name: 'second' },
      ])
    )

    await vi.waitFor(() =>
      expect(
        (fixture.nativeElement as HTMLElement).querySelectorAll(
          'label.select input'
        )
      ).toHaveLength(1)
    )
    // item 2 keeps the rail's width without offering selection
    expect(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.select-spacer')
    ).toHaveLength(1)
  })

  it('lazily loads and renders an expandable kind detail component', async () => {
    @Component({ template: `<span class="dummy-detail">detail body</span>` })
    class DummyDetail {}

    await mount(
      makeSpec({
        item: {
          id: (item: TestItem) => item.id,
          kind: () => 'row',
          summary: (ctx: CvcStreamItemContext<TestItem>) => ctx.item.name,
          kinds: {
            row: {
              expandable: true,
              detail: {
                load: () => Promise.resolve(DummyDetail as Type<unknown>),
              },
            },
          },
        },
      })
    )
    ref.emit(connection([{ id: 1, name: 'first' }]))

    await vi.waitFor(() =>
      expect(
        (fixture.nativeElement as HTMLElement).querySelector(
          '[data-testid="stream-item-toggle"]'
        )
      ).toBeTruthy()
    )
    ;(
      (fixture.nativeElement as HTMLElement).querySelector(
        '[data-testid="stream-item-toggle"]'
      ) as HTMLElement
    ).click()

    await vi.waitFor(() =>
      expect(text('.dummy-detail')).toContain('detail body')
    )
  })

  it('shows the empty state only once an empty result set arrives', async () => {
    await mount(makeSpec())
    expect(
      (fixture.nativeElement as HTMLElement).querySelector(
        '[data-testid="stream-empty"]'
      )
    ).toBeNull()

    ref.emit(connection([]))
    await vi.waitFor(() =>
      expect(text('[data-testid="stream-empty"]')).toContain('No items found')
    )
  })

  it('labels a transport failure as a network error', async () => {
    await mount(makeSpec())
    ref.valueChanges.error(new Error('socket closed'))

    await vi.waitFor(() =>
      expect(text('[data-testid="stream-error"]')).toContain('Network Error')
    )
  })
})

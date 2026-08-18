import { Component, Provider, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import {
  CaretRightOutline,
  WarningOutline,
} from '@ant-design/icons-angular/icons'
import { civicIcons } from '@app/icons-provider.module'
import { CvcPageInfo } from '@app/tables/connection.types'
import { EntityStreamSpec } from '@app/streams/entity-stream-config'
import { CvcEntityStreamComponent } from '@app/streams/entity-stream.component'
import { Apollo } from 'apollo-angular'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { describe, expect, it } from 'vitest'
import {
  MockGraphqlOperation,
  provideMockApollo,
} from './apollo-test.providers'

/**
 * Every icon a stream's chrome and item summaries can render: the shell's
 * expand caret, the error tag's warning, and the civic-* icons entity tags
 * resolve.
 *
 * Ant's icon service throws on an unregistered name, and it throws *outside*
 * the test's own call stack — so a missing icon leaves every assertion
 * passing while the runner reports a flood of unhandled errors. Registered
 * here so no caller has to rediscover that.
 */
export const STREAM_ICONS = [CaretRightOutline, WarningOutline, ...civicIcons]

/**
 * The one host every stream spec mounts: binds a spec signal, the filters
 * patch, the height, and the two-way selection. Exported so component specs
 * and the contract share a single host rather than each declaring an
 * identical copy.
 */
@Component({
  imports: [CvcEntityStreamComponent],
  template: `<cvc-entity-stream
    [spec]="spec()"
    [filters]="filters()"
    [height]="height()"
    [(selectedIds)]="selected" />`,
})
export class StreamHostComponent<TItem extends { id: number }> {
  readonly spec = signal<EntityStreamSpec<TItem>>(undefined as never)
  readonly filters = signal<Record<string, unknown>>({})
  readonly height = signal<string | undefined>(undefined)
  selected: number[] = []
}

/**
 * Flushes the query debounce and re-renders. `fixture.whenStable()` never
 * resolves in these TestBeds — a zone macrotask stays pending — so waits are
 * manual. The 400 ms default clears the component's 300 ms debounce.
 *
 * Real timers on purpose, for the same reason `settleTable` uses them:
 * under zone.js the debounce's timer lands on a zone-captured native
 * setTimeout, out of a fake clock's reach.
 */
export async function settleStream(
  fixture: ComponentFixture<unknown>,
  ms = 400
): Promise<void> {
  fixture.detectChanges()
  await new Promise((resolve) => setTimeout(resolve, ms))
  fixture.detectChanges()
}

export interface EntityStreamContractConfig<TItem extends { id: number }> {
  /**
   * Builds the stream's real spec. A factory rather than a value because it
   * has to run inside the TestBed, where its generated *GQL service is
   * injectable.
   */
  spec: () => EntityStreamSpec<TItem>
  /** the GraphQL operation the spec's query issues */
  operationName: string
  /** two items, returned as page one; the second is also page two */
  items: [TItem, TItem]
  /** wraps items in this query's own connection shape, under its field name */
  connection: (
    items: ReadonlyArray<TItem>,
    pageInfo: CvcPageInfo
  ) => Record<string, unknown>
  /**
   * A realistic filters patch for this stream — what its facade's variable
   * builder produces. Every defined key is asserted to reach the wire
   * verbatim, so values must be ones the facade would actually send.
   */
  sampleFilters: Record<string, unknown>
  /**
   * Providers the spec's renderers resolve through their injector — the
   * services a facade component normally provides around the stream
   * (presentation state, viewer context). The contract mounts the abstract
   * stream without the facade, so the facade's provisions are declared here.
   */
  providers?: Provider[]
}

export interface EntityStreamHarness<TItem extends { id: number }> {
  fixture: ComponentFixture<StreamHostComponent<TItem>>
  stream: CvcEntityStreamComponent<TItem>
  apollo: Apollo
  /** every operation the stream has issued, in order */
  operations: MockGraphqlOperation[]
  /** the variables of the stream's own operations only */
  requests(): Record<string, any>[]
  /** flushes the query debounce and re-renders; see `settleStream` */
  settle(ms?: number): Promise<void>
}

/**
 * Mounts one stream's real spec in a real `cvc-entity-stream`, against a
 * mock Apollo link that records every operation.
 *
 * The division of labour matches the tables': the component spec drives the
 * component with a synthetic spec, each facade's config spec checks its
 * config as data, and this harness is where a facade filter wired to the
 * wrong variable — or a scope a filter could override — would actually show.
 */
export async function createEntityStreamHarness<TItem extends { id: number }>(
  config: EntityStreamContractConfig<TItem>
): Promise<EntityStreamHarness<TItem>> {
  const operations: MockGraphqlOperation[] = []

  // Self-contained: a spec's own `describe` may already have configured and
  // injected from the TestBed, which would make configuring again throw.
  TestBed.resetTestingModule()
  await TestBed.configureTestingModule({
    imports: [StreamHostComponent, NzIconModule.forRoot(STREAM_ICONS)],
    providers: [
      provideMockApollo(
        // Page two is a different item, so an appended page is
        // distinguishable from a replaced one. Page one reports
        // hasNextPage: false on purpose: an 'infinite' spec's engine issues
        // a real initial range fetch of its own once data arrives — even in
        // jsdom — and a truthful hasNextPage would make every
        // request-count assertion race that fetch. Paging behaviour is
        // asserted through explicit cursor requests instead.
        (op) =>
          op.variables['after']
            ? config.connection([config.items[1]], {
                hasNextPage: false,
                hasPreviousPage: true,
                startCursor: 'b',
                endCursor: 'b',
              })
            : config.connection(config.items, {
                hasNextPage: false,
                hasPreviousPage: false,
                startCursor: 'a',
                endCursor: 'b',
              }),
        operations
      ),
      // item summaries render entity tags with routerLinks, and the shell
      // animates its detail region
      provideRouter([]),
      provideNoopAnimations(),
      ...(config.providers ?? []),
    ],
  }).compileComponents()

  const fixture = TestBed.createComponent<StreamHostComponent<TItem>>(
    StreamHostComponent as never
  )
  fixture.componentInstance.spec.set(config.spec())
  fixture.componentInstance.filters.set(config.sampleFilters)
  fixture.detectChanges()

  const stream = fixture.debugElement.children[0]
    .componentInstance as CvcEntityStreamComponent<TItem>

  return {
    fixture,
    stream,
    apollo: TestBed.inject(Apollo),
    operations,
    requests: () =>
      operations
        .filter((op) => op.operationName === config.operationName)
        .map((op) => op.variables),
    settle: (ms?: number) => settleStream(fixture, ms),
  }
}

/**
 * The behaviour every stream built on `cvc-entity-stream` must have, driven
 * through one facade's real spec. Call inside a `describe` for that stream;
 * add facade-specific `it`s alongside it.
 *
 * Items are deliberately never asserted on in `'infinite'` mode: the
 * virtual scroller measures against real layout and renders nothing in
 * jsdom, so rendering is covered by the browser-level goldens. Everything
 * below is the query pipeline, which is not.
 */
export function describeEntityStreamContract<TItem extends { id: number }>(
  config: EntityStreamContractConfig<TItem>
): void {
  const setup = () => createEntityStreamHarness(config)

  describe('entity-stream contract', () => {
    it('opens with a single query carrying page size, filters and scope', async () => {
      const h = await setup()
      await h.settle()

      const opening = h.requests()
      expect(opening).toHaveLength(1)
      expect(opening[0]).toMatchObject({
        first: h.stream.spec().pageSize,
        ...JSON.parse(JSON.stringify(config.sampleFilters)),
        ...h.stream.spec().scope,
      })
    })

    it('does not re-query when the variables come out identical', async () => {
      const h = await setup()
      await h.settle()
      const opening = h.requests().length

      // a fresh object with the same values: only value identity may matter
      h.fixture.componentInstance.filters.set({ ...config.sampleFilters })
      await h.settle()

      expect(h.requests()).toHaveLength(opening)
    })

    it('lets no filter override a scope variable', async () => {
      const h = await setup()
      const scope = h.stream.spec().scope
      const scopeKeys = Object.keys(scope)
      await h.settle()

      h.fixture.componentInstance.filters.set({
        ...config.sampleFilters,
        ...Object.fromEntries(scopeKeys.map((key) => [key, 'HIJACKED'])),
        probeExtra: 'sent',
      })
      await h.settle()

      const sent = h.requests().at(-1)!
      for (const key of scopeKeys) {
        expect(sent[key], `scope key '${key}'`).toEqual(scope[key])
      }
      // the patch itself did arrive — the scope keys were overridden, not
      // the whole patch dropped
      expect(sent['probeExtra']).toBe('sent')
    })

    it('omits a cleared filter rather than sending null', async () => {
      const h = await setup()
      await h.settle()

      const [firstKey] = Object.keys(config.sampleFilters)
      h.fixture.componentInstance.filters.set({
        ...config.sampleFilters,
        [firstKey]: undefined,
        probeCleared: undefined,
      })
      await h.settle()

      const sent = h.requests().at(-1)!
      expect(sent['probeCleared']).toBeUndefined()
      expect(Object.keys(sent)).not.toContain('probeCleared')
    })

    it('carries the current filters into a fetchMore with the cursor', async () => {
      const h = await setup()
      await h.settle()

      void h.stream.query.fetchMore({
        first: h.stream.spec().pageSize,
        after: 'b',
      })
      await h.settle()

      const paged = h.requests().at(-1)!
      expect(paged['after']).toBe('b')
      expect(paged).toMatchObject(
        JSON.parse(JSON.stringify(config.sampleFilters))
      )
    })

    it('refresh re-runs the current variable set', async () => {
      const h = await setup()
      await h.settle()
      const before = h.requests().length
      const last = h.requests().at(-1)!

      h.stream.refresh()
      await h.settle()

      expect(h.requests()).toHaveLength(before + 1)
      expect(h.requests().at(-1)).toEqual(last)
    })
  })
}

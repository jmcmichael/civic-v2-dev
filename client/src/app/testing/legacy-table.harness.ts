import { Type } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import {
  CloseCircleOutline,
  DownloadOutline,
  ExclamationCircleOutline,
  LinkOutline,
  LockOutline,
  UnlockOutline,
} from '@ant-design/icons-angular/icons'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { describe, expect, it, type TestContext } from 'vitest'
import {
  MockGraphqlOperation,
  provideMockApollo,
} from './apollo-test.providers'
import { TABLE_ICONS } from './entity-table.harness'

/**
 * `TABLE_ICONS` plus the outline-theme ant icons legacy card chrome renders
 * that the new framework does not (`cvc-link-tag`'s "link", the
 * downloader's "download", the clearable filter's "close-circle",
 * `cvc-no-more-rows`'s "exclamation-circle"). Also covers legacy per-table
 * one-offs whose header cell renders outside the virtualised body, so it
 * mounts regardless of jsdom's inability to render `cdk-virtual-scroll` rows
 * — sources-table's Open Access column header icon (`unlock`; `lock` added
 * alongside it for the same reason, in case a row ever does render). Same
 * failure mode as `TABLE_ICONS` itself: an unregistered icon throws
 * *outside* the test's own call stack, so every assertion stays green while
 * the runner reports a flood of unhandled errors.
 */
export const LEGACY_TABLE_ICONS = [
  ...TABLE_ICONS,
  CloseCircleOutline,
  DownloadOutline,
  ExclamationCircleOutline,
  LinkOutline,
  LockOutline,
  UnlockOutline,
]

/**
 * Flushes a legacy table's `filterChange$` debounce (500ms) and re-renders.
 * Mirrors `settleTable` in `entity-table.harness.ts` — real timers, same
 * reasoning (a zone-captured `setTimeout` is out of a fake clock's reach).
 * The default is longer than the framework's 400ms because the legacy
 * debounce itself is longer (500ms vs the framework's 300ms).
 */
export async function settle(
  fixture: ComponentFixture<unknown>,
  ms = 600
): Promise<void> {
  fixture.detectChanges()
  await new Promise((resolve) => setTimeout(resolve, ms))
  fixture.detectChanges()
}

/** One filter or sort interaction: how to drive it, and what must land on the wire. */
export interface LegacyInteractionCase<T> {
  name: string
  /** mutates the mounted component instance the way its template bindings would */
  apply: (component: T) => void
  /** a subset of the variables expected in the NEXT request after settling */
  sends: Record<string, unknown>
}

export interface LegacyTableDescriptor<T> {
  component: Type<T>
  module: Type<unknown>
  /** the GraphQL operation name the table's own query issues */
  operationName: string
  /** answers the table's own query; a `ViewerBase` operation (if any fires) is handled centrally */
  respond: (op: MockGraphqlOperation) => unknown
  /** inputs set via `componentRef.setInput` before the first `detectChanges` */
  inputs?: Record<string, unknown>
  /** the variables expected on the OPENING query (defaults / scope / page size / sort) */
  opening: Record<string, unknown>
  filters?: LegacyInteractionCase<T>[]
  sorts?: LegacyInteractionCase<T>[]
  /** does this table refetch when its `ids` input changes? default true */
  idsRefetch?: boolean
  /**
   * What the refetch is expected to send once `ids` changes, checked with
   * `toMatchObject`. Defaults to `{ ids: [42] }`. Override only to document
   * a legacy bug where the refetch does not actually carry the new value
   * (e.g. a `refresh()` that rebuilds its variables object from scratch and
   * forgets `ids` — Apollo's `refetch` then keeps whatever `ids` was at
   * mount time, forever, however the input changes afterward).
   */
  idsRefetchSends?: Record<string, unknown>
}

export interface LegacyTableHarness<T> {
  fixture: ComponentFixture<T>
  component: T
  operations: MockGraphqlOperation[]
  /** the variables of the table's own operations only, in order */
  requests(): Record<string, unknown>[]
  settle(ms?: number): Promise<void>
}

export async function mountLegacyTable<T>(
  descriptor: LegacyTableDescriptor<T>
): Promise<LegacyTableHarness<T>> {
  const operations: MockGraphqlOperation[] = []

  // Self-contained: mirrors createEntityTableHarness so a spec's own describe
  // configuring the TestBed first does not make this throw.
  TestBed.resetTestingModule()
  await TestBed.configureTestingModule({
    imports: [descriptor.module, NzIconModule.forRoot(LEGACY_TABLE_ICONS)],
    providers: [
      provideMockApollo((op) => {
        // some legacy trees resolve a global viewer somewhere in their child
        // tree; answer it centrally so no descriptor has to know that
        if (op.operationName === 'ViewerBase') return { viewer: null }
        return descriptor.respond(op)
      }, operations),
      provideRouter([]),
      provideNoopAnimations(),
    ],
  }).compileComponents()

  const fixture = TestBed.createComponent(descriptor.component)
  // setInput (not direct property assignment) so ngOnChanges fires exactly as
  // it would from a real host template binding
  for (const [key, value] of Object.entries(descriptor.inputs ?? {})) {
    fixture.componentRef.setInput(key, value)
  }
  fixture.detectChanges()

  const harness: LegacyTableHarness<T> = {
    fixture,
    component: fixture.componentInstance,
    operations,
    requests: () =>
      operations
        .filter((op) => op.operationName === descriptor.operationName)
        .map((op) => op.variables),
    settle: (ms?: number) => settle(fixture, ms),
  }

  return harness
}

/**
 * The behaviour a pre-migration legacy browse table has, driven through its
 * real component + module. Call inside a `describe` for that table; add
 * table-specific `it`s alongside it (queryParam sync, scope menus, etc. —
 * whatever the plain filter/sort/ids vocabulary below cannot express).
 *
 * This is the Phase B parity net: every assertion here is ported into the
 * facade's `config.spec.ts` at migration time (same "sends X for filter Y"
 * expectations, now proving the facade rather than the legacy component
 * produces them), and this spec is deleted once that's done — it cannot
 * compile once the legacy component it mounts is gone.
 *
 * Rows are never asserted, matching `describeEntityTableContract`: jsdom
 * cannot render `cdk-virtual-scroll`, so only the wire is observable.
 */
export function describeLegacyTableCharacterization<T>(
  descriptor: LegacyTableDescriptor<T>
): void {
  describe('legacy table characterization', () => {
    it('opens with the expected default query', async () => {
      const h = await mountLegacyTable(descriptor)
      await h.settle()

      expect(h.requests()).toHaveLength(1)
      expect(h.requests()[0]).toMatchObject(descriptor.opening)
    })

    for (const filterCase of descriptor.filters ?? []) {
      it(`filter: ${filterCase.name} -> its variable`, async () => {
        const h = await mountLegacyTable(descriptor)
        await h.settle()

        filterCase.apply(h.component)
        await h.settle()

        expect(h.requests().at(-1)).toMatchObject(filterCase.sends)
      })
    }

    it('filters coexist rather than overwriting one another', async (ctx: TestContext) => {
      if (!descriptor.filters || descriptor.filters.length < 2) {
        ctx.skip('fewer than two filters declared')
        return
      }
      const h = await mountLegacyTable(descriptor)
      await h.settle()

      for (const filterCase of descriptor.filters ?? []) {
        filterCase.apply(h.component)
      }
      await h.settle()

      const sent = h.requests().at(-1)!
      for (const filterCase of descriptor.filters ?? []) {
        expect(sent).toMatchObject(filterCase.sends)
      }
    })

    for (const sortCase of descriptor.sorts ?? []) {
      it(`sort: ${sortCase.name}`, async () => {
        const h = await mountLegacyTable(descriptor)
        await h.settle()

        sortCase.apply(h.component)
        // sort refetches immediately, not through the filter debounce
        await h.settle(50)

        expect(h.requests().at(-1)).toMatchObject(sortCase.sends)
      })
    }

    it('refetches when the ids input changes', async (ctx: TestContext) => {
      if (descriptor.idsRefetch === false) {
        ctx.skip('table does not scope by ids')
        return
      }
      const h = await mountLegacyTable(descriptor)
      await h.settle()
      const opening = h.requests().length

      h.fixture.componentRef.setInput('ids', [42])
      await h.settle()

      expect(h.requests().length).toBeGreaterThan(opening)
      expect(h.requests().at(-1)).toMatchObject(
        descriptor.idsRefetchSends ?? { ids: [42] }
      )
    })
  })
}

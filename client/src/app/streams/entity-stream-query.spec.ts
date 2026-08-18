import { DestroyRef } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Maybe } from '@app/generated/civic.apollo.types'
import { CvcConnection, CvcEdge } from '@app/tables/connection.types'
import { Subject } from 'rxjs'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { CvcStreamQueryService } from './entity-stream-config'
import { CvcEntityStreamQuery } from './entity-stream-query'

/**
 * The store against a hand-rolled QueryRef: emissions, refetch and fetchMore
 * promises are all driven by the test, so every ordering the scroller can
 * produce — overlapping ranges, ranges across a variables change — is
 * constructable.
 */

interface FakeResult {
  data: unknown
  loading: boolean
  error?: Error
}

function edge(cursor: string): CvcEdge<{ id: number }> {
  return { cursor, node: { id: Number.parseInt(cursor, 10) } }
}

function connection(
  edges: CvcEdge<{ id: number }>[],
  hasNextPage: boolean
): CvcConnection<{ id: number }> {
  return {
    edges,
    pageInfo: { hasNextPage, hasPreviousPage: false },
  }
}

class FakeQueryRef {
  readonly valueChanges = new Subject<FakeResult>()
  readonly refetch = vi.fn(
    (vars: Record<string, unknown>): Promise<FakeResult> =>
      this.nextRefetch ?? Promise.resolve({ data: undefined, loading: false })
  )
  readonly fetchMore = vi.fn(
    (options: {
      variables: Record<string, unknown>
    }): Promise<FakeResult> =>
      this.nextFetchMore ?? Promise.resolve({ data: undefined, loading: false })
  )
  nextRefetch?: Promise<FakeResult>
  nextFetchMore?: Promise<FakeResult>

  emit(data: unknown): void {
    this.valueChanges.next({ data, loading: false })
  }
}

describe('CvcEntityStreamQuery', () => {
  let ref: FakeQueryRef
  let watch: Mock<(options?: object) => FakeQueryRef>
  let onRefetch: Mock<() => void>
  let store: CvcEntityStreamQuery

  beforeEach(() => {
    ref = new FakeQueryRef()
    watch = vi.fn(() => ref)
    onRefetch = vi.fn<() => void>()
    store = new CvcEntityStreamQuery({
      query: () =>
        ({ watch }) as unknown as CvcStreamQueryService<
          unknown,
          Record<string, unknown>
        >,
      connection: (data) =>
        data as Maybe<CvcConnection<unknown>> | undefined,
      destroyRef: TestBed.inject(DestroyRef),
      onRefetch,
    })
  })

  it('opens the QueryRef once, with the variables in an options object', () => {
    store.run({ mode: 'UNSCOPED', first: 5 })

    expect(watch).toHaveBeenCalledTimes(1)
    expect(watch).toHaveBeenCalledWith({
      variables: { mode: 'UNSCOPED', first: 5 },
    })
  })

  it('reports loading until the first response, then derives from it', () => {
    store.run({ first: 5 })
    expect(store.loading()).toBe(true)

    ref.emit(connection([edge('1')], false))
    expect(store.loading()).toBe(false)
    expect(store.edges()).toHaveLength(1)
    expect(store.pageInfo()?.hasNextPage).toBe(false)
  })

  it('refetches through the same QueryRef on later runs, reporting refetching', async () => {
    store.run({ first: 5 })
    ref.emit(connection([edge('1')], false))

    let land!: (value: FakeResult) => void
    ref.nextRefetch = new Promise((resolve) => (land = resolve))
    store.run({ first: 5, userId: [1] })

    expect(watch).toHaveBeenCalledTimes(1)
    expect(ref.refetch).toHaveBeenCalledWith({ first: 5, userId: [1] })
    expect(store.refetching()).toBe(true)

    land({ data: undefined, loading: false })
    await vi.waitFor(() => expect(store.refetching()).toBe(false))
    expect(onRefetch).toHaveBeenCalledTimes(1)
  })

  it('refresh re-runs the last variable set and does nothing before one exists', () => {
    store.refresh()
    expect(watch).not.toHaveBeenCalled()

    store.run({ first: 5 })
    ref.emit(connection([edge('1')], true))
    store.refresh()
    expect(ref.refetch).toHaveBeenCalledWith({ first: 5 })
  })

  it("fetchMore extends the current result set's variables with the page", () => {
    store.run({ first: 5, userId: [1] })
    ref.emit(connection([edge('1')], true))

    void store.fetchMore({ first: 5, after: '1' })
    expect(ref.fetchMore).toHaveBeenCalledWith({
      variables: { first: 5, userId: [1], after: '1' },
    })
  })

  it('returns the in-flight promise for a repeated cursor instead of refetching it', () => {
    store.run({ first: 5 })
    ref.emit(connection([edge('1')], true))
    ref.nextFetchMore = new Promise(() => {})

    const a = store.fetchMore({ first: 5, after: '1' })
    const b = store.fetchMore({ first: 5, after: '1' })

    expect(a).toBe(b)
    expect(ref.fetchMore).toHaveBeenCalledTimes(1)
  })

  it('resolves a loaded range without fetching', async () => {
    store.run({ first: 5 })
    ref.emit(connection([edge('1'), edge('2'), edge('3')], true))

    const range = await store.getRange(0, 2)

    expect(range.map((e) => e.cursor)).toEqual(['1', '2'])
    expect(ref.fetchMore).not.toHaveBeenCalled()
  })

  it('resolves short past the end of a fully-loaded connection', async () => {
    store.run({ first: 5 })
    ref.emit(connection([edge('1'), edge('2')], false))

    const range = await store.getRange(1, 5)

    expect(range.map((e) => e.cursor)).toEqual(['2'])
    expect(ref.fetchMore).not.toHaveBeenCalled()
  })

  it('fetches from the loaded tail when the range reaches past it', async () => {
    store.run({ first: 2 })
    ref.emit(connection([edge('1'), edge('2')], true))

    let land!: (value: FakeResult) => void
    ref.nextFetchMore = new Promise((resolve) => (land = resolve))

    const pending = store.getRange(1, 3)
    expect(ref.fetchMore).toHaveBeenCalledWith({
      variables: { first: 3, after: '2' },
    })

    // the page lands: the cache-side accumulation shows up as a new emission
    ref.emit(
      connection([edge('1'), edge('2'), edge('3'), edge('4')], true)
    )
    land({ data: undefined, loading: false })

    const range = await pending
    expect(range.map((e) => e.cursor)).toEqual(['2', '3', '4'])
  })

  it('waits for a page that lands after its fetch promise settles', async () => {
    store.run({ first: 2 })
    ref.emit(connection([edge('1'), edge('2')], true))

    // the fetch's promise settles with the network result; the merged list
    // arrives through a later emission
    ref.nextFetchMore = Promise.resolve({ data: undefined, loading: false })
    const pending = store.getRange(0, 4)
    setTimeout(
      () =>
        ref.emit(
          connection([edge('1'), edge('2'), edge('3'), edge('4')], true)
        ),
      50
    )

    const range = await pending
    expect(range.map((e) => e.cursor)).toEqual(['1', '2', '3', '4'])
  })

  it('resolves empty for a range awaited across a variables change', async () => {
    store.run({ first: 2 })
    ref.emit(connection([edge('1'), edge('2')], true))

    let land!: (value: FakeResult) => void
    ref.nextFetchMore = new Promise((resolve) => (land = resolve))
    const pending = store.getRange(0, 4)

    store.run({ first: 2, userId: [1] })
    land({ data: undefined, loading: false })

    expect(await pending).toEqual([])
  })

  it('sets requestError and resolves when a page fetch fails', async () => {
    store.run({ first: 5 })
    ref.emit(connection([edge('1')], true))
    ref.nextFetchMore = Promise.reject(new Error('fetch failed'))

    const range = await store.getRange(0, 4)

    expect(range.map((e) => e.cursor)).toEqual(['1'])
    expect(store.requestError()?.network).toBeInstanceOf(Error)
  })

  it('surfaces subscription errors on the network side', () => {
    store.run({ first: 5 })
    ref.valueChanges.error(new Error('socket closed'))

    expect(store.requestError()?.network).toBeInstanceOf(Error)
  })
})

import { DestroyRef, computed, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { type ErrorLike } from '@apollo/client'
import { Maybe } from '@app/generated/civic.apollo.types'
import {
  CvcConnection,
  CvcEdge,
  CvcPageInfo,
} from '@app/tables/connection.types'
import {
  CvcTableRequestError,
  splitError,
} from '@app/tables/entity-table-query'
import { QueryRef } from 'apollo-angular'
import { CvcStreamQueryService } from './entity-stream-config'

/** what a request error looks like once split out of Apollo's ErrorLike */
export type CvcStreamRequestError = CvcTableRequestError

/** the variables a spec's query takes once the factory has erased its types */
type CvcStreamVars = Record<string, unknown>

/** one page of items, requested by cursor position */
export interface CvcStreamPageRequest {
  /** how many items the page holds */
  first: number
  /** the cursor the page starts after; omitted for the first page */
  after?: string
}

export interface CvcEntityStreamQueryOptions {
  /**
   * The spec's query service. A thunk because the spec is a component input:
   * it is not readable when the store is constructed, and the store must not
   * hold a copy of it.
   */
  query: () => CvcStreamQueryService<unknown, CvcStreamVars>
  /**
   * The spec's `connection` accessor, wrapped so the store reads the current
   * spec's accessor on every call — same rationale as `query`.
   */
  connection: (data: unknown) => Maybe<CvcConnection<unknown>>
  destroyRef: DestroyRef
  /**
   * Runs when a refetch lands successfully, for the host to reset its
   * scroller to the top of the new result set.
   */
  onRefetch?: () => void
}

/**
 * The stream's query pipeline: one `QueryRef`, the response derived from it,
 * and the ways of asking for items.
 *
 * ## What must not change about it
 *
 * One `QueryRef`, created lazily on the first variables emission and never
 * re-created. Refetch and fetchMore go through the same guarded path so they
 * cannot race: a refetch replaces the variable set, a fetchMore appends a
 * page, and Apollo's pagination type policy — not this store — accumulates
 * the items.
 *
 * Errors are re-derived by hand because `valueChanges` does not surface
 * errors raised by imperative `refetch`/`fetchMore` calls, so each promise's
 * result is inspected too.
 *
 * Where the table store reads rows as nodes, this store's primary read is
 * `edges` — items with their cursors — because the scroller addresses items
 * by index range and pages are requested by the cursor at the loaded tail.
 */
export class CvcEntityStreamQuery {
  constructor(private readonly options: CvcEntityStreamQueryOptions) {}

  private queryRef?: QueryRef<unknown, CvcStreamVars>

  /**
   * The variables of the current result set — what `run` last sent. A
   * fetchMore always extends THIS set: the component's live variables can be
   * ahead of it inside the query debounce window, and a page fetched with
   * variables that were never refetched would land in a cache entry whose
   * first page never existed.
   */
  private lastVars?: CvcStreamVars

  /**
   * The page request currently in flight, if any. A repeat request for the
   * same cursor returns the same promise rather than issuing a second
   * fetch — the scroller can ask for overlapping ranges while one page is
   * still loading.
   */
  private inflightPage?: { after: Maybe<string>; promise: Promise<void> }

  /**
   * Increments on every `run`. A `getRange` that awaited a page across a
   * variables change resolves empty instead of slicing a result set it was
   * not asked about; the scroller is reloading against the new set anyway.
   */
  private generation = 0

  private readonly result =
    signal<Maybe<{ data: unknown; loading: boolean }>>(undefined)
  private readonly fetchingMore = signal(false)
  private readonly refetchingState = signal(false)
  private readonly error = signal<Maybe<CvcStreamRequestError>>(undefined)

  /** the latest response payload */
  readonly data = computed(() => this.result()?.data)

  /** true until the first response, so the first paint is not a blank stream */
  readonly loading = computed(() => this.result()?.loading ?? true)

  /**
   * True while a refetch replaces the result set — the window the stream
   * covers its list with a spinner, because the scroller reloads from the
   * top when the new set lands.
   */
  readonly refetching = this.refetchingState.asReadonly()

  /** a page is being appended, as opposed to the result set being replaced */
  readonly isFetchingMore = this.fetchingMore.asReadonly()

  readonly requestError = this.error.asReadonly()

  /** the spec's connection, read from the latest payload */
  readonly connection = computed(() => this.options.connection(this.data()))

  /** the loaded items with their cursors, in connection order */
  readonly edges = computed<ReadonlyArray<CvcEdge<unknown>>>(
    () => this.connection()?.edges ?? []
  )

  readonly pageInfo = computed<Maybe<CvcPageInfo>>(
    () => this.connection()?.pageInfo
  )

  /**
   * Runs the query for a new variable set: the first call opens the QueryRef
   * and subscribes, every later one refetches through it.
   */
  run(vars: CvcStreamVars): void {
    this.lastVars = vars
    this.error.set(undefined)
    this.fetchingMore.set(false)
    this.generation++
    this.inflightPage = undefined

    if (!this.queryRef) {
      // `{ variables }`, not positional — see CvcStreamQueryService: a
      // positional call would run yet silently send no variables.
      this.queryRef = this.options
        .query()
        .watch({ variables: vars }) as QueryRef<unknown, CvcStreamVars>
      this.queryRef.valueChanges
        .pipe(takeUntilDestroyed(this.options.destroyRef))
        .subscribe({
          next: (value) => {
            this.result.set(value)
            if (value.error) this.error.set(splitError(value.error))
          },
          error: (error: ErrorLike) => this.error.set(splitError(error)),
        })
      return
    }

    this.refetchingState.set(true)
    this.queryRef
      .refetch(vars)
      .then((value) => {
        if (value.error) this.error.set(splitError(value.error))
        this.options.onRefetch?.()
      })
      .catch((error: ErrorLike) => this.error.set(splitError(error)))
      .finally(() => this.refetchingState.set(false))
  }

  /**
   * Re-runs the current variable set — the poll tick's body, and the action
   * behind any "check for updates" affordance. Does nothing before the first
   * `run`.
   */
  refresh(): void {
    if (this.lastVars) this.run(this.lastVars)
  }

  /**
   * Appends a page. Resolves once the page has landed (or failed — failures
   * set `requestError` and resolve rather than reject, so awaiting callers
   * need no handler). Does nothing before the QueryRef exists.
   *
   * The page's variables are `lastVars` — the set the current result was
   * fetched with — never the component's live variables, which can already
   * differ inside the query debounce window (see `lastVars`).
   */
  fetchMore(fetch: CvcStreamPageRequest): Promise<void> {
    if (!this.queryRef || !this.lastVars) return Promise.resolve()
    if (this.inflightPage && this.inflightPage.after === fetch.after) {
      return this.inflightPage.promise
    }
    this.fetchingMore.set(true)
    const promise: Promise<void> = this.queryRef
      .fetchMore({ variables: { ...this.lastVars, ...fetch } })
      .then((value) => {
        if (value.error) this.error.set(splitError(value.error))
      })
      .catch((error: ErrorLike) => this.error.set(splitError(error)))
      .finally(() => {
        this.fetchingMore.set(false)
        if (this.inflightPage?.promise === promise) {
          this.inflightPage = undefined
        }
      })
    this.inflightPage = { after: fetch.after, promise }
    return promise
  }

  /**
   * The scroller's datasource contract: resolves the edges in
   * `[index, index + count)`, fetching the next page first when the range
   * reaches beyond what is loaded and the connection has more.
   *
   * Pages append at the loaded tail (`after` the last loaded cursor), so one
   * fetch extends the set far enough for any contiguous range the scroller
   * asks for. A short or empty resolution — past the end of a fully-loaded
   * connection, or across a variables change — is how the scroller learns
   * the range is exhausted, so a resolution must never be short for a page
   * that did arrive: the fetch promise settles with the network result
   * while the merged list lands through the cache broadcast a tick later,
   * and this waits for the appended edges before slicing.
   */
  async getRange(
    index: number,
    count: number
  ): Promise<ReadonlyArray<CvcEdge<unknown>>> {
    const generation = this.generation
    const wanted = index + count
    const slice = () => this.edges().slice(index, wanted)

    if (this.edges().length >= wanted) return slice()
    if (!this.pageInfo()?.hasNextPage) return slice()

    const edges = this.edges()
    await this.fetchMore({
      first: Math.max(wanted - edges.length, count),
      after: edges.length > 0 ? edges[edges.length - 1].cursor : undefined,
    })
    if (this.generation !== generation) return []
    await this.settleAppend(edges.length, generation)
    if (this.generation !== generation) return []
    return slice()
  }

  /**
   * Waits until the loaded edges extend past `previousLength` — the page
   * landing through the cache broadcast — bounded so a page that appends
   * nothing (a stale `hasNextPage` at the true end of the set) resolves
   * rather than hangs.
   */
  private async settleAppend(
    previousLength: number,
    generation: number
  ): Promise<void> {
    const APPEND_SETTLE_TRIES = 50
    const APPEND_SETTLE_INTERVAL_MS = 10
    for (let attempt = 0; attempt < APPEND_SETTLE_TRIES; attempt++) {
      if (this.generation !== generation) return
      if (this.edges().length > previousLength) return
      await new Promise((resolve) =>
        setTimeout(resolve, APPEND_SETTLE_INTERVAL_MS)
      )
    }
  }
}

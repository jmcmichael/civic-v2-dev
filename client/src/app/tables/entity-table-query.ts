import { DestroyRef, computed, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { CombinedGraphQLErrors, type ErrorLike } from '@apollo/client'
import { Maybe } from '@app/generated/civic.apollo.types'
import { QueryRef } from 'apollo-angular'
import type { GraphQLFormattedError } from 'graphql'
import { CvcTableQuery } from './entity-table-config'
import { CvcScrollFetch } from './table-scroll.directive'

/** what a request error looks like once split out of Apollo's ErrorLike */
export interface CvcTableRequestError {
  network?: ErrorLike
  query?: ReadonlyArray<GraphQLFormattedError>
}

/** the variables a spec's query takes once the factory has erased its types */
type CvcTableVars = Record<string, unknown>

export interface CvcEntityTableQueryOptions {
  /**
   * The spec's query service. A thunk because the spec is a component input:
   * it is not readable when the store is constructed, and the store must not
   * hold a copy of it.
   */
  query: () => CvcTableQuery<unknown, CvcTableVars>
  destroyRef: DestroyRef
  /**
   * Runs when a refetch lands successfully, for the host to return its scroll
   * position to the top of the new result set.
   */
  onRefetch?: () => void
}

/**
 * The table's query pipeline: one `QueryRef`, the response derived from it, and
 * the two ways of asking for rows.
 *
 * ## What must not change about it
 *
 * One `QueryRef`, created lazily on the first variables emission and never
 * re-created. Refetch and fetchMore go through the same guarded path so they
 * cannot race: a refetch replaces the variable set, a fetchMore appends a page,
 * and Apollo's `relayStylePagination` policy — not this store — accumulates the
 * rows.
 *
 * Errors are re-derived by hand because `valueChanges` does not surface errors
 * raised by imperative `refetch`/`fetchMore` calls
 * (apollographql/apollo-client#6857), so each promise's result is inspected too.
 */
export class CvcEntityTableQuery {
  constructor(private readonly options: CvcEntityTableQueryOptions) {}

  private queryRef?: QueryRef<unknown, CvcTableVars>

  /**
   * The variables of the current result set — what `run` last sent. A
   * fetchMore always extends THIS set: the component's live variables can be
   * ahead of it inside the query debounce window, and a page fetched with
   * variables that were never refetched would land in a cache entry whose
   * first page never existed.
   */
  private lastVars?: CvcTableVars

  /**
   * The cursor a fetchMore is already in flight for. The guard lives here
   * rather than in the scroll directive because a refetch is what makes a
   * cursor stale, and only this store sees one happen.
   */
  private requestedCursor?: string

  private readonly result =
    signal<Maybe<{ data: unknown; loading: boolean }>>(undefined)
  private readonly fetchingMore = signal(false)
  private readonly error = signal<Maybe<CvcTableRequestError>>(undefined)

  /** the latest response payload, for the spec's `connection` accessor */
  readonly data = computed(() => this.result()?.data)

  /**
   * True until the first response, so the first paint is not a blank table.
   *
   * Deliberately NOT true during a refetch: `valueChanges` only re-emits
   * loading states under `notifyOnNetworkStatusChange`, and the chosen UX is
   * to keep the previous rows visible without a flicker while a filter/sort
   * change is in flight — the debounced pipeline keeps that window short.
   */
  readonly loading = computed(() => this.result()?.loading ?? true)

  /** a page is being appended, as opposed to the result set being replaced */
  readonly isFetchingMore = this.fetchingMore.asReadonly()

  readonly requestError = this.error.asReadonly()

  /**
   * Runs the query for a new variable set: the first call opens the QueryRef
   * and subscribes, every later one refetches through it.
   */
  run(vars: CvcTableVars): void {
    this.lastVars = vars
    this.error.set(undefined)
    this.fetchingMore.set(false)

    if (!this.queryRef) {
      // `{ variables }`, not positional — see CvcTableQuery. The three
      // apollo-angular entry points this store uses disagree (`watch` and
      // `fetchMore` take options objects, `refetch` takes variables), and a
      // positional call here would run yet silently send no variables. Two
      // guards hold it: CvcTableQuery types `watch` as options-only, and the
      // "puts those variables on the wire" spec fails if variables ever stop
      // reaching the link.
      this.queryRef = this.options
        .query()
        .watch({ variables: vars }) as QueryRef<unknown, CvcTableVars>
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

    // a new variable set invalidates any cursor already asked for
    this.requestedCursor = undefined
    this.queryRef
      .refetch(vars)
      .then((value) => {
        if (value.error) this.error.set(splitError(value.error))
        this.options.onRefetch?.()
      })
      .catch((error: ErrorLike) => this.error.set(splitError(error)))
  }

  /**
   * Appends a page. Does nothing before the QueryRef exists, or for a cursor
   * already asked for — positional relay cursors repeat, so the same `after`
   * arriving twice is routine rather than exceptional.
   *
   * The page's variables are `lastVars` — the set the current result was
   * fetched with — never the component's live variables, which can already
   * differ inside the query debounce window (see `lastVars`).
   *
   * @param fetch the page request the scroll observer reported
   */
  fetchMore(fetch: CvcScrollFetch): void {
    if (!this.queryRef || !this.lastVars) return
    if (fetch.after === this.requestedCursor) return
    this.requestedCursor = fetch.after
    this.fetchingMore.set(true)
    this.queryRef
      .fetchMore({ variables: { ...this.lastVars, ...fetch } })
      .then((value) => {
        if (value.error) this.error.set(splitError(value.error))
      })
      .catch((error: ErrorLike) => this.error.set(splitError(error)))
      .finally(() => this.fetchingMore.set(false))
  }
}

/**
 * Splits Apollo 4's single `ErrorLike` into the GraphQL errors and the transport
 * error, so the toolbar can label them differently.
 */
export function splitError(error: ErrorLike): CvcTableRequestError {
  return {
    query: CombinedGraphQLErrors.is(error) ? error.errors : undefined,
    network: CombinedGraphQLErrors.is(error) ? undefined : error,
  }
}

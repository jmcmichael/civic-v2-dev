import { DestroyRef } from '@angular/core'
import { CombinedGraphQLErrors } from '@apollo/client'
import { EMPTY } from 'rxjs'
import { describe, expect, it } from 'vitest'
import { CvcEntityTableQuery, splitError } from './entity-table-query'

/**
 * The partition the toolbar renders from: GraphQL errors get the
 * question-circle "Query Error" tag with per-error tooltips, anything else
 * gets the "Network Error" tag. Apollo 4 hands over one `ErrorLike`; this is
 * the only place that decides which side it lands on.
 */
describe('splitError', () => {
  it('routes GraphQL errors to the query side, empty network', () => {
    const errors = [{ message: 'field "rating" not found' }]
    const split = splitError(new CombinedGraphQLErrors({ errors }, errors))

    expect(split.query).toEqual(errors)
    expect(split.network).toBeUndefined()
  })

  it('routes anything else to the network side, empty query', () => {
    const failure = new Error('fetch failed')
    const split = splitError(failure)

    expect(split.network).toBe(failure)
    expect(split.query).toBeUndefined()
  })
})

describe('CvcEntityTableQuery watch options', () => {
  it('opts out of network-status loading emissions — refetches must not flash the spinner', () => {
    // the app's global watchQuery defaults set notifyOnNetworkStatusChange:
    // true; the store's documented UX (no loading flicker on filter/sort
    // refetches, see loading()) depends on opting back out per-watch
    let captured: unknown
    const store = new CvcEntityTableQuery({
      query: () =>
        ({
          watch: (options: unknown) => {
            captured = options
            return { valueChanges: EMPTY }
          },
        }) as never,
      destroyRef: { onDestroy: () => () => {}, destroyed: false } as DestroyRef,
    })

    store.run({ first: 25 })

    expect(captured).toMatchObject({
      variables: { first: 25 },
      notifyOnNetworkStatusChange: false,
    })
  })
})

import { CombinedGraphQLErrors } from '@apollo/client'
import { describe, expect, it } from 'vitest'
import { splitError } from './entity-table-query'

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

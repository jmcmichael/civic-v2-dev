import { PageInfo } from '@app/generated/civic.apollo.types'
import { describe, expect, it } from 'vitest'
import { nextFetch } from './table-scroll.directive'

function pageInfo(over: Partial<PageInfo> = {}): PageInfo {
  return {
    __typename: 'PageInfo',
    hasNextPage: true,
    hasPreviousPage: false,
    startCursor: 'start',
    endCursor: 'cursor-1',
    ...over,
  }
}

describe('nextFetch', () => {
  it('asks for the next page after the current end cursor', () => {
    expect(nextFetch(pageInfo(), 50)).toEqual({
      first: 50,
      after: 'cursor-1',
    })
  })

  it('asks for nothing when the connection is exhausted', () => {
    expect(nextFetch(pageInfo({ hasNextPage: false }), 50)).toBeUndefined()
  })

  it('asks for nothing before a connection has loaded', () => {
    expect(nextFetch(undefined, 50)).toBeUndefined()
  })

  it('asks for nothing when there is no cursor to page from', () => {
    // an empty connection reports hasNextPage without an endCursor
    // (Maybe<T> is T | undefined in this codebase, not T | null)
    expect(nextFetch(pageInfo({ endCursor: undefined }), 50)).toBeUndefined()
  })

  // in-flight cursor dedup is the host's job — see nextFetch's doc and the
  // fetchMore describe block in entity-table.component.spec.ts
  it('re-reports the same cursor on repeated near-bottom events', () => {
    expect(nextFetch(pageInfo(), 50)).toEqual(nextFetch(pageInfo(), 50))
  })

  it('carries the configured page size', () => {
    expect(nextFetch(pageInfo(), 25)?.first).toBe(25)
  })
})

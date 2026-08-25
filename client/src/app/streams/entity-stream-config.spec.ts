import { EvidenceManagerGQL } from '@app/forms/types/evidence-select/evidence-manager/evidence-manager.query.gql.generated'
import { describe, expect, it } from 'vitest'
import {
  DEFAULT_STREAM_PAGE_SIZE,
  DEFAULT_STREAM_SCROLLER_SETTINGS,
  entityStreamConfig,
} from './entity-stream-config'

/**
 * Mostly *type* assertions. The design rests on the config literal being
 * checked against its own query — scope keys against real variables, item
 * accessors against the item type `connection` infers — and a type guarantee
 * that is never exercised quietly stops holding.
 */

// a stand-in service; nothing here executes a query
const gql = { watch: () => ({}) } as unknown as EvidenceManagerGQL

describe('entityStreamConfig', () => {
  it('fills defaults: page size, pagination mode, scroller settings', () => {
    const spec = entityStreamConfig({
      query: gql,
      connection: (data) => data?.evidenceItems,
      item: {
        id: (row) => row.id,
        kind: (row) => row.__typename ?? 'unknown',
        summary: (ctx) => `EID${ctx.item.id}`,
      },
    })

    expect(spec.pageSize).toBe(DEFAULT_STREAM_PAGE_SIZE)
    expect(spec.pagination).toBe('infinite')
    expect(spec.scroller).toEqual(DEFAULT_STREAM_SCROLLER_SETTINGS)
    expect(spec.scope).toEqual({})
  })

  it('keeps explicit values and merges partial scroller overrides', () => {
    const spec = entityStreamConfig({
      query: gql,
      connection: (data) => data?.evidenceItems,
      pageSize: 10,
      pagination: 'button',
      scroller: { itemSize: 100 },
      item: {
        id: (row) => row.id,
        kind: () => 'row',
        summary: '',
      },
    })

    expect(spec.pageSize).toBe(10)
    expect(spec.pagination).toBe('button')
    expect(spec.scroller).toEqual({
      ...DEFAULT_STREAM_SCROLLER_SETTINGS,
      itemSize: 100,
    })
  })

  it('accepts a scope naming real query variables', () => {
    const spec = entityStreamConfig({
      query: gql,
      connection: (data) => data?.evidenceItems,
      scope: { molecularProfileId: 12 },
      item: { id: (row) => row.id, kind: () => 'row', summary: '' },
    })

    expect(spec.scope).toEqual({ molecularProfileId: 12 })
  })

  it('rejects a scope key the query does not have', () => {
    entityStreamConfig({
      query: gql,
      connection: (data) => data?.evidenceItems,
      // @ts-expect-error 'molecularProfile' is not a variable of this query;
      // the real one is 'molecularProfileId'. Removing this line must fail
      // the build.
      scope: { molecularProfile: 12 },
      // accessors read nothing: the deliberate error above collapses item
      // inference for this whole call, so a typed `row` parameter would
      // resolve to `unknown` here
      item: { id: () => 0, kind: () => 'row', summary: '' },
    })
  })

  it('types item accessors against the item', () => {
    entityStreamConfig({
      query: gql,
      connection: (data) => data?.evidenceItems,
      item: {
        // @ts-expect-error EvidenceItem has no `summary` field
        id: (row) => row.summary,
        kind: () => 'row',
        summary: '',
      },
    })
  })

  it('types content handlers against the item context', () => {
    entityStreamConfig({
      query: gql,
      connection: (data) => data?.evidenceItems,
      item: {
        id: (row) => row.id,
        kind: () => 'row',
        // @ts-expect-error EvidenceItem has no `summary` field — the
        // handler's context carries the inferred item type
        summary: (ctx) => ctx.item.summary,
      },
    })
  })

  it('types the counts accessor against the connection', () => {
    const spec = entityStreamConfig({
      query: gql,
      connection: (data) => data?.evidenceItems,
      counts: (connection) => ({
        total: connection.totalCount,
        rows: connection.edges.length,
      }),
      item: { id: (row) => row.id, kind: () => 'row', summary: '' },
    })

    expect(spec.counts).toBeDefined()
  })

  /**
   * An expandable kind's detail region renders only the component its
   * `detail.load` resolves, so expandable-without-detail is a region that
   * expands to empty space — refused loudly in dev mode.
   */
  it('throws in dev mode on an expandable kind with no detail component', () => {
    expect(() =>
      entityStreamConfig({
        query: gql,
        connection: (data) => data?.evidenceItems,
        item: {
          id: (row) => row.id,
          kind: () => 'row',
          summary: '',
          kinds: {
            row: { expandable: true },
          },
        },
      })
    ).toThrowError(/expandable kind\(s\) row/)
  })

  it('accepts an expandable kind that declares its detail component', () => {
    const spec = entityStreamConfig({
      query: gql,
      connection: (data) => data?.evidenceItems,
      item: {
        id: (row) => row.id,
        kind: () => 'row',
        summary: '',
        kinds: {
          row: {
            expandable: (row) => row.id > 0,
            detail: {
              load: () => Promise.resolve(class {} as never),
            },
          },
        },
      },
    })

    expect(spec.item.kinds?.['row']?.detail).toBeDefined()
  })
})

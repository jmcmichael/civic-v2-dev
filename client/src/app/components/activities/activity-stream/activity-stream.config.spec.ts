import { EventFeedMode } from '@app/generated/civic.apollo.types'
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus'
import { describe, expect, it } from 'vitest'
import {
  ACTIVITY_DETAIL_REGISTRY,
  SIMPLE_ACTIVITY_TYPES,
} from './activity-detail.registry'
import { CvcActivityStream } from './activity-stream.component'
import {
  activityStreamConfig,
  streamDefaultSettings,
} from './activity-stream.config'
import {
  connectionToStreamCounts,
  scopeToVariables,
} from './activity-stream.functions'
import { ActivityStreamGQL } from './activity-stream.query.gql.generated'
import { ActivityStreamConnection } from './activity-stream.types'
import { CvcActivityStreamDetail } from './detail/activity-stream-detail.component'
import { CvcActivitySubjectTag } from './item/activity-subject-tag.component'

// a stand-in service; nothing here executes a query
const gql = { watch: () => ({}) } as unknown as ActivityStreamGQL

describe('activityStreamConfig', () => {
  it('assembles an infinite stream with the default page size', () => {
    const spec = activityStreamConfig({ query: gql, scope: {} })

    expect(spec.pagination).toBe('infinite')
    expect(spec.pageSize).toBe(streamDefaultSettings.first)
  })

  it('identifies and discriminates items by id and typename', () => {
    const spec = activityStreamConfig({ query: gql, scope: {} })
    const node = {
      id: 42,
      __typename: 'CommentActivity',
    } as Parameters<typeof spec.item.id>[0]

    expect(spec.item.id(node)).toBe(42)
    expect(spec.item.kind(node)).toBe('CommentActivity')
    expect(spec.item.summary).toBeInstanceOf(PolymorpheusComponent)
    expect(spec.item.extra).toBeInstanceOf(PolymorpheusComponent)
  })

  it('makes every registered non-simple kind expandable with a detail loader', () => {
    const spec = activityStreamConfig({ query: gql, scope: {} })
    const kinds = spec.item.kinds ?? {}

    for (const typename of Object.keys(ACTIVITY_DETAIL_REGISTRY)) {
      if (SIMPLE_ACTIVITY_TYPES.has(typename)) {
        expect(kinds[typename]).toBeUndefined()
      } else {
        expect(kinds[typename]?.expandable).toBe(true)
        expect(kinds[typename]?.detail?.load).toBeTypeOf('function')
      }
    }
  })

  it('phrases the empty state for the scope mode', () => {
    const spec = activityStreamConfig({ query: gql, scope: {} })
    const empty = spec.emptyState as (ctx: {
      scope: Record<string, unknown>
    }) => string

    expect(empty({ scope: { mode: EventFeedMode.Subject } })).toContain(
      'for this subject'
    )
    expect(empty({ scope: { mode: EventFeedMode.Unscoped } })).toBe(
      'No Activities found that match specified filters.'
    )
  })
})

describe('scopeToVariables', () => {
  it('sends only the mode when unscoped', () => {
    expect(scopeToVariables({ mode: EventFeedMode.Unscoped })).toEqual({
      mode: EventFeedMode.Unscoped,
    })
  })

  it('wraps single-subject scopes in the list the query takes', () => {
    expect(
      scopeToVariables({
        mode: EventFeedMode.Organization,
        organizationId: 5,
      })
    ).toEqual({ mode: EventFeedMode.Organization, organizationId: [5] })
  })
})

describe('connectionToStreamCounts', () => {
  it('maps the connection count fields onto stream counts', () => {
    const connection = {
      totalCount: 10,
      unfilteredCount: 40,
      pageCount: 2,
      edges: [{}, {}],
    } as ActivityStreamConnection

    expect(connectionToStreamCounts(connection)).toEqual({
      total: 10,
      unfiltered: 40,
      page: 2,
      rows: 2,
    })
  })
})

describe('facade compilation surface', () => {
  it('exports the facade, detail host and subject tag components', () => {
    expect(CvcActivityStream).toBeDefined()
    expect(CvcActivityStreamDetail).toBeDefined()
    expect(CvcActivitySubjectTag).toBeDefined()
  })
})

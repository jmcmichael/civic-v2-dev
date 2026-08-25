import { TestBed } from '@angular/core/testing'
import { EventFeedMode } from '@app/generated/civic.apollo.types'
import { CvcPageInfo } from '@app/tables/connection.types'
import { describeEntityStreamContract } from '@app/testing/entity-stream.harness'
import { describe } from 'vitest'
import { ActivityStreamState } from './activity-stream-state'
import {
  activityStreamConfig,
  streamDefaultFilters,
  streamDefaultSettings,
} from './activity-stream.config'
import {
  scopeToVariables,
  streamFilterVariables,
} from './activity-stream.functions'
import { ActivityStreamGQL } from './activity-stream.query.gql.generated'
import { ActivityStreamNode } from './activity-stream.types'

/**
 * The stream contract run through the activity facade's real spec and its
 * real variable builders — where a filter wired to the wrong variable, or a
 * scope a filter could override, would actually show on the wire.
 */

const items: [ActivityStreamNode, ActivityStreamNode] = [
  {
    __typename: 'SubmitEvidenceItemActivity',
    id: 1,
    verbiage: 'submitted',
    createdAt: '2026-08-01T00:00:00Z',
    user: { __typename: 'User', id: 10, displayName: 'jdoe', role: 'CURATOR' },
    organization: { __typename: 'Organization', id: 3, name: 'WashU' },
    subject: {
      __typename: 'EvidenceItem',
      id: 99,
      name: 'EID99',
      link: '/evidence/99',
    },
  } as unknown as ActivityStreamNode,
  {
    __typename: 'CommentActivity',
    id: 2,
    verbiage: 'commented on',
    createdAt: '2026-08-02T00:00:00Z',
    user: { __typename: 'User', id: 11, displayName: 'asmith', role: 'EDITOR' },
    organization: null,
    comment: {
      __typename: 'Comment',
      id: 7,
      name: 'comment on EID99',
      link: '/evidence/99',
    },
    subject: {
      __typename: 'EvidenceItem',
      id: 99,
      name: 'EID99',
      link: '/evidence/99',
    },
  } as unknown as ActivityStreamNode,
]

function connection(
  nodes: ReadonlyArray<ActivityStreamNode>,
  pageInfo: CvcPageInfo
): Record<string, unknown> {
  return {
    activities: {
      __typename: 'ActivityInterfaceConnection',
      pageInfo: { __typename: 'PageInfo', ...pageInfo },
      pageCount: 1,
      totalCount: nodes.length,
      unfilteredCount: 5,
      edges: nodes.map((node, index) => ({
        __typename: 'ActivityInterfaceEdge',
        cursor: String.fromCharCode(97 + index),
        node,
      })),
    },
  }
}

describe('cvc-activity-stream contract', () => {
  describeEntityStreamContract<ActivityStreamNode>({
    spec: () =>
      activityStreamConfig({
        query: TestBed.inject(ActivityStreamGQL),
        title: 'Contract Stream',
        scope: scopeToVariables({ mode: EventFeedMode.Unscoped }),
      }),
    operationName: 'ActivityStream',
    items,
    connection,
    sampleFilters: streamFilterVariables({
      filters: streamDefaultFilters,
      settings: streamDefaultSettings,
      showFilters: false,
    }),
    // the facade component provides this around the stream; the contract
    // mounts the stream bare
    providers: [ActivityStreamState],
  })
})

import { TestBed } from '@angular/core/testing'
import { ModeratedEntities, RevisionStatus } from '@app/generated/civic.apollo.types'
import { CvcPageInfo } from '@app/tables/connection.types'
import { describeEntityStreamContract } from '@app/testing/entity-stream.harness'
import { describe } from 'vitest'
import { RevisionStreamState } from './revision-stream-state'
import { revisionStreamConfig } from './revision-stream.config'
import { RevisionStreamGQL } from './revision-stream.query.gql.generated'
import { RevisionStreamNode } from './revision-stream.types'

/**
 * The stream contract run through the revision facade's real spec —
 * where a filter wired to the wrong variable, or a subject a filter
 * could override, would actually show on the wire. Successor to the
 * legacy list's wire-level characterization suite.
 */

function revision(id: number, name: string): RevisionStreamNode {
  return {
    __typename: 'Revision',
    id,
    revisionSetId: 100,
    createdAt: '2026-08-01T00:00:00Z',
    fieldName: name.toLowerCase(),
    currentValue: 'old',
    suggestedValue: 'new',
    status: 'NEW',
    linkoutData: {
      __typename: 'LinkoutData',
      name,
      diffValue: { __typename: 'ScalarFieldDiff', left: 'old', right: 'new' },
    },
    creationActivity: null,
    resolutionActivity: null,
  } as unknown as RevisionStreamNode
}

const items: [RevisionStreamNode, RevisionStreamNode] = [
  revision(1, 'Description'),
  revision(2, 'Significance'),
]

function connection(
  nodes: ReadonlyArray<RevisionStreamNode>,
  pageInfo: CvcPageInfo
): Record<string, unknown> {
  return {
    revisions: {
      __typename: 'RevisionConnection',
      totalCount: nodes.length,
      unfilteredCountForSubject: 5,
      uniqueRevisors: [],
      uniqueResolvers: [],
      revisedFieldNames: [],
      pageInfo: { __typename: 'PageInfo', ...pageInfo },
      edges: nodes.map((node, index) => ({
        __typename: 'RevisionEdge',
        cursor: String.fromCharCode(97 + index),
        node,
      })),
    },
  }
}

describe('cvc-revision-stream contract', () => {
  describeEntityStreamContract<RevisionStreamNode>({
    spec: () =>
      revisionStreamConfig({
        query: TestBed.inject(RevisionStreamGQL),
        scope: {
          subject: { id: 42, entityType: ModeratedEntities.Variant },
        },
        viewer: { signedIn: true, isCurator: false, id: 99 },
        unfilteredCount: () => 5,
      }),
    operationName: 'RevisionStream',
    items,
    connection,
    // the facade's default filter variables: moderation opens on NEW
    sampleFilters: {
      status: RevisionStatus.New,
      fieldName: undefined,
      originatingUserId: undefined,
      resolvingUserId: undefined,
      revisionSetId: undefined,
    },
    // the facade component provides this around the stream; the contract
    // mounts the stream bare
    providers: [RevisionStreamState],
  })
})

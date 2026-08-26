import { Maybe } from '@app/generated/civic.apollo.types'
import {
  EntityStreamSpec,
  entityStreamConfig,
} from '@app/streams/entity-stream-config'
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus'
import { CvcRevisionItemContent } from './item/revision-item-content.component'
import { CvcRevisionItemExtra } from './item/revision-item-extra.component'
import { CvcRevisionItemSummary } from './item/revision-item-summary.component'
import { revisionSelectionState } from './revision-moderation'
import { RevisionStreamGQL } from './revision-stream.query.gql.generated'
import {
  RevisionStreamConnection,
  RevisionStreamNode,
  RevisionStreamScope,
} from './revision-stream.types'

/** the legacy page size, kept — ten eagerly-rendered diffs is a screenful */
export const REVISION_STREAM_PAGE_SIZE = 10

/** what selection gating needs to know about the viewer */
export interface RevisionStreamViewer {
  signedIn: boolean
  isCurator: boolean
  id: Maybe<number>
}

/**
 * The revision stream's spec: revision renderers in the summary, header
 * extra and footer slots, `'button'` pagination (every diff stays
 * rendered and interactive — no recycling), and the three-state selection
 * gating from `revisionSelectionState`, closed over the viewer — the
 * facade rebuilds the spec when the viewer changes.
 */
export function revisionStreamConfig(options: {
  query: RevisionStreamGQL
  title?: string
  scope: RevisionStreamScope
  viewer: RevisionStreamViewer
}): EntityStreamSpec<RevisionStreamNode> {
  const { viewer } = options
  const selection = (revision: RevisionStreamNode) =>
    revisionSelectionState({
      status: revision.status,
      signedIn: viewer.signedIn,
      isCurator: viewer.isCurator,
      viewerId: viewer.id,
      revisorId: revision.creationActivity?.user?.id,
    })
  return entityStreamConfig({
    query: options.query,
    title: options.title ?? 'Revisions',
    pageSize: REVISION_STREAM_PAGE_SIZE,
    scope: options.scope,
    connection: (data) => data?.revisions,
    counts: (connection) => {
      const revisions = connection as RevisionStreamConnection
      return {
        total: revisions.totalCount,
        rows: revisions.edges.length,
        unfiltered: revisions.unfilteredCountForSubject ?? undefined,
      }
    },
    pagination: 'button',
    item: {
      id: (revision) => revision.id,
      kind: (revision) => revision.fieldName,
      summary: new PolymorpheusComponent(CvcRevisionItemSummary),
      extra: new PolymorpheusComponent(CvcRevisionItemExtra),
      footer: new PolymorpheusComponent(CvcRevisionItemContent),
      selectable: (revision) => selection(revision).kind === 'enabled',
      selectionVisible: (revision) => selection(revision).kind !== 'hidden',
      selectTooltip: (revision) => {
        const state = selection(revision)
        return state.kind === 'hidden' ? undefined : state.tooltip
      },
    },
  })
}

import {
  DateSortColumns,
  EventFeedMode,
  SortDirection,
} from '@app/generated/civic.apollo.types'
import {
  EntityStreamSpec,
  entityStreamConfig,
} from '@app/streams/entity-stream-config'
import {
  CvcStreamEmptyContext,
  CvcStreamItemKindSpec,
} from '@app/streams/entity-stream.types'
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus'
import {
  ACTIVITY_DETAIL_REGISTRY,
  SIMPLE_ACTIVITY_TYPES,
} from './activity-detail.registry'
import {
  STREAM_SORT_COLUMNS,
  STREAM_SORT_DIRECTIONS,
  connectionToStreamCounts,
} from './activity-stream.functions'
import {
  ActivityStreamQueryVariables,
  ActivityStreamGQL,
} from './activity-stream.query.gql.generated'
import {
  ActivityStreamConnection,
  ActivityStreamFilterOptions,
  ActivityStreamFilters,
  ActivityStreamNode,
  ActivityStreamScope,
  ActivityStreamSettings,
} from './activity-stream.types'
import { CvcActivityItemDate } from './item/activity-item-date.component'
import { CvcActivityItemSummary } from './item/activity-item-summary.component'

export const streamDefaultSettings: ActivityStreamSettings = {
  first: 50,
  includeAutomatedEvents: false,
  showOrganization: true,
}

export const streamDefaultFilters: ActivityStreamFilters = {
  organizationId: [],
  includeSubgroups: false,
  userId: [],
  activityType: [],
  subjectType: [],
  linkedApprovalId: null,
  occurredAfter: null,
  occurredBefore: null,
  sortByColumn: DateSortColumns.Created,
  sortByDirection: SortDirection.Desc,
}

export const streamDefaultScope: ActivityStreamScope = {
  mode: EventFeedMode.Unscoped,
}

/** what the filter panel offers before the first connection arrives */
export const streamFilterOptionDefaults: ActivityStreamFilterOptions = {
  uniqueParticipants: [],
  participatingOrganizations: [],
  activityTypes: [],
  subjectTypes: [],
  sortColumns: STREAM_SORT_COLUMNS,
  sortDirections: STREAM_SORT_DIRECTIONS,
}

/** the empty-state copy, phrased for what the stream is scoped to */
function streamEmptyMessage(context: CvcStreamEmptyContext): string {
  const mode = context.scope['mode']
  const scoped =
    mode === EventFeedMode.Subject
      ? ' for this subject'
      : mode === EventFeedMode.User
        ? ' for this contributor'
        : mode === EventFeedMode.Organization
          ? ' for this organization'
          : ''
  return `No Activities found${scoped} that match specified filters.`
}

/**
 * The kind registry as the stream spec consumes it: every activity type
 * with a registered detail renderer — and not in the simple set — expands
 * into the shared detail host, which lazily imports the renderer itself.
 * Typenames outside the registry render unexpandable summary lines.
 */
function expandableKinds(): Record<
  string,
  CvcStreamItemKindSpec<ActivityStreamNode>
> {
  const kinds: Record<string, CvcStreamItemKindSpec<ActivityStreamNode>> = {}
  for (const typename of Object.keys(ACTIVITY_DETAIL_REGISTRY)) {
    if (SIMPLE_ACTIVITY_TYPES.has(typename)) continue
    kinds[typename] = {
      expandable: true,
      detail: {
        load: () =>
          import('./detail/activity-stream-detail.component').then(
            (m) => m.CvcActivityStreamDetail
          ),
      },
    }
  }
  return kinds
}

/**
 * The activity stream's spec: summary/date renderers, the expandable-kind
 * registry, counts and the scoped empty state, over the summary-only
 * ActivityStream document.
 *
 * @param options.scope the always-sent scope variables; see `scopeToVariables`
 */
export function activityStreamConfig(options: {
  query: ActivityStreamGQL
  title?: string
  scope: Partial<ActivityStreamQueryVariables>
  pageSize?: number
}): EntityStreamSpec<ActivityStreamNode> {
  return entityStreamConfig({
    query: options.query,
    title: options.title,
    pageSize: options.pageSize ?? streamDefaultSettings.first,
    scope: options.scope,
    connection: (data) => data?.activities,
    counts: (connection) =>
      connectionToStreamCounts(connection as ActivityStreamConnection),
    emptyState: streamEmptyMessage,
    pagination: 'infinite',
    item: {
      id: (activity) => activity.id,
      kind: (activity) => activity.__typename,
      summary: new PolymorpheusComponent(CvcActivityItemSummary),
      extra: new PolymorpheusComponent(CvcActivityItemDate),
      kinds: expandableKinds(),
    },
  })
}

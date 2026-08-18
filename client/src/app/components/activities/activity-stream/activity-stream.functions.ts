import { CvcStreamCounts } from '@app/streams/entity-stream.types'
import {
  DateSortColumns,
  EventFeedMode,
  SortDirection,
} from '@app/generated/civic.apollo.types'
import { ActivityStreamQueryVariables } from './activity-stream.query.gql.generated'
import {
  ActivityStreamConnection,
  ActivityStreamFilterOptions,
  ActivityStreamFilters,
  ActivityStreamScope,
  ActivityStreamSettings,
} from './activity-stream.types'

/** the sort columns the panel offers; the connection reports no options for these */
export const STREAM_SORT_COLUMNS: DateSortColumns[] = [
  DateSortColumns.Created,
  DateSortColumns.LastModified,
]

/** the sort directions the panel offers */
export const STREAM_SORT_DIRECTIONS: SortDirection[] = [
  SortDirection.Desc,
  SortDirection.Asc,
]

/**
 * The scope's always-sent query variables — what the stream config's `scope`
 * carries, so no filter can widen what the host scoped the stream to.
 */
export function scopeToVariables(
  scope: ActivityStreamScope
): Partial<ActivityStreamQueryVariables> {
  return {
    mode: scope.mode,
    ...(scope.mode === EventFeedMode.Subject ? { subject: [scope.subject] } : {}),
    ...(scope.mode === EventFeedMode.Organization
      ? { organizationId: [scope.organizationId] }
      : {}),
    ...(scope.mode === EventFeedMode.User ? { userId: [scope.userId] } : {}),
  }
}

/**
 * Filter control values as a query-variables patch: empty selections become
 * `undefined` (dropped from the request), dates become ISO strings, and the
 * two sort controls compose into the query's `sortBy`.
 */
export function filtersToVariables(
  filters: ActivityStreamFilters
): Partial<ActivityStreamQueryVariables> {
  return {
    activityType:
      filters.activityType.length > 0 ? filters.activityType : undefined,
    organizationId:
      filters.organizationId.length > 0 ? filters.organizationId : undefined,
    includeSubgroups: filters.includeSubgroups,
    subjectType:
      filters.subjectType.length > 0 ? filters.subjectType : undefined,
    userId: filters.userId.length > 0 ? filters.userId : undefined,
    linkedApprovalId: filters.linkedApprovalId ?? undefined,
    occurredAfter: filters.occurredAfter
      ? filters.occurredAfter.toISOString()
      : undefined,
    occurredBefore: filters.occurredBefore
      ? filters.occurredBefore.toISOString()
      : undefined,
    sortBy: {
      column: filters.sortByColumn,
      direction: filters.sortByDirection,
    },
  }
}

/**
 * Settings as a query-variables patch. `first` is not here: page size
 * travels as the spec's `pageSize`, so scroll-driven pages request the same
 * count as the first one.
 */
export function settingsToVariables(
  settings: ActivityStreamSettings
): Partial<ActivityStreamQueryVariables> {
  return {
    includeAutomatedEvents: settings.includeAutomatedEvents,
  }
}

/**
 * The complete filters patch the facade binds to the stream: filters,
 * settings, and whether the document should include the filter-option
 * fields. Scope variables travel separately, in the spec's `scope`.
 */
export function streamFilterVariables(params: {
  filters: ActivityStreamFilters
  settings: ActivityStreamSettings
  showFilters: boolean
}): Record<string, unknown> {
  return {
    ...filtersToVariables(params.filters),
    ...settingsToVariables(params.settings),
    showFilters: params.showFilters,
  }
}

/** the filter panel's option lists, from the connection's option fields */
export function connectionToFilterOptions(
  connection: ActivityStreamConnection
): ActivityStreamFilterOptions {
  return {
    uniqueParticipants: connection.uniqueParticipants ?? [],
    participatingOrganizations: connection.participatingOrganizations ?? [],
    activityTypes: connection.activityTypes ?? [],
    subjectTypes: connection.subjectTypes ?? [],
    sortColumns: STREAM_SORT_COLUMNS,
    sortDirections: STREAM_SORT_DIRECTIONS,
  }
}

/** header counts, from the connection's count fields */
export function connectionToStreamCounts(
  connection: ActivityStreamConnection
): CvcStreamCounts {
  return {
    total: connection.totalCount,
    unfiltered: connection.unfilteredCount,
    page: connection.pageCount,
    rows: connection.edges.length,
  }
}

// disable today and past dates for the 'After' date picker
function disabledBeforeToday(current: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return current.getTime() >= today.getTime()
}

// disable tomorrow and future dates for the 'Before' date picker
function disabledBeforeTomorrow(current: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  return current.getTime() > tomorrow.getTime()
}

/** date-picker disabled-date predicates for the filter panel's range pickers */
export const disableDates = {
  beforeToday: disabledBeforeToday,
  beforeTomorrow: disabledBeforeTomorrow,
}

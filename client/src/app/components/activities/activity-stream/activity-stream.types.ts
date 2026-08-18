import {
  ActivitySubjectInput,
  ActivityTypeInput,
  DateSortColumns,
  EventFeedMode,
  SortDirection,
  SubscribableQueryInput,
} from '@app/generated/civic.apollo.types'
import { ActivityStreamQuery } from './activity-stream.query.gql.generated'

/** the stream query's connection, as generated */
export type ActivityStreamConnection = ActivityStreamQuery['activities']

/** one activity as the stream's connection carries it */
export type ActivityStreamNode = NonNullable<
  ActivityStreamConnection['edges'][number]['node']
>

/** a participant as the connection's filter-option field shapes one */
export type ActivityStreamParticipant = NonNullable<
  ActivityStreamConnection['uniqueParticipants']
>[number]

/** an organization as the connection's filter-option field shapes one */
export type ActivityStreamOrganization = NonNullable<
  ActivityStreamConnection['participatingOrganizations']
>[number]

/**
 * User-editable stream options that are not filters: page sizing, whether
 * automated events appear, and whether items show their organization tag.
 */
export type ActivityStreamSettings = {
  /** items per page */
  first: number
  includeAutomatedEvents: boolean
  showOrganization: boolean
}

/** the filter panel's control values */
export type ActivityStreamFilters = {
  activityType: ActivityTypeInput[]
  organizationId: number[]
  includeSubgroups: boolean
  subjectType: ActivitySubjectInput[]
  userId: number[]
  linkedApprovalId: number | null
  occurredAfter: Date | null
  occurredBefore: Date | null
  sortByColumn: DateSortColumns
  sortByDirection: SortDirection
}

/** the option lists the filter panel's controls offer, from the connection */
export type ActivityStreamFilterOptions = {
  activityTypes: ActivityTypeInput[]
  uniqueParticipants: ActivityStreamParticipant[]
  participatingOrganizations: ActivityStreamOrganization[]
  subjectTypes: ActivitySubjectInput[]
  sortColumns: DateSortColumns[]
  sortDirections: SortDirection[]
}

// Scope types configure the query and UI per EventFeedMode: each mode fixes
// its own subject variables and rules the others out, so a scope literal
// cannot mix modes.

type ScopeOrganization = {
  mode: EventFeedMode.Organization
  organizationId: number
  subject?: never
  userId?: never
}

type ScopeSubject = {
  mode: EventFeedMode.Subject
  subject: SubscribableQueryInput
  organizationId?: never
  userId?: never
}

type ScopeUser = {
  mode: EventFeedMode.User
  userId: number
  organizationId?: never
  subject?: never
}

type ScopeUnscoped = {
  mode: EventFeedMode.Unscoped
  organizationId?: never
  userId?: never
  subject?: never
}

/** what a host scopes the stream to; see the per-mode members */
export type ActivityStreamScope =
  | ScopeOrganization
  | ScopeSubject
  | ScopeUser
  | ScopeUnscoped

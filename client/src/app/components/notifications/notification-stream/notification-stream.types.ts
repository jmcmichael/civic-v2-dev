import {
  EventAction,
  Maybe,
  NotificationReason,
  SubscribableInput,
} from '@app/generated/civic.apollo.types'
import { NotificationStreamQuery } from './notification-stream.query.gql.generated'

/** the notifications connection as the stream document selects it */
export type NotificationStreamConnection =
  NotificationStreamQuery['notifications']

/** one notification item */
export type NotificationStreamNode = NonNullable<
  NotificationStreamConnection['edges'][number]['node']
>

/**
 * The facade's user-editable filters — one member per sidebar facet plus
 * the unread/all toggle. `undefined` clears a facet; `includeRead` is
 * always sent (the server defaults it false, but an explicit value keeps
 * the wire honest).
 */
export interface NotificationStreamFilters {
  notificationReason: Maybe<NotificationReason>
  eventType: Maybe<EventAction>
  originatingObject: Maybe<SubscribableInput>
  originatingUserId: Maybe<number>
  organizationId: Maybe<number>
  includeRead: boolean
}

/** the triage view: unread only, nothing else filtered */
export const notificationStreamDefaultFilters: NotificationStreamFilters = {
  notificationReason: undefined,
  eventType: undefined,
  originatingObject: undefined,
  originatingUserId: undefined,
  organizationId: undefined,
  includeRead: false,
}

/** a reason facet option (static: mentioned vs subscribed) */
export interface SelectableNotificationReason {
  id: number
  type: NotificationReason
  iconName: string
  displayName: string
}

/** a subject facet option, from the connection's notificationSubjects */
export interface SelectableNotificationSubject {
  /** typename:id — subjects span entity types, so a bare id cannot key them */
  id: string
  subjectWithCount: NotificationStreamConnection['notificationSubjects'][number]
}

/** an event-action facet option */
export interface SelectableAction {
  id: EventAction
}

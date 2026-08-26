import {
  EntityStreamSpec,
  entityStreamConfig,
} from '@app/streams/entity-stream-config'
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus'
import { CvcNotificationItemExtra } from './item/notification-item-extra.component'
import { CvcNotificationItemSummary } from './item/notification-item-summary.component'
import { NotificationStreamGQL } from './notification-stream.query.gql.generated'
import {
  NotificationStreamConnection,
  NotificationStreamNode,
} from './notification-stream.types'

/**
 * Explicit, unlike the legacy page, which sent no `first` and silently
 * took the schema's `default_max_page_size` (100) — a hundred eagerly
 * rendered event rows per page. Deliberately smaller; one reviewable
 * constant.
 */
export const NOTIFICATION_STREAM_PAGE_SIZE = 25

/**
 * The notification stream's spec: reason-dot + event summary, the action
 * buttons in the header extra, `'button'` pagination, every item
 * selectable (bulk triage is the point). No scope: the server resolves
 * notifications for the signed-in viewer, so there is nothing a filter
 * could widen.
 */
export function notificationStreamConfig(options: {
  query: NotificationStreamGQL
  title?: string
  /** live read of the unread/all toggle, for the empty-state copy */
  unreadOnly: () => boolean
}): EntityStreamSpec<NotificationStreamNode> {
  return entityStreamConfig({
    query: options.query,
    title: options.title ?? 'Notifications',
    pageSize: NOTIFICATION_STREAM_PAGE_SIZE,
    connection: (data) => data?.notifications,
    counts: (connection) => {
      const notifications = connection as NotificationStreamConnection
      return {
        total: notifications.totalCount,
        rows: notifications.edges.length,
        unfiltered: notifications.unreadCount,
      }
    },
    emptyState: () =>
      options.unreadOnly()
        ? 'No unread notifications — all caught up.'
        : 'No notifications match the current filters.',
    pagination: 'button',
    item: {
      id: (notification) => notification.id,
      kind: (notification) => notification.type,
      summary: new PolymorpheusComponent(CvcNotificationItemSummary),
      extra: new PolymorpheusComponent(CvcNotificationItemExtra),
      selectable: () => true,
    },
  })
}

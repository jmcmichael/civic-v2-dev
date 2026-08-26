import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcEventTimelineItemModule } from '@app/components/events/event-timeline-item/event-timeline-item-module'
import { CvcStreamItemContext } from '@app/streams/entity-stream.types'
import { injectContext } from '@taiga-ui/polymorpheus'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NotificationStreamNode } from '../notification-stream.types'

/**
 * One notification's summary line: the reason icon — twotone while
 * unread, outline once seen (the legacy timeline's dot, inlined) — and
 * the event rendered by the shared timeline item.
 */
@Component({
  selector: 'cvc-notification-item-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzIconModule, CvcEventTimelineItemModule],
  styles: `
    :host {
      display: inline-flex;
      align-items: baseline;
      gap: 8px;
    }
  `,
  template: `
    <span
      nz-icon
      [nzType]="notification.type === 'SUBSCRIPTION' ? 'book' : 'notification'"
      [nzTheme]="notification.seen ? 'outline' : 'twotone'"
      [attr.data-testid]="
        notification.seen ? 'notification-seen' : 'notification-unread'
      "></span>
    <cvc-event-timeline-item
      [event]="notification.event"></cvc-event-timeline-item>
  `,
})
export class CvcNotificationItemSummary {
  protected readonly context =
    injectContext<CvcStreamItemContext<NotificationStreamNode>>()

  protected get notification(): NotificationStreamNode {
    return this.context.item
  }
}

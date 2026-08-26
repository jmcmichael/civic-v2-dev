import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { CvcStreamItemContext } from '@app/streams/entity-stream.types'
import { injectContext } from '@taiga-ui/polymorpheus'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzSpaceModule } from 'ng-zorro-antd/space'
import { NzTooltipModule } from 'ng-zorro-antd/tooltip'
import { NotificationStreamState } from '../notification-stream-state'
import { NotificationStreamNode } from '../notification-stream.types'

/**
 * The header's trailing actions: mark read/unread and unsubscribe.
 * Always-visible circle buttons — real tap targets, nothing
 * hover-revealed, so the row works on touch as well as pointer.
 */
@Component({
  selector: 'cvc-notification-item-extra',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzButtonModule, NzIconModule, NzSpaceModule, NzTooltipModule],
  template: `
    <nz-space
      nzSize="small"
      (click)="$event.stopPropagation()">
      @if (notification.seen) {
        <button
          *nzSpaceItem
          nz-tooltip
          nzTooltipTitle="Mark as unread."
          nz-button
          nzType="default"
          nzShape="circle"
          data-testid="notification-mark-unread"
          (click)="state.markUnread([notification.id])">
          <span
            nz-icon
            nzType="undo"></span>
        </button>
      } @else {
        <button
          *nzSpaceItem
          nz-tooltip
          nzTooltipTitle="Mark as read."
          nz-button
          nzType="default"
          nzShape="circle"
          data-testid="notification-mark-read"
          (click)="state.markRead([notification.id])">
          <span
            nz-icon
            nzType="check"></span>
        </button>
      }
      @if (notification.subscription; as subscription) {
        <button
          *nzSpaceItem
          nz-tooltip
          nzTooltipTitle="You received this notification because you are subscribed to {{
            subscription.subscribable.name
          }}. Click to unsubscribe."
          nz-button
          nzType="default"
          nzShape="circle"
          data-testid="notification-unsubscribe"
          (click)="
            state.unsubscribe(
              subscription.subscribable.id,
              subscription.subscribable.__typename
            )
          ">
          <span
            nz-icon
            nzType="bell"></span>
        </button>
      } @else {
        <button
          *nzSpaceItem
          nz-tooltip
          nzTooltipTitle="You are no longer subscribed to the entity that triggered this notification."
          nz-button
          nzType="default"
          nzShape="circle"
          disabled>
          <span
            nz-icon
            nzType="bell"></span>
        </button>
      }
    </nz-space>
  `,
})
export class CvcNotificationItemExtra {
  protected readonly context =
    injectContext<CvcStreamItemContext<NotificationStreamNode>>()
  protected readonly state = inject(NotificationStreamState)

  protected get notification(): NotificationStreamNode {
    return this.context.item
  }
}

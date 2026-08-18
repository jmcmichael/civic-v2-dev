import { Component, ChangeDetectionStrategy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ActivityStreamScope } from '@app/components/activities/activity-stream/activity-stream.types'
import { EventFeedMode } from '@app/generated/civic.apollo.types'

@Component({
  selector: 'cvc-users-events',
  templateUrl: './users-events.component.html',
  styleUrls: ['./users-events.component.less'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UsersEventsComponent {
  feedScope: ActivityStreamScope

  constructor(private route: ActivatedRoute) {
    this.feedScope = {
      mode: EventFeedMode.User,
      userId: +this.route.snapshot.params['userId'],
    }
  }
}

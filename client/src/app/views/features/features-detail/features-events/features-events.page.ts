import { Component, ChangeDetectionStrategy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ActivityStreamScope } from '@app/components/activities/activity-stream/activity-stream.types'
import {
  EventFeedMode,
  SubscribableEntities,
} from '@app/generated/civic.apollo.types'

@Component({
  selector: 'cvc-features-events',
  templateUrl: './features-events.page.html',
  styleUrls: ['./features-events.page.less'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class FeaturesEventsPage {
  feedScope: ActivityStreamScope

  constructor(private route: ActivatedRoute) {
    this.feedScope = {
      mode: EventFeedMode.Subject,
      subject: {
        id: +this.route.snapshot.params['featureId'],
        entityType: SubscribableEntities.Feature,
      },
    }
  }
}

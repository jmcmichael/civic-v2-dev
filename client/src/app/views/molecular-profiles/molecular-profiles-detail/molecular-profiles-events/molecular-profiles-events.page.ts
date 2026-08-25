import { Component, ChangeDetectionStrategy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ActivityStreamScope } from '@app/components/activities/activity-stream/activity-stream.types'
import {
  EventFeedMode,
  SubscribableEntities,
} from '@app/generated/civic.apollo.types'

@Component({
  selector: 'cvc-molecular-profiles-events',
  templateUrl: './molecular-profiles-events.page.html',
  styleUrls: ['./molecular-profiles-events.page.less'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class MolecularProfilesEventsPage {
  feedScope: ActivityStreamScope

  constructor(private route: ActivatedRoute) {
    this.feedScope = {
      mode: EventFeedMode.Subject,
      subject: {
        id: +this.route.snapshot.params['molecularProfileId'],
        entityType: SubscribableEntities.MolecularProfile,
      },
    }
  }
}

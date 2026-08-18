import { Component, ChangeDetectionStrategy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { EventFeedMode } from '@app/generated/civic.apollo.types'
import {
  ActivityStreamScope,
  ActivityStreamSettings,
} from '@app/components/activities/activity-stream/activity-stream.types'
import { streamDefaultSettings } from '@app/components/activities/activity-stream/activity-stream.config'
import { ActivityStreamFilters } from '../../../components/activities/activity-stream/activity-stream.types'
import { streamDefaultFilters } from '../../../components/activities/activity-stream/activity-stream.config'

@Component({
  selector: 'cvc-organizations-events',
  templateUrl: './organizations-events.component.html',
  styleUrls: ['./organizations-events.component.less'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class OrganizationsEventsComponent {
  feedScope: ActivityStreamScope
  feedSettings: ActivityStreamSettings
  feedFilters: ActivityStreamFilters

  constructor(private route: ActivatedRoute) {
    this.feedSettings = {
      ...streamDefaultSettings,
      showOrganization: false,
    }
    this.feedFilters = {
      ...streamDefaultFilters,
      includeSubgroups:
        this.route.snapshot.queryParams['includeSubgroups'] === 'true'
          ? true
          : false,
    }
    this.feedScope = {
      mode: EventFeedMode.Organization,
      organizationId: +this.route.snapshot.params['organizationId'],
    }
  }
}

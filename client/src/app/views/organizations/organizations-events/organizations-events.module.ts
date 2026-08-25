import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { OrganizationsEventsComponent } from './organizations-events.component'
import { CvcActivityStream } from '@app/components/activities/activity-stream/activity-stream.component'

@NgModule({
  declarations: [OrganizationsEventsComponent],
  imports: [CommonModule, CvcActivityStream],
})
export class OrganizationsEventsModule {}

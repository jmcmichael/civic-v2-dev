import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { UsersEventsComponent } from './users-events.component'
import { CvcActivityStream } from '@app/components/activities/activity-stream/activity-stream.component'

@NgModule({
  declarations: [UsersEventsComponent],
  imports: [CommonModule, CvcActivityStream],
})
export class UsersEventsModule {}

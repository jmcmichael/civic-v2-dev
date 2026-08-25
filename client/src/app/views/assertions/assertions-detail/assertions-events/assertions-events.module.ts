import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AssertionsEventsPage } from './assertions-events.page'
import { CvcActivityStream } from '@app/components/activities/activity-stream/activity-stream.component'

@NgModule({
  declarations: [AssertionsEventsPage],
  imports: [CommonModule, CvcActivityStream],
  exports: [AssertionsEventsPage],
})
export class AssertionsEventsModule {}

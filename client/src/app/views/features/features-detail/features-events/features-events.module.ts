import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FeaturesEventsPage } from './features-events.page'
import { CvcActivityStream } from '@app/components/activities/activity-stream/activity-stream.component'

@NgModule({
  declarations: [FeaturesEventsPage],
  imports: [CommonModule, CvcActivityStream],
  exports: [FeaturesEventsPage],
})
export class FeaturesEventsModule {}

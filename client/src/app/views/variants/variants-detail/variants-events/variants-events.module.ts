import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { VariantsEventsPage } from './variants-events.page'
import { CvcActivityStream } from '@app/components/activities/activity-stream/activity-stream.component'

@NgModule({
  declarations: [VariantsEventsPage],
  imports: [CommonModule, CvcActivityStream],
  exports: [VariantsEventsPage],
})
export class VariantsEventsModule {}

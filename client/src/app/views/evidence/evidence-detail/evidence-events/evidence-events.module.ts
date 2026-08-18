import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { EvidenceEventsPage } from './evidence-events.page'
import { CvcActivityStream } from '@app/components/activities/activity-stream/activity-stream.component'

@NgModule({
  declarations: [EvidenceEventsPage],
  imports: [CommonModule, CvcActivityStream],
  exports: [EvidenceEventsPage],
})
export class EvidenceEventsModule {}

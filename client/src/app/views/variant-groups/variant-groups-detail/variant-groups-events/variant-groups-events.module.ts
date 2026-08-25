import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { VariantGroupsEventsPage } from './variant-groups-events.page'
import { CvcActivityStream } from '@app/components/activities/activity-stream/activity-stream.component'

@NgModule({
  declarations: [VariantGroupsEventsPage],
  imports: [CommonModule, CvcActivityStream],
  exports: [VariantGroupsEventsPage],
})
export class VariantGroupsEventsModule {}

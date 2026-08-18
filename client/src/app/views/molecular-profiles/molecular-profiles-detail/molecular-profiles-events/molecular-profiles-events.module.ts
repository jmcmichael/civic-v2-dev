import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MolecularProfilesEventsPage } from './molecular-profiles-events.page'
import { CvcActivityStream } from '@app/components/activities/activity-stream/activity-stream.component'

@NgModule({
  declarations: [MolecularProfilesEventsPage],
  imports: [CommonModule, CvcActivityStream],
  exports: [MolecularProfilesEventsPage],
})
export class MolecularProfilesEventsModule {}

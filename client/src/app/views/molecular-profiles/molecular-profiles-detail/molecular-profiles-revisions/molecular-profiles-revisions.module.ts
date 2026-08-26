import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MolecularProfilesRevisionsPage } from './molecular-profiles-revisions.page'
import { CvcRevisionStream } from '@app/components/revisions/revision-stream/revision-stream.component'

@NgModule({
  declarations: [MolecularProfilesRevisionsPage],
  imports: [CommonModule, CvcRevisionStream],
  exports: [MolecularProfilesRevisionsPage],
})
export class MolecularProfilesRevisionsModule {}

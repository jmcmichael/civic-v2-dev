import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { VariantGroupsRevisionsPage } from './variant-groups-revisions.page'
import { CvcRevisionStream } from '@app/components/revisions/revision-stream/revision-stream.component'

@NgModule({
  declarations: [VariantGroupsRevisionsPage],
  imports: [CommonModule, CvcRevisionStream],
  exports: [VariantGroupsRevisionsPage],
})
export class VariantGroupsRevisionsModule {}

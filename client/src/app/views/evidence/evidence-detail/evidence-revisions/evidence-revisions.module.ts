import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { EvidenceRevisionsPage } from './evidence-revisions.page'
import { CvcRevisionStream } from '@app/components/revisions/revision-stream/revision-stream.component'

@NgModule({
  declarations: [EvidenceRevisionsPage],
  imports: [CommonModule, CvcRevisionStream],
})
export class EvidenceRevisionsModule {}

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { FeaturesRevisionsPage } from './features-revisions.page'
import { CvcRevisionStream } from '@app/components/revisions/revision-stream/revision-stream.component'

@NgModule({
  declarations: [FeaturesRevisionsPage],
  imports: [CommonModule, CvcRevisionStream],
})
export class FeaturesRevisionsModule {}

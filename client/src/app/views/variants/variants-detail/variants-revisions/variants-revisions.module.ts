import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { VariantsRevisionsPage } from './variants-revisions.page'
import { CvcRevisionStream } from '@app/components/revisions/revision-stream/revision-stream.component'
import { NzTabsModule } from 'ng-zorro-antd/tabs'
import { NzBadgeModule } from 'ng-zorro-antd/badge'

@NgModule({
  declarations: [VariantsRevisionsPage],
  imports: [
    CommonModule,
    NzTabsModule,
    NzBadgeModule,
    CvcRevisionStream,
  ],
  exports: [VariantsRevisionsPage],
})
export class VariantsRevisionsModule {}

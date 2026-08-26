import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CvcRevisionStream } from '@app/components/revisions/revision-stream/revision-stream.component'
import { AssertionsRevisionsPage } from './assertions-revisions.page'

@NgModule({
  declarations: [AssertionsRevisionsPage],
  imports: [CommonModule, CvcRevisionStream],
  exports: [AssertionsRevisionsPage],
})
export class AssertionsRevisionsModule {}

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TagsTestPage } from './tags-test.page'
import { CvcEntityTagModule } from '@app/forms2/components/entity-tag/entity-tag.module'
import { NzTableModule } from 'ng-zorro-antd/table'
import { LetDirective, PushPipe } from '@ngrx/component'
import { FormsModule } from '@angular/forms'
import { NzCardModule } from 'ng-zorro-antd/card'

@NgModule({
  declarations: [TagsTestPage],
  imports: [
    CommonModule,
    LetDirective,
    PushPipe,
    FormsModule,
    NzCardModule,
    NzTableModule,
    CvcEntityTagModule,
  ],
})
export class TagsTestModule {}

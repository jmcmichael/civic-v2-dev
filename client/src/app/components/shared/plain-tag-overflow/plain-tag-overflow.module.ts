import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CvcPlainTagOverflowComponent } from './plain-tag-overflow.component'
import { CvcTagListModule } from '../tag-list/tag-list.module'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { NzTypographyModule } from 'ng-zorro-antd/typography'

@NgModule({
  declarations: [CvcPlainTagOverflowComponent],
  imports: [
    CommonModule,
    NzTagModule,
    NzPopoverModule,
    NzTypographyModule,
    CvcTagListModule,
  ],
  exports: [CvcPlainTagOverflowComponent],
})
export class CvcPlainTagOverflowModule {}

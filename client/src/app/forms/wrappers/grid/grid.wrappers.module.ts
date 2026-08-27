import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ConfigOption, FormlyModule } from '@ngx-formly/core'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { CvcColWrapper } from './col.wrapper'
import { CvcRowWrapper } from './row.wrapper'

const wrapperConfig: ConfigOption = {
  wrappers: [
    { name: 'row', component: CvcRowWrapper },
    { name: 'col', component: CvcColWrapper },
  ],
}

@NgModule({
  declarations: [CvcRowWrapper, CvcColWrapper],
  imports: [CommonModule, NzGridModule, FormlyModule.forChild(wrapperConfig)],
})
export class CvcGridWrappersModule {}

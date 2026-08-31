import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ConfigOption, FormlyModule } from '@ngx-formly/core'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { CvcFormActionsRowWrapper } from './form-actions-row.wrapper'

const wrapperConfig: ConfigOption = {
  wrappers: [{ name: 'form-actions-row', component: CvcFormActionsRowWrapper }],
}

@NgModule({
  declarations: [CvcFormActionsRowWrapper],
  imports: [CommonModule, NzGridModule, FormlyModule.forChild(wrapperConfig)],
})
export class CvcFormActionsRowModule {}

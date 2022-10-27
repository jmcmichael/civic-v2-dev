import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CvcFieldGroupWrapper } from './field-group.wrapper'
import { ConfigOption, FormlyModule } from '@ngx-formly/core'
import { NzFormModule } from 'ng-zorro-antd/form'
import { ReactiveFormsModule } from '@angular/forms'
import { NzGridModule } from 'ng-zorro-antd/grid'

const wrapperConfig: ConfigOption = {
  wrappers: [{ name: 'field-group', component: CvcFieldGroupWrapper }],
}
@NgModule({
  declarations: [CvcFieldGroupWrapper],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzGridModule,
    FormlyModule.forChild(wrapperConfig),
  ],
})
export class CvcFieldGroupWrapperModule {}

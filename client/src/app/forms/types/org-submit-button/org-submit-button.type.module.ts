import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { FormlyModule } from '@ngx-formly/core'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzTooltipModule } from 'ng-zorro-antd/tooltip'
import { CvcOrgSubmitButtonComponent } from './org-submit-button.type'

const typeConfig = {
  types: [
    { name: 'org-submit-button', component: CvcOrgSubmitButtonComponent },
  ],
}

@NgModule({
  declarations: [CvcOrgSubmitButtonComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormlyModule.forChild(typeConfig),
    NzButtonModule,
    NzTooltipModule,
  ],
  exports: [CvcOrgSubmitButtonComponent],
})
export class CvcOrgSubmitButtonTypeModule {}

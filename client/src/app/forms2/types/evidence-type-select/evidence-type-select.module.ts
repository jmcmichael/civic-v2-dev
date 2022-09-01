import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CvcEvidenceTypeSelectField } from './evidence-type-select.type'
import { ReactiveFormsModule } from '@angular/forms'
import { ReactiveComponentModule } from '@ngrx/component'
import { ConfigOption, FormlyModule } from '@ngx-formly/core'
import { FormlyNzFormFieldModule } from '@ngx-formly/ng-zorro-antd/form-field'
import { CvcEnumSelectModule } from '@app/forms2/components/enum-select/enum-select.module'

const typeConfig: ConfigOption = {
  types: [
    {
      name: 'evidence-type-select',
      wrappers: ['form-field'],
      component: CvcEvidenceTypeSelectField,
    },
  ],
}

@NgModule({
  declarations: [CvcEvidenceTypeSelectField],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReactiveComponentModule,
    FormlyModule.forChild(typeConfig),
    FormlyNzFormFieldModule, // for form-field wrapper
    CvcEnumSelectModule,
  ],
  exports: [CvcEvidenceTypeSelectField],
})
export class CvcEvidenceTypeSelectModule {}

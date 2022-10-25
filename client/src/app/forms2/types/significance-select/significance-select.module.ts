import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { ReactiveComponentModule } from '@ngrx/component'
import { ConfigOption, FormlyModule } from '@ngx-formly/core'
import { FormlyNzFormFieldModule } from '@ngx-formly/ng-zorro-antd/form-field'
import { CvcEntitySignificanceSelectField } from './significance-select.type'
import { CvcEnumSelectModule } from '@app/forms2/components/enum-select/enum-select.module'
import { CvcAttributeTagModule } from '@app/forms2/components/attribute-tag/attribute-tag.module'

const typeConfig: ConfigOption = {
  types: [
    {
      name: 'significance-select',
      wrappers: ['field-layout'],
      component: CvcEntitySignificanceSelectField,
    },
  ],
}

@NgModule({
  declarations: [
    CvcEntitySignificanceSelectField
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReactiveComponentModule,
    FormlyModule.forChild(typeConfig),
    FormlyNzFormFieldModule, // for form-field wrapper
    CvcEnumSelectModule,
    CvcAttributeTagModule,
  ],
  exports: [
    CvcEntitySignificanceSelectField
  ]
})
export class CvcClinicalSignificanceSelectModule { }

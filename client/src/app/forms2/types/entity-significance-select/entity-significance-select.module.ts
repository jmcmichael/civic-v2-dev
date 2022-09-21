import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { ReactiveComponentModule } from '@ngrx/component'
import { ConfigOption, FormlyModule } from '@ngx-formly/core'
import { FormlyNzFormFieldModule } from '@ngx-formly/ng-zorro-antd/form-field'
import { CvcEntitySignificanceSelectField } from './entity-significance-select.type'
import { CvcEnumSelectModule } from '@app/forms2/components/enum-select/enum-select.module'

const typeConfig: ConfigOption = {
  types: [
    {
      name: 'entity-significance-select',
      wrappers: ['form-field'],
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
  ],
  exports: [
    CvcEntitySignificanceSelectField
  ]
})
export class CvcClinicalSignificanceSelectModule { }

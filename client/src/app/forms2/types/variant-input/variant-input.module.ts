import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CvcVariantInputField } from './variant-input.type'
import { ConfigOption, FormlyModule } from '@ngx-formly/core'
import { FormlyNzFormFieldModule } from '@ngx-formly/ng-zorro-antd/form-field'
import { ReactiveFormsModule } from '@angular/forms'
import { NzInputModule } from 'ng-zorro-antd/input'
import { ReactiveComponentModule } from '@ngrx/component'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete'

const typeConfig: ConfigOption = {
  types: [
    {
      name: 'variant-input',
      wrappers: ['form-field'],
      component: CvcVariantInputField,
    },
  ],
}

@NgModule({
  declarations: [CvcVariantInputField],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReactiveComponentModule,
    FormlyModule.forChild(typeConfig),
    FormlyNzFormFieldModule, // for form-field wrapper
    NzSelectModule,
    NzInputModule,
    NzFormModule,
    NzAutocompleteModule
  ],
  exports: [CvcVariantInputField],
})
export class CvcVariantInputModule {}

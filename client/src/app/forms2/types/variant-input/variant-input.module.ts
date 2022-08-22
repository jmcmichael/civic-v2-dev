import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CvcVariantInputField } from './variant-input.type'
import { ConfigOption, FormlyModule } from '@ngx-formly/core'
import { FormlyNzFormFieldModule } from '@ngx-formly/ng-zorro-antd/form-field'
import { ReactiveFormsModule } from '@angular/forms'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzInputNumberModule } from 'ng-zorro-antd/input-number'

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
    NzInputModule,
    NzInputNumberModule,
    FormlyNzFormFieldModule, // for form-field wrapper
    FormlyModule.forChild(typeConfig),
  ],
  exports: [CvcVariantInputField],
})
export class CvcVariantInputModule {}

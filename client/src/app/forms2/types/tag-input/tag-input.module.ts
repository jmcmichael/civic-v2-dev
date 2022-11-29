import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  CvcBaseInputField,
  CvcBaseInputFieldProps,
} from './tag-input.type'
import { ConfigOption, FormlyModule } from '@ngx-formly/core'
import { ReactiveFormsModule } from '@angular/forms'
import { ReactiveComponentModule } from '@ngrx/component'
import { FormlyNzFormFieldModule } from '@ngx-formly/ng-zorro-antd/form-field'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzFormModule } from 'ng-zorro-antd/form'
import { CvcStringTagModule } from '@app/forms2/components/string-tag/string-tag.module'

const typeConfig: ConfigOption = {
  types: [
    {
      name: 'tag-input',
      wrappers: ['form-field'],
      component: CvcBaseInputField,
    },
    {
      // for use in repeat-field types
      name: 'tag-input-item',
      wrappers: ['form-field'],
      component: CvcBaseInputField,
      defaultOptions: {
        props: <CvcBaseInputFieldProps>{
          isRepeatItem: true,
          hideLabel: true,
        },
      },
    },
  ],
}

@NgModule({
  declarations: [CvcBaseInputField],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReactiveComponentModule,
    FormlyModule.forChild(typeConfig),
    FormlyNzFormFieldModule, // for form-field wrapper
    NzInputModule,
    NzFormModule,
    CvcStringTagModule,
  ],
  exports: [CvcBaseInputField],
})
export class CvcBaseInputFieldModule {}

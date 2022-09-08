import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvcRepeatField } from './repeat-field.type';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfigOption, FormlyModule } from '@ngx-formly/core';
import { FormlyNzFormFieldModule } from '@ngx-formly/ng-zorro-antd/form-field';
import { NzButtonModule } from 'ng-zorro-antd/button';

const typeConfig: ConfigOption = {
  types: [
    {
      name: 'repeat-field',
      wrappers: ['form-field'],
      component: CvcRepeatField,
    },
  ],
}

@NgModule({
  declarations: [
    CvcRepeatField
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormlyModule.forChild(typeConfig),
    FormlyNzFormFieldModule,
    NzButtonModule,
  ],
  exports: [
    CvcRepeatField
  ]
})
export class CvcRepeatFieldModule { }

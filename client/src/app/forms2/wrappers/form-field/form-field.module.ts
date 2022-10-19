import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigOption, FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { CvcFormFieldWrapper } from './form-field.wrapper';

// NOTE: this wrapper replaces, and is heavily based on, ngx-formly's
// ng-zorro base form-field wrapper. If after an ngx-formly update,
// issues arise, ensure that any key updates are ported from ngx-formly's
// form-field wrapper.
const wrapperConfig: ConfigOption = {
  wrappers: [{ name: 'field-layout', component: CvcFormFieldWrapper }],
}
@NgModule({
  declarations: [CvcFormFieldWrapper],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    FormlyModule.forChild(wrapperConfig),
  ],
})
export class CvcFormFieldWrapperModule {}

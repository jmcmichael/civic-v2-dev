import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CvcFieldsLayoutModule } from './fields-layout/fields-layout.module';
import { CvcFormFieldWrapperModule } from './form-field/form-field.module';
import { CvcFormFooterWrapperModule } from './form-footer/form-footer.wrapper.module';
import { CvcFormLayoutWrapperModule } from './form-layout/form-layout.wrapper.module';

@NgModule({
  imports: [
    CommonModule,
    CvcFormLayoutWrapperModule,
    CvcFieldsLayoutModule,
    CvcFormFooterWrapperModule,
    CvcFormFieldWrapperModule,
  ],
})
export class CvcFormWrappersModule {}

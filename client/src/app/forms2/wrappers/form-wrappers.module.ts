import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CvcFieldsLayoutModule } from './fields-layout/fields-layout.module';
import { CvcFormLayoutWrapperModule } from './form-layout/form-layout.wrapper.module';

@NgModule({
  imports: [
    CommonModule,
    CvcFormLayoutWrapperModule,
    CvcFieldsLayoutModule,
  ],
})
export class CvcFormWrappersModule {}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CvcFormCardModule } from './form-card/form-card.module';
import { CvcFormFieldWrapperModule } from './field-layout/field-layout.module';
import { CvcFormFooterWrapperModule } from './form-footer/form-footer.wrapper.module';
import { CvcFormLayoutWrapperModule } from './form-layout/form-layout.wrapper.module';

@NgModule({
  imports: [
    CommonModule,
    CvcFormLayoutWrapperModule,
    CvcFormCardModule,
    CvcFormFooterWrapperModule,
    CvcFormFieldWrapperModule,
  ],
})
export class CvcFormWrappersModule {}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CvcFormLayoutWrapperModule } from './form-layout/form-layout.wrapper.module';

@NgModule({
  imports: [
    CommonModule,
    CvcFormLayoutWrapperModule,
  ],
})
export class CvcFormWrappersModule {}

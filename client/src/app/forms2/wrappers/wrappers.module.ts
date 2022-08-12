import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CvcFormCardWrapperModule } from './form-card/form-card.wrapper.module';

@NgModule({
  imports: [
    CommonModule,
    CvcFormCardWrapperModule,
  ],
})
export class CvcFormWrappersModule {}

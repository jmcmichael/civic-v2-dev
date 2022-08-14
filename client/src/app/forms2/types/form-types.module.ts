import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CvcOrgSubmitButtonTypeModule } from './org-submit-button/org-submit-button.type.module';

@NgModule({
  imports: [CommonModule, CvcOrgSubmitButtonTypeModule],
})
export class CvcFormWrappersModule {}

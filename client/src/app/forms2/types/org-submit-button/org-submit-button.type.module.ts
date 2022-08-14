import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrgSubmitButtonComponent, OrgSubmitButtonTypeOption } from './org-submit-button.type';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CvcOrgSelectorBtnGroupModule } from '@app/forms/config/components/org-selector-btn-group/org-selector-btn-group.module';

@NgModule({
  declarations: [OrgSubmitButtonComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormlyModule.forChild({ types: [OrgSubmitButtonTypeOption] }),
    NzButtonModule,
    CvcOrgSelectorBtnGroupModule,
  ],
  exports: [OrgSubmitButtonComponent]
})
export class CvcOrgSubmitButtonTypeModule { }

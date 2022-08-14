import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CvcOrgSelectorBtnGroupModule } from '@app/forms/config/components/org-selector-btn-group/org-selector-btn-group.module';
import { FormlyModule } from '@ngx-formly/core';
import { ConfigOption } from '@ngx-formly/core/lib/models';
import { CvcOrgSubmitButtonComponent } from './org-submit-button.type';

const typeConfig: ConfigOption = {
  types: [{name: 'org-submit-button', component: CvcOrgSubmitButtonComponent}]
}

@NgModule({
  declarations: [CvcOrgSubmitButtonComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormlyModule.forChild(typeConfig),
    CvcOrgSelectorBtnGroupModule,
  ],
  exports: [CvcOrgSubmitButtonComponent],
})
export class CvcOrgSubmitButtonTypeModule {}

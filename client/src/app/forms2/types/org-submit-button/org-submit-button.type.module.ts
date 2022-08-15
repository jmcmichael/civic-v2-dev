import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ReactiveComponentModule } from '@ngrx/component';
import { FormlyModule } from '@ngx-formly/core';
import { ConfigOption } from '@ngx-formly/core/lib/models';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { CvcOrgSubmitButtonDirective } from './org-submit-button.directive';
import { CvcOrgSubmitButtonComponent } from './org-submit-button.type';

const typeConfig: ConfigOption = {
  types: [{name: 'org-submit-button', component: CvcOrgSubmitButtonComponent}]
}

@NgModule({
  declarations: [CvcOrgSubmitButtonComponent, CvcOrgSubmitButtonDirective],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReactiveComponentModule,
    FormlyModule.forChild(typeConfig),
    NzAvatarModule,
    NzButtonModule,
    NzDropDownModule,
  ],
  exports: [CvcOrgSubmitButtonComponent, CvcOrgSubmitButtonDirective],
})
export class CvcOrgSubmitButtonTypeModule {}

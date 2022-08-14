import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { CvcOrgSelectorBtnGroupModule } from "@app/forms/config/components/org-selector-btn-group/org-selector-btn-group.module";
import { CvcForms2Module } from "@app/forms2/forms2.module";
import { environment } from "environments/environment";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzFormModule } from "ng-zorro-antd/form";
import { CvcEvidenceSubmitForm } from "./evidence-submit.form";

@NgModule({
  declarations: [CvcEvidenceSubmitForm],
  imports: [
    CommonModule,
    NzFormModule,
    NzButtonModule,
    CvcForms2Module,
    CvcOrgSelectorBtnGroupModule,

    ...environment.devModules
  ],
  exports: [CvcEvidenceSubmitForm]
})
export class CvcEvidenceSubmitFormModule { }

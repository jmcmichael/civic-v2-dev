import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { CvcFormWrappersModule } from "@app/forms2/wrappers/wrappers.module";
import { FormlyModule } from "@ngx-formly/core";
import { NzFormModule } from "ng-zorro-antd/form";
import { CvcEvidenceSubmitForm } from "./evidence-submit.form";

@NgModule({
  declarations: [CvcEvidenceSubmitForm],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormlyModule,
    CvcFormWrappersModule,
    NzFormModule,
  ],
  exports: [CvcEvidenceSubmitForm]
})
export class CvcEvidenceSubmitFormModule { }

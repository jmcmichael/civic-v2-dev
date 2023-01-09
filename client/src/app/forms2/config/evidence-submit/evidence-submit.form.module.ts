import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CvcForms2Module } from '@app/forms2/forms2.module'
import { ReactiveComponentModule } from '@ngrx/component'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NgxJsonViewerModule } from 'ngx-json-viewer' // debug
import { CvcEvidenceSubmitForm } from './evidence-submit.form'

@NgModule({
  declarations: [CvcEvidenceSubmitForm],
  imports: [
    CommonModule,
    ReactiveComponentModule,
    NzButtonModule,
    CvcForms2Module,

    NgxJsonViewerModule, // debug
  ],
  exports: [CvcEvidenceSubmitForm],
})
export class CvcEvidenceSubmitFormModule {}

import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CvcEvidenceSubmitFormModule } from '@app/forms2/config/evidence-submit/evidence-submit.form.module'
import { EvidenceSubmitPage } from './evidence-submit.page'

@NgModule({
  declarations: [EvidenceSubmitPage],
  imports: [CommonModule, CvcEvidenceSubmitFormModule],
})
export class EvidenceSubmitModule {}

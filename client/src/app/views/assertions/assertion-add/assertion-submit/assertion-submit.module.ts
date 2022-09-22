import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CvcAssertionSubmitModule } from '@app/forms2/config/assertion-submit/assertion-submit.module'
import { CvcForms2Module } from '@app/forms2/forms2.module'
import { AssertionSubmitPage } from './assertion-submit.page'

@NgModule({
  declarations: [AssertionSubmitPage],
  imports: [CommonModule, CvcForms2Module, CvcAssertionSubmitModule],
})
export class AssertionSubmitModule {}

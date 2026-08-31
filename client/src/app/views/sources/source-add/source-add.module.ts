import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SourceAddPage } from './source-add.page'
import { CvcSectionNavigationModule } from '@app/components/shared/section-navigation/section-navigation.module'
import { CvcSourceSubmitFormModule } from '@app/forms/config/source-submit/source-submit.form.module'

@NgModule({
  declarations: [SourceAddPage],
  imports: [
    CommonModule,
    CvcSectionNavigationModule,
    CvcSourceSubmitFormModule,
  ],
})
export class SourceAddModule {}

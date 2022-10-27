import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CvcFieldGroupWrapperModule } from './field-group/field-group.module'
import { CvcFormCardModule } from './form-card/form-card.module'
import { CvcFormFieldWrapperModule } from './form-field/form-field.module'
import { CvcFormFooterWrapperModule } from './form-footer/form-footer.wrapper.module'
import { CvcFormLayoutWrapperModule } from './form-layout/form-layout.wrapper.module'

@NgModule({
  imports: [
    CommonModule,
    CvcFormLayoutWrapperModule,
    CvcFormCardModule,
    CvcFormFooterWrapperModule,
    CvcFormFieldWrapperModule,
    CvcFieldGroupWrapperModule,
  ],
})
export class CvcFormWrappersModule {}

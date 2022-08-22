import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CvcGeneInputModule } from './gene-input/gene-input.module'
import { CvcOrgSubmitButtonTypeModule } from './org-submit-button/org-submit-button.type.module'
import { CvcVariantInputModule } from './variant-input/variant-input.module'

@NgModule({
  imports: [
    CommonModule,
    CvcOrgSubmitButtonTypeModule,
    CvcGeneInputModule,
    CvcVariantInputModule,
  ],
})
export class CvcFormTypesModule {}

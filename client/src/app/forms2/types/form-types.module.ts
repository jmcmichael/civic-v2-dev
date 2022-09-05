import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CvcClinicalSignificanceSelectModule } from './clinical-significance-select/clinical-significance-select.module'
import { CvcEvidenceDirectionSelectModule } from './evidence-direction-select/evidence-direction-select.module'
import { CvcEvidenceTypeSelectModule } from './evidence-type-select/evidence-type-select.module'
import { CvcGeneSelectModule } from './gene-select/gene-select.module'
import { CvcOrgSubmitButtonTypeModule } from './org-submit-button/org-submit-button.type.module'
import { CvcVariantInputModule } from './variant-input/variant-input.module'

@NgModule({
  imports: [
    CommonModule,
    CvcOrgSubmitButtonTypeModule,
    CvcGeneSelectModule,
    CvcVariantInputModule,
    CvcEvidenceTypeSelectModule,
    CvcClinicalSignificanceSelectModule,
    CvcEvidenceDirectionSelectModule,
  ],
})
export class CvcFormTypesModule {}

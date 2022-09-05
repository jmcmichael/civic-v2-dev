import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CvcClinicalSignificanceSelectModule } from './clinical-significance-select/clinical-significance-select.module'
import { CvcEvidenceDirectionSelectModule } from './evidence-direction-select/evidence-direction-select.module'
import { CvcEvidenceTypeSelectModule } from './evidence-type-select/evidence-type-select.module'
import { CvcGeneSelectModule } from './gene-select/gene-select.module'
import { CvcOrgSubmitButtonTypeModule } from './org-submit-button/org-submit-button.type.module'
import { CvcRepeatFieldModule } from './repeat-field/repeat-field.module'
import { CvcVariantSelectModule } from './variant-select/variant-select.module'

@NgModule({
  imports: [
    CommonModule,
    CvcOrgSubmitButtonTypeModule,
    CvcGeneSelectModule,
    CvcVariantSelectModule,
    CvcEvidenceTypeSelectModule,
    CvcClinicalSignificanceSelectModule,
    CvcEvidenceDirectionSelectModule,
    CvcRepeatFieldModule,
  ],
})
export class CvcFormTypesModule {}

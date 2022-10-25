import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CvcBaseInputFieldModule } from './base-input/base-input.module'
import { CvcClinicalSignificanceSelectModule } from './significance-select/significance-select.module'
import { CvcEvidenceDirectionSelectModule } from './direction-select/direction-select.module'
import { CvcEntityTypeSelectModule } from './type-select/type-select.module'
import { CvcGeneSelectModule } from './gene-select/gene-select.module'
import { CvcOrgSubmitButtonTypeModule } from './org-submit-button/org-submit-button.type.module'
import { CvcRepeatFieldModule } from './repeat-field/repeat-field.module'
import { CvcVariantSelectModule } from './variant-select/variant-select.module'
import { CvcDrugSelectModule } from './drug-select/drug-select.module'

@NgModule({
  imports: [
    CommonModule,
    CvcOrgSubmitButtonTypeModule,
    CvcDrugSelectModule,
    CvcEntityTypeSelectModule,
    CvcGeneSelectModule,
    CvcVariantSelectModule,
    CvcClinicalSignificanceSelectModule,
    // CvcEvidenceDirectionSelectModule,
    // CvcRepeatFieldModule,
    // CvcBaseInputFieldModule,
  ],
})
export class CvcFormTypesModule {}

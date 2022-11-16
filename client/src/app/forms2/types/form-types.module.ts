import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CvcCheckboxModule } from './checkbox/checkbox.module'
import { CvcDirectionSelectModule } from './direction-select/direction-select.module'
import { CvcDiseaseSelectModule } from './disease-select/disease-select.module'
import { CvcDrugSelectModule } from './drug-select/drug-select.module'
import { CvcGeneSelectModule } from './gene-select/gene-select.module'
import { CvcInteractionSelectModule } from './interaction-select/interaction-select.module'
import { CvcLevelSelectModule } from './level-select/level-select.module'
import { CvcOrgSubmitButtonTypeModule } from './org-submit-button/org-submit-button.type.module'
import { CvcOriginSelectModule } from './origin-select/origin-select.module'
import { CvcRatingModule } from './rating/rating.module'
import { CvcSignificanceSelectModule } from './significance-select/significance-select.module'
import { CvcSourceSelectModule } from './source-select/source-select.module'
import { CvcEntityTypeSelectModule } from './type-select/type-select.module'
import { CvcVariantSelectModule } from './variant-select/variant-select.module'

@NgModule({
  imports: [
    CommonModule,
    CvcOrgSubmitButtonTypeModule,
    CvcDrugSelectModule,
    CvcEntityTypeSelectModule,
    CvcGeneSelectModule,
    CvcVariantSelectModule,
    CvcSignificanceSelectModule,
    CvcDirectionSelectModule,
    CvcDiseaseSelectModule,
    CvcInteractionSelectModule,
    CvcCheckboxModule,
    CvcLevelSelectModule,
    CvcRatingModule,
    CvcOriginSelectModule,
    CvcSourceSelectModule,
    // CvcBaseInputFieldModule,
  ],
})
export class CvcFormTypesModule {}

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { EvidenceReviseForm } from './evidence-revise.form'
import { CvcSourceInputTypeModule } from '@app/forms/config/types/source-input/source-input.module'
import { CvcMultiFieldTypeModule } from '@app/forms/config/types/multi-field/multi-field.module'
import { CvcFormButtonsModule } from '@app/forms/config/components/form-buttons/form-buttons.module'
import { CvcFormErrorsAlertModule } from '@app/forms/config/components/form-errors-alert/form-errors-alert.module'
import { CvcOrgSelectorBtnGroupModule } from '@app/forms/config/components/org-selector-btn-group/org-selector-btn-group.module'
import { FormlyModule } from '@ngx-formly/core'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzAlertModule } from 'ng-zorro-antd/alert'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NgxJsonViewerModule } from 'ngx-json-viewer'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { CvcRatingInputTypeModule } from '../config/types/rating-input/rating-input.module'
import { CvcTherapyInputTypeModule } from '@app/forms/config/types/therapy-input/therapy-input.module'
import { CvcPhenotypeInputTypeModule } from '@app/forms/config/types/phenotype-input/phenotype-input.module'
import { CvcDiseaseInputTypeModule } from '@app/forms/config/types/disease-input/disease-input.module'
import { CvcOrgSubmitButtonTypeModule } from '@app/forms/config/types/org-submit-button/org-submit-button.module'
import { CvcFormInfoWrapperModule } from '@app/forms/config/wrappers/form-info/form-info.module'
import { CvcTextareaBaseTypeModule } from '../config/types/textarea-base/textarea-base.module'
import { CvcVariantOriginSelectTypeModule } from '../config/types/variant-origin-select/variant-origin-select.module'
import { CvcEvidenceTypeSelectTypeModule } from '../config/types/evidence-type-select/evidence-type-select.module'
import { CvcSignificanceSelectModule } from '../config/types/significance-select/significance-select.module'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { CvcEvidenceLevelSelectModule } from '../config/types/evidence-level-select/evidence-level-select.module'
import { CvcEvidenceDirectionSelectModule } from '../config/types/evidence-direction-select/evidence-direction-select.module'
import { CvcDiseaseArrayTypeModule } from '../config/types/disease-array/disease-array.module'
import { CvcTherapyArrayTypeModule } from '../config/types/therapies-array/therapies-array.module'
import { CvcPhenotypeArrayTypeModule } from '../config/types/phenotypes-array/phenotypes-array.module'
import { CvcTherapyInteractionSelectTypeModule } from '../config/types/therapy-interaction-select/therapy-interaction-select.module'
import { CvcFormContainerWrapperModule } from '../config/wrappers/form-container/form-container.module'
import { CvcCancelButtonModule } from '../config/types/cancel-button/cancel-button.module'
import { CvcFormFieldWrapperModule } from '../config/wrappers/form-field/form-field.module'
import { CvcMolecularProfileInputTypeModule } from '../config/types/molecular-profile-input/molecular-profile-input.module'

@NgModule({
  declarations: [EvidenceReviseForm],
  providers: [],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NgxJsonViewerModule,
    NzFormModule,
    NzAlertModule,
    NzGridModule,
    NzButtonModule,
    NzSpinModule,
    FormlyModule,
    CvcOrgSelectorBtnGroupModule,
    CvcFormErrorsAlertModule,
    CvcFormButtonsModule,
    CvcFormInfoWrapperModule,
    CvcOrgSubmitButtonTypeModule,
    CvcMultiFieldTypeModule,
    CvcSourceInputTypeModule,
    CvcTherapyInputTypeModule,
    CvcRatingInputTypeModule,
    CvcPhenotypeInputTypeModule,
    CvcDiseaseInputTypeModule,
    CvcTextareaBaseTypeModule,
    CvcVariantOriginSelectTypeModule,
    CvcEvidenceTypeSelectTypeModule,
    CvcSignificanceSelectModule,
    CvcEvidenceLevelSelectModule,
    CvcEvidenceDirectionSelectModule,
    CvcDiseaseArrayTypeModule,
    CvcTherapyArrayTypeModule,
    CvcPhenotypeArrayTypeModule,
    CvcTherapyInteractionSelectTypeModule,
    CvcFormContainerWrapperModule,
    CvcFormFieldWrapperModule,
    CvcCancelButtonModule,
    CvcMolecularProfileInputTypeModule,
  ],
  exports: [EvidenceReviseForm],
})
export class EvidenceReviseFormModule {}

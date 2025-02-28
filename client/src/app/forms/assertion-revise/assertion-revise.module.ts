import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AssertionReviseForm } from './assertion-revise.form'
import { RouterModule } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'
import { NgxJsonViewerModule } from 'ngx-json-viewer'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzAlertModule } from 'ng-zorro-antd/alert'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { FormlyModule } from '@ngx-formly/core'
import { CvcOrgSelectorBtnGroupModule } from '../config/components/org-selector-btn-group/org-selector-btn-group.module'
import { CvcFormErrorsAlertModule } from '../config/components/form-errors-alert/form-errors-alert.module'
import { CvcFormButtonsModule } from '../config/components/form-buttons/form-buttons.module'
import { CvcFormInfoWrapperModule } from '../config/wrappers/form-info/form-info.module'
import { CvcOrgSubmitButtonTypeModule } from '../config/types/org-submit-button/org-submit-button.module'
import { CvcMultiFieldTypeModule } from '../config/types/multi-field/multi-field.module'
import { CvcSourceInputTypeModule } from '../config/types/source-input/source-input.module'
import { CvcTherapyInputTypeModule } from '../config/types/therapy-input/therapy-input.module'
import { CvcRatingInputTypeModule } from '../config/types/rating-input/rating-input.module'
import { CvcPhenotypeInputTypeModule } from '../config/types/phenotype-input/phenotype-input.module'
import { CvcDiseaseInputTypeModule } from '../config/types/disease-input/disease-input.module'
import { CvcTextareaBaseTypeModule } from '../config/types/textarea-base/textarea-base.module'
import { CvcCommentTextareaTypeModule } from '../config/types/comment-textarea/comment-textarea.module'
import { CvcVariantOriginSelectTypeModule } from '../config/types/variant-origin-select/variant-origin-select.module'
import { CvcEvidenceTypeSelectTypeModule } from '../config/types/evidence-type-select/evidence-type-select.module'
import { CvcSignificanceSelectModule } from '../config/types/significance-select/significance-select.module'
import { CvcEvidenceLevelSelectModule } from '../config/types/evidence-level-select/evidence-level-select.module'
import { CvcEvidenceDirectionSelectModule } from '../config/types/evidence-direction-select/evidence-direction-select.module'
import { CvcDiseaseArrayTypeModule } from '../config/types/disease-array/disease-array.module'
import { CvcTherapyArrayTypeModule } from '../config/types/therapies-array/therapies-array.module'
import { CvcPhenotypeArrayTypeModule } from '../config/types/phenotypes-array/phenotypes-array.module'
import { CvcTherapyInteractionSelectTypeModule } from '../config/types/therapy-interaction-select/therapy-interaction-select.module'
import { CvcGeneArrayTypeModule } from '../config/types/gene-array/gene-array.module'
import { CvcVariantArrayTypeModule } from '../config/types/variant-array/variant-array.module'
import { CvcSourceArrayTypeModule } from '../config/types/source-array/source-array.module'
import { CvcAmpLevelInputTypeModule } from '../config/types/amp-level-input/amp-level-input.module'
import { CvcAcmgCodeArrayTypeModule } from '../config/types/acmg-code-array/acmg-code-array.module'
import { CvcNccnVersionInputTypeModule } from '../config/types/nccn-version-input/nccn-version-input.module'
import { CvcNccnGuidelineInputTypeModule } from '../config/types/nccn-guideline-input/nccn-guideline-input.module'
import { CvcFdaApprovalCheckboxTypeModule } from '../config/types/fda-approval-checkbox/fda-approval-checkbox.module'
import { CvcFdaTestCheckboxTypeModule } from '../config/types/fda-test-checkbox/fda-test-checkbox.module'
import { CvcFormContainerWrapperModule } from '../config/wrappers/form-container/form-container.module'
import { CvcEvidenceInputTypeModule } from '../config/types/evidence-input/evidence-input.module'
import { CvcEvidenceManagerWrapperModule } from '../config/wrappers/with-evidence-manager/with-evidence-manager.module'
import { CvcCancelButtonModule } from '../config/types/cancel-button/cancel-button.module'
import { CvcClingenCodeArrayTypeModule } from '../config/types/clingen-code-array/clingen-code-array.module'
import { CvcMolecularProfileInputTypeModule } from '../config/types/molecular-profile-input/molecular-profile-input.module'

@NgModule({
  declarations: [AssertionReviseForm],
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
    CvcCommentTextareaTypeModule,
    CvcVariantOriginSelectTypeModule,
    CvcEvidenceTypeSelectTypeModule,
    CvcSignificanceSelectModule,
    CvcEvidenceLevelSelectModule,
    CvcEvidenceDirectionSelectModule,
    CvcDiseaseArrayTypeModule,
    CvcTherapyArrayTypeModule,
    CvcPhenotypeArrayTypeModule,
    CvcTherapyInteractionSelectTypeModule,
    CvcMolecularProfileInputTypeModule,
    CvcSourceArrayTypeModule,
    CvcAmpLevelInputTypeModule,
    CvcAcmgCodeArrayTypeModule,
    CvcNccnVersionInputTypeModule,
    CvcNccnGuidelineInputTypeModule,
    CvcFdaApprovalCheckboxTypeModule,
    CvcFdaTestCheckboxTypeModule,
    CvcFormContainerWrapperModule,
    CvcEvidenceInputTypeModule,
    CvcEvidenceManagerWrapperModule,
    CvcCancelButtonModule,
    CvcClingenCodeArrayTypeModule,
  ],
  exports: [AssertionReviseForm],
})
export class CvcAssertionReviseFormModule {}

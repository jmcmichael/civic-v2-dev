import {
  DrugInteraction,
  EvidenceClinicalSignificance,
  EvidenceDirection,
  EvidenceLevel,
  EvidenceType,
  VariantOrigin,
} from '@app/generated/civic.apollo'
import { EvidenceItemStateFields, evidenceItemStateFieldsDefaults } from './evidence-fields.model'
import { FormSubmitBaseModel } from './form-submit-base.model'

export interface EvidenceSubmitModel extends FormSubmitBaseModel {
  fields: EvidenceItemStateFields
}


export const evidenceSubmitFormInitialModel: EvidenceSubmitModel = {
  clientMutationId: undefined,
  fields: evidenceItemStateFieldsDefaults,
  comment: undefined,
  organizationId: undefined,
}

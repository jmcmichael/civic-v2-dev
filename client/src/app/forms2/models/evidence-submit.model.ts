import { EvidenceItemFields } from './evidence-fields.model'
import { FormSubmitBaseModel } from './form-submit-base.model'

export interface EvidenceSubmitModel extends FormSubmitBaseModel {
  fields: EvidenceItemFields
}

export const evidenceItemSubmitFieldsDefaults = <EvidenceItemFields>{
  // gene, variant included for initial input type development
  geneId: undefined,
  variantId: undefined,
  clinicalSignificance: undefined,
  description: undefined,
  diseaseId: undefined,
  drugIds: undefined,
  drugInteractionType: undefined,
  evidenceDirection: undefined,
  evidenceLevel: undefined,
  evidenceType: undefined,
  molecularProfileId: undefined,
  phenotypeIds: undefined,
  rating: undefined,
  sourceId: undefined,
  variantOrigin: undefined,
}

export const evidenceSubmitFormInitialModel: EvidenceSubmitModel = {
  clientMutationId: undefined,
  fields: evidenceItemSubmitFieldsDefaults,
  comment: undefined,
  organizationId: undefined,
}

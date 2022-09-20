import {
  DrugInteraction,
  EvidenceClinicalSignificance,
  EvidenceDirection,
  EvidenceLevel,
  EvidenceType,
  VariantOrigin,
} from '@app/generated/civic.apollo'
import { FormSubmitBaseModel } from './form-submit-base.model'

export interface EvidenceSubmitModel extends FormSubmitBaseModel {
  fields: EvidenceItemSubmitFields
}

export type EvidenceItemSubmitFields = {
  // gene, variant included for initial input type development
  geneId?: number
  variantId?: number
  clinicalSignificance?: EvidenceClinicalSignificance
  description?: string
  diseaseId?: number
  drugIds?: number[]
  drugInteractionType?: DrugInteraction
  evidenceDirection?: EvidenceDirection
  evidenceLevel?: EvidenceLevel
  evidenceType?: EvidenceType
  molecularProfileId?: number
  phenotypeIds?: number[]
  rating?: number
  sourceId?: number
  variantOrigin?: VariantOrigin
}

export const evidenceItemSubmitFieldsDefaults = <EvidenceItemSubmitFields>{
  // gene, variant included for initial input type development
  geneId: undefined,
  variantId: undefined,
  clinicalSignificance: undefined,
  description: undefined,
  diseaseId: undefined,
  drugIds: [],
  drugInteractionType: undefined,
  evidenceDirection: undefined,
  evidenceLevel: undefined,
  evidenceType: undefined,
  molecularProfileId: undefined,
  phenotypeIds: [],
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

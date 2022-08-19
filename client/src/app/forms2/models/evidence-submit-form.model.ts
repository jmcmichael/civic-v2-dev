import {
  DrugInteraction,
  EvidenceClinicalSignificance,
  EvidenceDirection,
  EvidenceLevel,
  EvidenceType,
  VariantOrigin,
} from '@app/generated/civic.apollo'
import { FormSubmitBaseModel } from './form-submit-base.model'

export interface EvidenceSubmitFormModel extends FormSubmitBaseModel {
  fields: {
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
}

export const evidenceSubmitFormInitialModel: EvidenceSubmitFormModel = {
  clientMutationId: undefined,
  comment: undefined,
  organizationId: undefined,
  fields: {
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
}

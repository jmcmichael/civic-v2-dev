import {
  DrugInteraction,
  EvidenceClinicalSignificance,
  EvidenceDirection,
  EvidenceLevel,
  EvidenceType,
  VariantOrigin,
} from '@app/generated/civic.apollo'

export type EvidenceItemFields = {
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

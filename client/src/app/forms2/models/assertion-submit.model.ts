import {
  AmpLevel,
  AssertionClinicalSignificance,
  AssertionDirection,
  AssertionType,
  DrugInteraction,
  VariantOrigin,
} from '@app/generated/civic.apollo'
import { FormSubmitBaseModel } from './form-submit-base.model'

export interface AssertionSubmitModel extends FormSubmitBaseModel {
  fields: AssertionSubmitFields
}

export type AssertionSubmitFields = {
  /** List of CIViC IDs for the ACMG/AMP codes associated with this Assertion */
  acmgCodeIds?: number[]
  /** The AMP/ASCO/CAP Category for this assertion. */
  ampLevel?: AmpLevel
  /** The evidence direction for this Assertion. */
  assertionDirection?: AssertionDirection
  /** The Type of the Assertion */
  assertionType?: AssertionType
  /** List of CIViC IDs for the ClinGen/CGC/VICC codes associated with this Assertion */
  clingenCodeIds?: number[]
  /** The Clinical Significance of the Assertion */
  clinicalSignificance?: AssertionClinicalSignificance
  /** A detailed description of the Assertion including practice guidelines and approved tests. */
  description?: string
  /** The ID of the disease (if applicable) for this Assertion */
  diseaseId?: number
  /** List of IDs of CIViC Drug entries for this Assertion. An empty list indicates none. */
  drugIds?: number[]
  /** Drug interaction type for cases where more than one drug ID is provided. */
  drugInteractionType?: DrugInteraction
  /** IDs of evidence items that are included in this Assertion. */
  evidenceItemIds?: number[]
  /** Is an FDA companion test available that pertains to this Assertion. */
  fdaCompanionTest?: boolean
  /** Does the Assertion have FDA regulatory approval. */
  fdaRegulatoryApproval?: boolean
  /** The ID of the Molecular Profile to which this Assertion belongs */
  molecularProfileId?: number
  /** The internal CIViC ID of the NCCN guideline associated with this Assertion */
  nccnGuidelineId?: number
  /** The version of the NCCN Guideline specified */
  nccnGuidelineVersion?: string
  /** List of IDs of CIViC Phenotype entries for this Assertion. An empty list indicates none. */
  phenotypeIds?: number[]
  /** A brief single sentence statement summarizing the clinical significance of this Assertion. */
  summary?: string
  /** The Variant Origin for this Assertion. */
  variantOrigin?: VariantOrigin
}

export const assertionSubmitFieldsDefaults = <AssertionSubmitFields>{
  acmgCodeIds: [],
  ampLevel: undefined,
  assertionDirection: undefined,
  assertionType: undefined,
  clingenCodeIds: [],
  clinicalSignificance: undefined,
  description: undefined,
  diseaseId: undefined,
  drugIds: [],
  drugInteractionType: undefined,
  evidenceItemIds: [],
  fdaCompanionTest: undefined,
  fdaRegulatoryApproval: undefined,
  molecularProfileId: undefined,
  nccnGuidelineId: undefined,
  nccnGuidelineVersion: undefined,
  phenotypeIds: [],
  summary: undefined,
  variantOrigin: undefined,
}

export const assertionSubmitFormInitialModel: AssertionSubmitModel = {
  clientMutationId: undefined,
  fields: assertionSubmitFieldsDefaults,
  comment: undefined,
  organizationId: undefined,
}

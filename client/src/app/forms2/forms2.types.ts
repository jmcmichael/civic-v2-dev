
import {
  AssertionClinicalSignificance,
  AssertionDirection,
  AssertionType,
  DrugInteraction,
  EvidenceClinicalSignificance,
  EvidenceDirection,
  EvidenceLevel,
  EvidenceType,
  SourceSource,
  VariantOrigin,
} from '@app/generated/civic.apollo';

export type CvcInputEnum =
  | EvidenceClinicalSignificance
  | EvidenceDirection
  | EvidenceType
  | AssertionClinicalSignificance
  | AssertionDirection
  | AssertionType
  | VariantOrigin
  | SourceSource
  | EvidenceLevel
  | DrugInteraction;

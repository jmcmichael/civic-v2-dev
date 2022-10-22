
import {
  AssertionClinicalSignificance,
  AssertionDirection,
  AssertionType,
  DrugInteraction,
  EvidenceClinicalSignificance,
  EvidenceDirection,
  EvidenceLevel,
  EvidenceType,
  Maybe,
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

export type CvcFieldModelValue = Maybe<string | number | boolean | string[] | number[]>

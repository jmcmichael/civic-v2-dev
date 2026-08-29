import {
  AmpLevel,
  AssertionDirection,
  AssertionSignificance,
  AssertionType,
  EvidenceDirection,
  EvidenceLevel,
  EvidenceSignificance,
  EvidenceStatus,
  EvidenceType,
  ReferenceBuild,
  SourceSource,
  TherapyInteraction,
  VariantOrigin,
  RegionVariantName,
  VariantCategories,
} from '@app/generated/civic.apollo.types'
import { enumFormatters } from '@app/core/utilities/enum-formatters/format.common'

export type InputEnum =
  | EvidenceSignificance
  | EvidenceDirection
  | EvidenceStatus
  | EvidenceType
  | AssertionSignificance
  | AssertionDirection
  | AssertionType
  | VariantOrigin
  | SourceSource
  | EvidenceLevel
  | TherapyInteraction
  | AmpLevel
  | ReferenceBuild
  | RegionVariantName
  | VariantCategories

export function formatEvidenceEnum(value: InputEnum): string {
  if (typeof value === 'number' || typeof value === 'boolean') return value
  // evidence's own quirks; everything else, including the shared label
  // overrides, is the common title formatter's job
  if (value === 'NA') return 'Not Applicable'
  if (value === 'SENSITIVITYRESPONSE') return 'Sensitivity / Response'
  return enumFormatters.title(value)
}

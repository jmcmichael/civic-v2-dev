import {
  EvidenceDirection,
  EvidenceLevel,
  EvidenceSignificance,
  EvidenceType,
  Maybe,
  MolecularProfile,
  TherapyInteraction,
  VariantOrigin,
} from '@app/generated/civic.apollo.types'
import { WritableSignal, signal } from '@angular/core'
import { evidenceItemSubmitFieldsDefaults } from '../models/evidence-submit.model'
import {
  BaseState,
  EntityEnums,
  EntityName,
  EntityRequires,
  EntityType,
} from './base.state'

/** Keyed by each field's formly `key`; the field owns its entry. */
export type EvidenceFields = {
  molecularProfileId: WritableSignal<Maybe<number>>
  featureId: WritableSignal<Maybe<number>>
  variantId: WritableSignal<Maybe<number>>
  variantMolecularProfile: WritableSignal<Maybe<MolecularProfile>>
  variantOrigin: WritableSignal<Maybe<VariantOrigin>>
  evidenceType: WritableSignal<Maybe<EvidenceType>>
  evidenceLevel: WritableSignal<Maybe<EvidenceLevel>>
  evidenceDirection: WritableSignal<Maybe<EvidenceDirection>>
  significance: WritableSignal<Maybe<EvidenceSignificance>>
  diseaseId: WritableSignal<Maybe<number>>
  therapyIds: WritableSignal<Maybe<number[]>>
  therapyInteractionType: WritableSignal<Maybe<TherapyInteraction>>
  rating: WritableSignal<Maybe<number>>
  sourceId: WritableSignal<Maybe<number>>
  phenotypeIds: WritableSignal<Maybe<number[]>>
  description: WritableSignal<Maybe<string>>
  comment: WritableSignal<Maybe<string>>
}

class EvidenceState extends BaseState {
  readonly fields: EvidenceFields
  readonly enums: EntityEnums
  readonly requires: EntityRequires
  readonly typeField: WritableSignal<Maybe<EntityType>>

  constructor() {
    super(EntityName.EVIDENCE)

    const def = evidenceItemSubmitFieldsDefaults

    this.fields = {
      molecularProfileId: signal(def.molecularProfileId),
      variantId: signal(def.variantId),
      variantMolecularProfile: signal<Maybe<MolecularProfile>>(undefined),
      featureId: signal(def.featureId),
      evidenceType: signal(def.evidenceType),
      evidenceLevel: signal(def.evidenceLevel),
      evidenceDirection: signal(def.evidenceDirection),
      significance: signal(def.significance),
      variantOrigin: signal(def.variantOrigin),
      diseaseId: signal(def.diseaseId),
      therapyIds: signal(def.therapyIds),
      therapyInteractionType: signal(def.therapyInteractionType),
      rating: signal(def.rating),
      phenotypeIds: signal(def.phenotypeIds),
      sourceId: signal(def.sourceId),
      description: signal<Maybe<string>>(undefined),
      comment: signal<Maybe<string>>(undefined),
    }

    this.typeField = this.fields.evidenceType

    // Everything below derives from the chosen evidence type via `computed`
    // (see BaseState.forType): no push, no ordering, and no way for two
    // writers to disagree.
    this.enums = this.buildEnums(this.fields.evidenceType)
    this.requires = this.buildRequires(this.fields.evidenceType)

    this.validStates.set(EvidenceType.Predictive, {
      entityType: EvidenceType.Predictive,
      significance: [
        EvidenceSignificance.Sensitivityresponse,
        EvidenceSignificance.Resistance,
        EvidenceSignificance.AdverseResponse,
        EvidenceSignificance.ReducedSensitivity,
        EvidenceSignificance.Na,
      ],
      entityDirection: [
        EvidenceDirection.Supports,
        EvidenceDirection.DoesNotSupport,
      ],
      requiresDisease: true,
      requiresTherapy: true,
      requiresClingenCodes: false,
      requiresAcmgCodes: false,
      requiresAmpLevel: false,
      allowsFdaApproval: false,
    })

    this.validStates.set(EvidenceType.Diagnostic, {
      entityType: EvidenceType.Diagnostic,
      significance: [
        EvidenceSignificance.Positive,
        EvidenceSignificance.Negative,
      ],
      entityDirection: [
        EvidenceDirection.Supports,
        EvidenceDirection.DoesNotSupport,
      ],
      requiresDisease: true,
      requiresTherapy: false,
      requiresClingenCodes: false,
      requiresAcmgCodes: false,
      requiresAmpLevel: false,
      allowsFdaApproval: false,
    })

    this.validStates.set(EvidenceType.Prognostic, {
      entityType: EvidenceType.Prognostic,
      significance: [
        EvidenceSignificance.BetterOutcome,
        EvidenceSignificance.PoorOutcome,
        EvidenceSignificance.Na,
      ],
      entityDirection: [
        EvidenceDirection.Supports,
        EvidenceDirection.DoesNotSupport,
      ],
      requiresDisease: true,
      requiresTherapy: false,
      requiresClingenCodes: false,
      requiresAcmgCodes: false,
      requiresAmpLevel: false,
      allowsFdaApproval: false,
    })

    this.validStates.set(EvidenceType.Oncogenic, {
      entityType: EvidenceType.Oncogenic,
      significance: [
        EvidenceSignificance.Oncogenicity,
        EvidenceSignificance.Protectiveness,
      ],
      entityDirection: [
        EvidenceDirection.Supports,
        EvidenceDirection.DoesNotSupport,
      ],
      requiresDisease: true,
      requiresTherapy: false,
      requiresClingenCodes: false,
      requiresAcmgCodes: false,
      requiresAmpLevel: false,
      allowsFdaApproval: false,
    })

    this.validStates.set(EvidenceType.Predisposing, {
      entityType: EvidenceType.Predisposing,
      significance: [
        EvidenceSignificance.Predisposition,
        EvidenceSignificance.Protectiveness,
      ],
      entityDirection: [
        EvidenceDirection.Supports,
        EvidenceDirection.DoesNotSupport,
      ],
      requiresDisease: true,
      requiresTherapy: false,
      requiresClingenCodes: false,
      requiresAcmgCodes: false,
      requiresAmpLevel: false,
      allowsFdaApproval: false,
    })

    this.validStates.set(EvidenceType.Functional, {
      entityType: EvidenceType.Functional,
      significance: [
        EvidenceSignificance.GainOfFunction,
        EvidenceSignificance.LossOfFunction,
        EvidenceSignificance.UnalteredFunction,
        EvidenceSignificance.Neomorphic,
        EvidenceSignificance.DominantNegative,
        EvidenceSignificance.Unknown,
      ],
      entityDirection: [
        EvidenceDirection.Supports,
        EvidenceDirection.DoesNotSupport,
      ],
      requiresDisease: false,
      requiresTherapy: false,
      requiresAcmgCodes: false,
      requiresClingenCodes: false,
      requiresAmpLevel: false,
      allowsFdaApproval: false,
    })
  }
}

export { EvidenceState }

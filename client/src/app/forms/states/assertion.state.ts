import {
  AssertionDirection,
  AssertionSignificance,
  AssertionType,
  Maybe,
  MolecularProfile,
  VariantOrigin,
  TherapyInteraction,
  AmpLevel,
} from '@app/generated/civic.apollo.types'
import { Signal, WritableSignal, computed, signal } from '@angular/core'
import { CvcInputEnum } from '../forms.types'
import { assertionSubmitFieldsDefaults } from '../models/assertion-submit.model'
import {
  BaseState,
  EntityEnums,
  EntityName,
  EntityRequires,
} from './base.state'

/** Keyed by each field's formly `key`; the field owns its entry. */
export type AssertionFields = {
  molecularProfileId: WritableSignal<Maybe<number>>
  evidenceItemIds: WritableSignal<Maybe<number[]>>
  geneId: WritableSignal<Maybe<number>>
  variantId: WritableSignal<Maybe<number>>
  variantMolecularProfile: WritableSignal<Maybe<MolecularProfile>>
  variantOrigin: WritableSignal<Maybe<VariantOrigin>>
  assertionType: WritableSignal<Maybe<AssertionType>>
  assertionDirection: WritableSignal<Maybe<AssertionDirection>>
  significance: WritableSignal<Maybe<AssertionSignificance>>
  diseaseId: WritableSignal<Maybe<number>>
  therapyIds: WritableSignal<Maybe<number[]>>
  therapyInteractionType: WritableSignal<Maybe<TherapyInteraction>>
  phenotypeIds: WritableSignal<Maybe<number[]>>
  nccnGuidelineId: WritableSignal<Maybe<number>>
  fdaRegulatoryApproval: WritableSignal<Maybe<boolean>>
  fdaCompanionTest: WritableSignal<Maybe<boolean>>
  ampLevel: WritableSignal<Maybe<AmpLevel>>
  acmgCodeIds: WritableSignal<Maybe<number[]>>
  clingenCodeIds: WritableSignal<Maybe<number[]>>
  nccnGuidelineVersion: WritableSignal<Maybe<string>>
  summary: WritableSignal<Maybe<string>>
  description: WritableSignal<Maybe<string>>
  comment: WritableSignal<Maybe<string>>
}

class AssertionState extends BaseState {
  fields: AssertionFields
  enums: EntityEnums
  requires: EntityRequires

  constructor() {
    super(EntityName.ASSERTION)
    const def = assertionSubmitFieldsDefaults

    this.fields = {
      molecularProfileId: signal(def.molecularProfileId),
      variantMolecularProfile: signal<Maybe<MolecularProfile>>(undefined),
      geneId: signal<Maybe<number>>(undefined),
      variantId: signal<Maybe<number>>(undefined),
      variantOrigin: signal(def.variantOrigin),
      assertionType: signal(def.assertionType),
      assertionDirection: signal(def.assertionDirection),
      evidenceItemIds: signal(def.evidenceItemIds),
      significance: signal(def.significance),
      diseaseId: signal(def.diseaseId),
      therapyIds: signal(def.therapyIds),
      therapyInteractionType: signal(def.therapyInteractionType),
      phenotypeIds: signal(def.phenotypeIds),
      nccnGuidelineId: signal(def.nccnGuidelineId),
      fdaRegulatoryApproval: signal(def.fdaRegulatoryApproval),
      fdaCompanionTest: signal(def.fdaCompanionTest),
      ampLevel: signal(def.ampLevel),
      acmgCodeIds: signal(def.acmgCodeIds),
      clingenCodeIds: signal(def.clingenCodeIds),
      nccnGuidelineVersion: signal(def.nccnGuidelineVersion),
      // summary had no slot for years and connectStateField warned on every
      // assertion-form load; the field's key is 'summary' in both the submit
      // and revise configs
      summary: signal<Maybe<string>>(undefined),
      description: signal<Maybe<string>>(undefined),
      comment: signal<Maybe<string>>(undefined),
    }

    // Everything below derives from the chosen assertion type via `computed`
    // (see BaseState.forType): no push, no ordering, and no way for two
    // writers to disagree.
    this.enums = this.buildEnums(this.fields.assertionType)
    this.requires = this.buildRequires(this.fields.assertionType)

    this.validStates.set(AssertionType.Predictive, {
      entityType: AssertionType.Predictive,
      significance: [
        AssertionSignificance.Sensitivityresponse,
        AssertionSignificance.Resistance,
        AssertionSignificance.AdverseResponse,
        AssertionSignificance.ReducedSensitivity,
        AssertionSignificance.Na,
      ],
      entityDirection: [
        AssertionDirection.Supports,
        AssertionDirection.DoesNotSupport,
      ],
      requiresDisease: true,
      requiresTherapy: true,
      requiresClingenCodes: false,
      requiresAcmgCodes: false,
      requiresAmpLevel: true,
      allowsFdaApproval: true,
    })

    this.validStates.set(AssertionType.Diagnostic, {
      entityType: AssertionType.Diagnostic,
      significance: [
        AssertionSignificance.Positive,
        AssertionSignificance.Negative,
      ],
      entityDirection: [
        AssertionDirection.Supports,
        AssertionDirection.DoesNotSupport,
      ],
      requiresDisease: true,
      requiresTherapy: false,
      requiresClingenCodes: false,
      requiresAcmgCodes: false,
      requiresAmpLevel: true,
      allowsFdaApproval: false,
    })

    this.validStates.set(AssertionType.Prognostic, {
      entityType: AssertionType.Prognostic,
      significance: [
        AssertionSignificance.BetterOutcome,
        AssertionSignificance.PoorOutcome,
        AssertionSignificance.Na,
      ],
      entityDirection: [
        AssertionDirection.Supports,
        AssertionDirection.DoesNotSupport,
      ],
      requiresDisease: true,
      requiresTherapy: false,
      requiresClingenCodes: false,
      requiresAcmgCodes: false,
      requiresAmpLevel: true,
      allowsFdaApproval: false,
    })

    this.validStates.set(AssertionType.Predisposing, {
      entityType: AssertionType.Predisposing,
      significance: [
        AssertionSignificance.Pathogenic,
        AssertionSignificance.LikelyPathogenic,
        AssertionSignificance.Benign,
        AssertionSignificance.LikelyBenign,
        AssertionSignificance.UncertainSignificance,
      ],
      entityDirection: [AssertionDirection.Supports],
      requiresDisease: true,
      requiresTherapy: false,
      requiresClingenCodes: false,
      requiresAcmgCodes: true,
      requiresAmpLevel: false,
      allowsFdaApproval: false,
    })

    this.validStates.set(AssertionType.Oncogenic, {
      entityType: AssertionType.Oncogenic,
      significance: [
        AssertionSignificance.Oncogenic,
        AssertionSignificance.LikelyOncogenic,
        AssertionSignificance.Benign,
        AssertionSignificance.LikelyBenign,
        AssertionSignificance.UncertainSignificance,
      ],
      entityDirection: [AssertionDirection.Supports],
      requiresDisease: true,
      requiresTherapy: false,
      requiresClingenCodes: true,
      requiresAcmgCodes: false,
      requiresAmpLevel: false,
      allowsFdaApproval: false,
    })
  }
}

export { AssertionState }

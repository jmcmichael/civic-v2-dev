import {
  EvidenceClinicalSignificance,
  EvidenceDirection,
  EvidenceType,
  Maybe,
} from '@app/generated/civic.apollo'
import { BehaviorSubject } from 'rxjs'
import { evidenceItemStateFieldsDefaults } from '../models/evidence-fields.model'
import { EntityName, EntityState, SelectOption } from './entity.state'

export type EvidenceFieldSubjectMap = {
  geneId$: BehaviorSubject<Maybe<number>>
  variantId$: BehaviorSubject<Maybe<number>>
  evidenceType$: BehaviorSubject<Maybe<EvidenceType>>
  evidenceDirection$: BehaviorSubject<Maybe<EvidenceDirection>>
  clinicalSignificance$: BehaviorSubject<Maybe<EvidenceClinicalSignificance>>
}

export type EvidenceOptionsSubjectMap = {
  evidenceTypeOption$: BehaviorSubject<SelectOption[]>
  clinicalSignificanceOption$: BehaviorSubject<Maybe<SelectOption[]>>
  evidenceDirectionOption$: BehaviorSubject<Maybe<SelectOption[]>>
}

export type EvidenceRequiresSubjectMap = {
  requiresDisease$: BehaviorSubject<boolean>
  requiresDrug$: BehaviorSubject<boolean>
  requiresClingenCodes$: BehaviorSubject<boolean>
  requiresAcmgCodes$: BehaviorSubject<boolean>
  requiresAmpLevel$: BehaviorSubject<boolean>
  allowsFdaApproval$: BehaviorSubject<boolean>
}

class EvidenceState extends EntityState {
  fields: EvidenceFieldSubjectMap
  options: EvidenceOptionsSubjectMap
  requires: EvidenceRequiresSubjectMap

  constructor() {
    super(EntityName.EVIDENCE)

    const def = evidenceItemStateFieldsDefaults

    this.fields = {
      geneId$: new BehaviorSubject<Maybe<number>>(def.geneId),
      variantId$: new BehaviorSubject<Maybe<number>>(def.variantId),
      evidenceType$: new BehaviorSubject<Maybe<EvidenceType>>(def.evidenceType),
      evidenceDirection$: new BehaviorSubject<Maybe<EvidenceDirection>>(
        def.evidenceDirection
      ),
      clinicalSignificance$: new BehaviorSubject<
        Maybe<EvidenceClinicalSignificance>
      >(def.clinicalSignificance),
    }

    this.options = {
      evidenceTypeOption$: new BehaviorSubject<SelectOption[]>(
        this.getOptionsFromEnums(this.getTypeOptions())
      ),
      evidenceDirectionOption$: new BehaviorSubject<Maybe<SelectOption[]>>(
        undefined
      ),
      clinicalSignificanceOption$: new BehaviorSubject<Maybe<SelectOption[]>>(
        undefined
      ),
    }

    this.requires = {
      requiresDisease$: new BehaviorSubject<boolean>(false),
      requiresDrug$: new BehaviorSubject<boolean>(false),
      requiresClingenCodes$: new BehaviorSubject<boolean>(false),
      requiresAcmgCodes$: new BehaviorSubject<boolean>(false),
      requiresAmpLevel$: new BehaviorSubject<boolean>(false),
      allowsFdaApproval$: new BehaviorSubject<boolean>(false),
    }

    // EVIDENCE TYPE SUBSCRIBERS
    this.fields.evidenceType$.subscribe((et: Maybe<EvidenceType>) => {
      if (!et) return
      this.options.clinicalSignificanceOption$.next(
        this.getOptionsFromEnums(this.getSignificanceOptions(et))
      )
    })

    this.fields.evidenceType$.subscribe((et: Maybe<EvidenceType>) => {
      if (!et) return
      this.options.evidenceDirectionOption$.next(
        this.getOptionsFromEnums(this.getDirectionOptions(et))
      )
    })

    this.validStates.set(EvidenceType.Predictive, {
      entityType: EvidenceType.Predictive,
      clinicalSignificance: [
        EvidenceClinicalSignificance.Sensitivityresponse,
        EvidenceClinicalSignificance.Resistance,
        EvidenceClinicalSignificance.AdverseResponse,
        EvidenceClinicalSignificance.ReducedSensitivity,
        EvidenceClinicalSignificance.Na,
      ],
      entityDirection: [
        EvidenceDirection.Supports,
        EvidenceDirection.DoesNotSupport,
      ],
      requiresDisease: true,
      requiresDrug: true,
      requiresClingenCodes: false,
      requiresAcmgCodes: false,
      requiresAmpLevel: false,
      allowsFdaApproval: false,
    })

    this.validStates.set(EvidenceType.Diagnostic, {
      entityType: EvidenceType.Diagnostic,
      clinicalSignificance: [
        EvidenceClinicalSignificance.Positive,
        EvidenceClinicalSignificance.Negative,
      ],
      entityDirection: [
        EvidenceDirection.Supports,
        EvidenceDirection.DoesNotSupport,
      ],
      requiresDisease: true,
      requiresDrug: false,
      requiresClingenCodes: false,
      requiresAcmgCodes: false,
      requiresAmpLevel: false,
      allowsFdaApproval: false,
    })

    this.validStates.set(EvidenceType.Prognostic, {
      entityType: EvidenceType.Prognostic,
      clinicalSignificance: [
        EvidenceClinicalSignificance.BetterOutcome,
        EvidenceClinicalSignificance.PoorOutcome,
        EvidenceClinicalSignificance.Na,
      ],
      entityDirection: [
        EvidenceDirection.Supports,
        EvidenceDirection.DoesNotSupport,
      ],
      requiresDisease: true,
      requiresDrug: false,
      requiresClingenCodes: false,
      requiresAcmgCodes: false,
      requiresAmpLevel: false,
      allowsFdaApproval: false,
    })

    this.validStates.set(EvidenceType.Oncogenic, {
      entityType: EvidenceType.Oncogenic,
      clinicalSignificance: [
        EvidenceClinicalSignificance.Oncogenicity,
        EvidenceClinicalSignificance.Protectiveness,
      ],
      entityDirection: [
        EvidenceDirection.Supports,
        EvidenceDirection.DoesNotSupport,
      ],
      requiresDisease: true,
      requiresDrug: false,
      requiresClingenCodes: false,
      requiresAcmgCodes: false,
      requiresAmpLevel: false,
      allowsFdaApproval: false,
    })

    this.validStates.set(EvidenceType.Predisposing, {
      entityType: EvidenceType.Predisposing,
      clinicalSignificance: [
        EvidenceClinicalSignificance.Predisposition,
        EvidenceClinicalSignificance.Protectiveness,
      ],
      entityDirection: [
        EvidenceDirection.Supports,
        EvidenceDirection.DoesNotSupport,
      ],
      requiresDisease: true,
      requiresDrug: false,
      requiresClingenCodes: false,
      requiresAcmgCodes: false,
      requiresAmpLevel: false,
      allowsFdaApproval: false,
    })

    this.validStates.set(EvidenceType.Functional, {
      entityType: EvidenceType.Functional,
      clinicalSignificance: [
        EvidenceClinicalSignificance.GainOfFunction,
        EvidenceClinicalSignificance.LossOfFunction,
        EvidenceClinicalSignificance.UnalteredFunction,
        EvidenceClinicalSignificance.Neomorphic,
        EvidenceClinicalSignificance.DominantNegative,
        EvidenceClinicalSignificance.Unknown,
      ],
      entityDirection: [
        EvidenceDirection.Supports,
        EvidenceDirection.DoesNotSupport,
      ],
      requiresDisease: false,
      requiresDrug: false,
      requiresAcmgCodes: false,
      requiresClingenCodes: false,
      requiresAmpLevel: false,
      allowsFdaApproval: false,
    })
  }
}

export { EvidenceState }

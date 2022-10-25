import {
  EvidenceClinicalSignificance,
  EvidenceDirection,
  EvidenceType,
  Maybe,
} from '@app/generated/civic.apollo'
import { NzSelectOptionInterface } from 'ng-zorro-antd/select'
import { BehaviorSubject } from 'rxjs'
import { CvcInputEnum } from '../forms2.types'
import { evidenceItemSubmitFieldsDefaults } from '../models/evidence-submit.model'
import { EntityName, EntityState } from './entity.state'

export type EvidenceFields = {
  geneId$: BehaviorSubject<Maybe<number>>
  variantId$: BehaviorSubject<Maybe<number>>
  evidenceType$: BehaviorSubject<Maybe<EvidenceType>>
  evidenceDirection$: BehaviorSubject<Maybe<EvidenceDirection>>
  clinicalSignificance$: BehaviorSubject<Maybe<EvidenceClinicalSignificance>>
  diseaseId$: BehaviorSubject<Maybe<number>>
  drugIds$: BehaviorSubject<Maybe<number[]>>
}

export type EvidenceEnums = {
  entityType$: BehaviorSubject<CvcInputEnum[]>
  clinicalSignificance$: BehaviorSubject<CvcInputEnum[]>
  direction$: BehaviorSubject<CvcInputEnum[]>
  interaction$: BehaviorSubject<CvcInputEnum[]>
}

export type EvidenceRequires = {
  requiresDisease$: BehaviorSubject<boolean>
  requiresDrug$: BehaviorSubject<boolean>
  requiresClingenCodes$: BehaviorSubject<boolean>
  requiresAcmgCodes$: BehaviorSubject<boolean>
  requiresAmpLevel$: BehaviorSubject<boolean>
  allowsFdaApproval$: BehaviorSubject<boolean>
}

class EvidenceState extends EntityState {
  fields: EvidenceFields
  enums: EvidenceEnums
  requires: EvidenceRequires

  constructor() {
    super(EntityName.EVIDENCE)

    const def = evidenceItemSubmitFieldsDefaults

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
      diseaseId$: new BehaviorSubject<Maybe<number>>(def.diseaseId),
      drugIds$: new BehaviorSubject<Maybe<number[]>>(def.drugIds),
    }

    this.enums = {
      entityType$: new BehaviorSubject<CvcInputEnum[]>(this.getTypeOptions()),
      clinicalSignificance$: new BehaviorSubject<CvcInputEnum[]>([]),
      direction$: new BehaviorSubject<CvcInputEnum[]>([]),
      interaction$: new BehaviorSubject<CvcInputEnum[]>(this.getInteractionOptions()),
    }

    this.requires = {
      requiresDisease$: new BehaviorSubject<boolean>(false),
      requiresDrug$: new BehaviorSubject<boolean>(false),
      requiresClingenCodes$: new BehaviorSubject<boolean>(false),
      requiresAcmgCodes$: new BehaviorSubject<boolean>(false),
      requiresAmpLevel$: new BehaviorSubject<boolean>(false),
      allowsFdaApproval$: new BehaviorSubject<boolean>(false),
    }

    // TODO: must determine best way to unsubscribe from this
    // EVIDENCE TYPE SUBSCRIBER
    this.fields.evidenceType$.subscribe((et: Maybe<EvidenceType>) => {
      if (!et) {
        // set all 'requires' fields to false, non-type enums to []
        Object.entries(this.requires).forEach(([key, value]) => {
          value.next(false)
        })
        this.enums.clinicalSignificance$.next([])
        this.enums.direction$.next([])
        return
      }
      this.enums.clinicalSignificance$.next(this.getSignificanceOptions(et))
      this.enums.direction$.next(this.getDirectionOptions(et))

      this.requires.requiresDisease$.next(this.requiresDisease(et))
      this.requires.requiresDrug$.next(this.requiresDrug(et))
      this.requires.requiresClingenCodes$.next(this.requiresClingenCodes(et))
      this.requires.requiresAcmgCodes$.next(this.requiresAcmgCodes(et))
      this.requires.allowsFdaApproval$.next(this.allowsFdaApproval(et))
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

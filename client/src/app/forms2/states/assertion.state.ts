import {
  AssertionClinicalSignificance,
  AssertionDirection,
  AssertionType,
  Maybe,
} from "@app/generated/civic.apollo";
import {  BehaviorSubject } from "rxjs";
import { assertionSubmitFieldsDefaults } from "../models/assertion-submit.model";
import { EntityName, EntityState } from "./entity.state";

class AssertionState extends EntityState {
  constructor() {
    super(EntityName.ASSERTION);
    const def = assertionSubmitFieldsDefaults
    this.fields = {
      geneId$: new BehaviorSubject<Maybe<number>>(def.geneId),
      variantId$: new BehaviorSubject<Maybe<number>>(def.variantId),
    }
    this.validStates.set(AssertionType.Predictive, {
      entityType: AssertionType.Predictive,
      clinicalSignificance: [
        AssertionClinicalSignificance.Sensitivityresponse,
        AssertionClinicalSignificance.Resistance,
        AssertionClinicalSignificance.AdverseResponse,
        AssertionClinicalSignificance.ReducedSensitivity,
        AssertionClinicalSignificance.Na,
      ],
      entityDirection: [
        AssertionDirection.Supports,
        AssertionDirection.DoesNotSupport
      ],
      requiresDisease: true,
      requiresDrug: true,
      requiresClingenCodes: false,
      requiresAcmgCodes: false,
      requiresAmpLevel: true,
      allowsFdaApproval: true
    });

    this.validStates.set(AssertionType.Diagnostic, {
      entityType: AssertionType.Diagnostic,
      clinicalSignificance: [
        AssertionClinicalSignificance.Positive,
        AssertionClinicalSignificance.Negative,
      ],
      entityDirection: [
        AssertionDirection.Supports,
        AssertionDirection.DoesNotSupport
      ],
      requiresDisease: true,
      requiresDrug: false,
      requiresClingenCodes: false,
      requiresAcmgCodes: false,
      requiresAmpLevel: true,
      allowsFdaApproval: false
    });

    this.validStates.set(AssertionType.Prognostic, {
      entityType: AssertionType.Prognostic,
      clinicalSignificance: [
        AssertionClinicalSignificance.BetterOutcome,
        AssertionClinicalSignificance.PoorOutcome,
        AssertionClinicalSignificance.Na
      ],
      entityDirection: [
        AssertionDirection.Supports,
        AssertionDirection.DoesNotSupport
      ],
      requiresDisease: true,
      requiresDrug: false,
      requiresClingenCodes: false,
      requiresAcmgCodes: false,
      requiresAmpLevel: true,
      allowsFdaApproval: false
    });

    this.validStates.set(AssertionType.Predisposing, {
      entityType: AssertionType.Predisposing,
      clinicalSignificance: [
        AssertionClinicalSignificance.Pathogenic,
        AssertionClinicalSignificance.LikelyPathogenic,
        AssertionClinicalSignificance.Benign,
        AssertionClinicalSignificance.LikelyBenign,
        AssertionClinicalSignificance.UncertainSignificance,
      ],
      entityDirection: [
        AssertionDirection.Supports,
        AssertionDirection.DoesNotSupport,
      ],
      requiresDisease: true,
      requiresDrug: false,
      requiresClingenCodes: false,
      requiresAcmgCodes: true,
      requiresAmpLevel: false,
      allowsFdaApproval: false
    });

    this.validStates.set(AssertionType.Oncogenic, {
      entityType: AssertionType.Oncogenic,
      clinicalSignificance: [
        AssertionClinicalSignificance.Oncogenic,
        AssertionClinicalSignificance.LikelyOncogenic,
        AssertionClinicalSignificance.Benign,
        AssertionClinicalSignificance.LikelyBenign,
        AssertionClinicalSignificance.UncertainSignificance,
      ],
      entityDirection: [
        AssertionDirection.Supports,
        AssertionDirection.DoesNotSupport,
      ],
      requiresDisease: true,
      requiresDrug: false,
      requiresClingenCodes: true,
      requiresAcmgCodes: false,
      requiresAmpLevel: false,
      allowsFdaApproval: false
    });
  }
}

export { AssertionState };

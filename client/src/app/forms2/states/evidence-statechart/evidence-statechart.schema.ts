// based on:
// https://github.com/stefanoslig/xstate-angular/blob/main/apps/conduit/src/app/article-list/%2Bxstate/article-list-machine.schema.ts

import { EvidenceItemStateFields } from '@app/forms2/models/evidence-fields.model'

export interface EvidenceItemStateSchema {
  states: {
    Gene: {
    } // Gene
    Variant: {
    } // Variant
    // MolecularProfile: {} // MP
    // Source: {} // Source
    // VariantOrigin: {
    //   states: {
    //     COMMON_GERMLINE: {}
    //     NA: {}
    //     RARE_GERMLINE: {}
    //     SOMATIC: {}
    //     UNKNOWN: {}
    //   }
    // }
    // EvidenceType: {
    //   states: {
    //     DIAGNOSTIC: {}
    //     FUNCTIONAL: {}
    //     ONCOGENIC: {}
    //     PREDICTIVE: {}
    //     PREDISPOSING: {}
    //     PROGNOSTIC: {}
    //   }
    // }
    // EvidenceClinicalSignificance: {
    //   states: {
    //     ADVERSE_RESPONSE: {}
    //     BENIGN: {}
    //     BETTER_OUTCOME: {}
    //     DOMINANT_NEGATIVE: {}
    //     GAIN_OF_FUNCTION: {}
    //     LIKELY_BENIGN: {}
    //     LIKELY_PATHOGENIC: {}
    //     LOSS_OF_FUNCTION: {}
    //     NA: {}
    //     NEGATIVE: {}
    //     NEOMORPHIC: {}
    //     ONCOGENICITY: {}
    //     PATHOGENIC: {}
    //     POOR_OUTCOME: {}
    //     POSITIVE: {}
    //     PREDISPOSITION: {}
    //     PROTECTIVENESS: {}
    //     REDUCED_SENSITIVITY: {}
    //     RESISTANCE: {}
    //     SENSITIVITYRESPONSE: {}
    //     UNALTERED_FUNCTION: {}
    //     UNCERTAIN_SIGNIFICANCE: {}
    //     UNKNOWN: {}
    //   }
    // }
    // Drug: {
    //   states: {
    //     SINGLE: {}
    //     MULTIPLE: {}
    //   }
    // }
    // DrugInteractionType: {
    //   states: {
    //     COMBINATION: {}
    //     SEQUENTIAL: {}
    //     SUBSTITUTES: {}
    //   }
    // }
    // EvidenceDirection: {
    //   states: {
    //     DOES_NOT_SUPPORT: {}
    //     SUPPORTS: {}
    //     NA: {}
    //   }
    // }
    // EvidenceLevel: {
    //   states: {
    //     A: {}
    //     B: {}
    //     C: {}
    //     D: {}
    //     E: {}
    //   }
    // }
    // Phenotype: {
    // }
    // Rating: {

    // }
  }
}

export interface EvidenceItemStateContext {
  fields: EvidenceItemStateFields
}

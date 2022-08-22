// based on:
// https://github.com/stefanoslig/xstate-angular/blob/main/apps/conduit/src/app/article-list/%2Bxstate/article-list-machine.schema.ts

import { EvidenceItemStateFields } from '@app/forms2/models/evidence-fields.model'

export interface EvidenceItemStateSchema {
  id: 'EvidenceItem'
  states: {
    initial: {}
    // initial if molecular profile, source not set
    Region: {} // Gene
    Variant: {} // Variant
    MolecularProfile: {} // MP
    Source: {} // Source
    characterized: {
      // characterized if molecular profile, source set
      states: {
        related: {
          // has items with the same characterization (mp, source) exist
        }
        VariantOrigin: {
          // VariantOrigin
          states: {
            COMMON_GERMLINE: {}
            RARE_GERMLINE: {}
            SOMATIC: {}
            UNKNOWN: {}
            NA: {}
          }
        }

        EvidenceType: {
          // EvidenceItemType
          // typed if characterized, and evidence type specified
          states: {
            diagnostic: {
              states: {
                ClinicalSignificance: {
                  states: {
                    SENSITIVITYRESPONSE: {}
                    RESISTANCE: {}
                    ADVERSE_RESPONSE: {}
                    REDUCED_SENSITIVITY: {}
                    EvidenceDirection: {}
                  }
                }
              }
            }
            functional: {}
            oncogenic: {}
            predictive: {}
            predisposing: {}
            prognostic: {}

            IDENTIFIED: {
              // identified if typed and disease, drug set
              states: {
                SPECIFIED: {
                  // specified if identified & all required fields are set
                  states: {
                    // PARALELL STATE
                    COMPLETE: {}
                    // complete if specified, and all optional fields set
                    CURATED: {
                      states: {
                        PENDING: {}
                        APPROVED: {}
                        REJECTED: {}
                        REVISED: {}
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

export interface EvidenceItemStateContext {
  fields: EvidenceItemStateFields
  curation: {
    isLocated: boolean
    isIdentified: boolean
    isCharacterized: boolean
    isComplete: boolean
    isCurated: boolean
    isSubmitted: boolean
    isApproved: boolean
    isRejected: boolean
    isRevised: boolean
  }
}

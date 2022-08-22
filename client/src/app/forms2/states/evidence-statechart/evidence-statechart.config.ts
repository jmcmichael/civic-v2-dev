// to be based on: https://github.com/stefanoslig/xstate-angular/blob/main/apps/conduit/src/app/article-list/%2Bxstate/article-list-machine.config.ts

import { Injectable } from '@angular/core'
import { evidenceItemStateFieldsDefaults } from '@app/forms2/models/evidence-fields.model'
import { Machine } from 'xstate'
import { XstateAngular } from 'xstate-angular'
import { EvidenceItemStateEvent } from './evidence-statechart.events'
import {
    EvidenceItemStateContext,
    EvidenceItemStateSchema
} from './evidence-statechart.schema'

// export const articleListInitialContext: ArticleListMachineContext = {
//   articles: [],
//   config: {
//     currentPage: 1,
//     filters: {
//       limit: 10,
//     },
//   },
// };

@Injectable()
export class EvidenceItemStateService {
  constructor(
    private xstateAngular: XstateAngular<
      EvidenceItemStateContext,
      EvidenceItemStateSchema,
      EvidenceItemStateEvent
    >
  ) {}

  // const machine: StateMachine<EvidenceItemStateContext, EvidenceItemStateSchema, EvidenceItemStateEvent> = Machine<EvidenceItemStateContext

  private eidMachine = Machine<
    EvidenceItemStateContext,
    EvidenceItemStateSchema,
    EvidenceItemStateEvent
  >(
    {
      id: 'EvidenceItem',
      context: <EvidenceItemStateContext>{
        fields: evidenceItemStateFieldsDefaults,
      },
      initial: 'Gene',
      states: {
        Gene: {
          id: 'geneId'
        },
        Variant: {
          id: 'variantId'
        }
      }
    }
    // {
    //   id: 'EvidenceItem',
    //   context: <EvidenceItemStateContext>{
    //     fields: evidenceItemStateFieldsDefaults,
    //   },
    //   initial: 'Gene',
    //   states: {
    //     Gene: {
    //       on: {

    //       }
    //     }
    //   }
    // }
  )
  // evidenceItemStateMachine = this.xstateAngular.useMachine(), {
  //   devTools: !environment.production,
  // })
}

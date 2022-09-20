// to be based on: https://github.com/stefanoslig/xstate-angular/blob/main/apps/conduit/src/app/article-list/%2Bxstate/article-list-machine.config.ts

import { Injectable } from '@angular/core'
import { evidenceItemSubmitFieldsDefaults } from '@app/forms2/models/evidence-submit.model'
import { environment } from 'environments/environment'
import {
  InterpreterOptions,
  Machine,
  MachineConfig,
  MachineOptions,
  StateMachine,
} from 'xstate'
import {
  InterpretedService,
  UseMachineOptions,
  XstateAngular,
} from 'xstate-angular'
import { EvidenceItemStateEvent } from './evidence-statechart.events'
import {
  EvidenceItemStateContext,
  EvidenceItemStateSchema,
} from './evidence-statechart.schema'

@Injectable()
export class EvidenceItemStateService {
  config: MachineConfig<
    EvidenceItemStateContext,
    EvidenceItemStateSchema,
    EvidenceItemStateEvent
  >
  machine: StateMachine<
    EvidenceItemStateContext,
    EvidenceItemStateSchema,
    EvidenceItemStateEvent
  >

  service: InterpretedService<
    EvidenceItemStateContext,
    EvidenceItemStateSchema,
    EvidenceItemStateEvent
  >
  options: Partial<InterpreterOptions> &
    Partial<
      UseMachineOptions<EvidenceItemStateContext, EvidenceItemStateEvent>
    > &
    Partial<MachineOptions<EvidenceItemStateContext, EvidenceItemStateEvent>>

  constructor(
    private xstateAngular: XstateAngular<
      EvidenceItemStateContext,
      EvidenceItemStateSchema,
      EvidenceItemStateEvent
    >
  ) {
    this.config = <EvidenceItemStateSchema>{
      id: 'EvidenceItem',
      context: <EvidenceItemStateContext>{
        fields: evidenceItemSubmitFieldsDefaults,
      },
      initial: 'initial',
      states: {
        initial: {},
        Gene: {
          id: 'geneId',
        },
        Variant: {
          id: 'variantId',
        },
      },
    }

    this.options = {
      actions: {},
      services: {}
    }

    this.machine = Machine<
      EvidenceItemStateContext,
      EvidenceItemStateSchema,
      EvidenceItemStateEvent
    >(this.config, this.options)

    this.service = this.xstateAngular.useMachine(this.machine, {
      devTools: !environment.production,
    })
  }
}

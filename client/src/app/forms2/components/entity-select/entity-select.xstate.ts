import { Maybe } from '@app/generated/civic.apollo'
import { NzSelectOptionInterface } from 'ng-zorro-antd/select'
import { BehaviorSubject, Subject } from 'rxjs'
import { createMachine, StateMachine } from 'xstate'
import { CvcEntitySelectMessageMode } from './entity-select.component'

export interface EntitySelectContext {}

export type EntitySelectEvent =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'LOAD' }
  | { type: 'SUCCESS'; options: NzSelectOptionInterface[] }
  | { type: 'FAIL' }
  | { type: 'ERROR' }

export interface EntitySelectSchema {
  states: {
    idle: {}
    loading: {}
    options: {}
    empty: {}
    error: {}
  }
}

export type EntitySelectTypestate =
  | {
      value: 'idle'
      context: EntitySelectContext
    }
  | {
      value: 'loading'
      context: EntitySelectContext
    }
  | {
      value: 'options'
      context: EntitySelectContext & { options: NzSelectOptionInterface[] }
    }
  | {
      value: 'empty'
      context: EntitySelectContext
    }
  | {
      value: 'error'
      context: EntitySelectContext
    }

export function getEntitySelectMachine(
  onMessageMode: BehaviorSubject<Maybe<CvcEntitySelectMessageMode>>
): StateMachine<EntitySelectContext, EntitySelectSchema, EntitySelectEvent> {
  return createMachine<
    EntitySelectContext,
    EntitySelectEvent,
    EntitySelectTypestate,
    any,
    any
  >(
    {
      predictableActionArguments: true,
      tsTypes: {} as import('./entity-select.xstate.typegen').Typegen0,
      id: 'entity-select',
      initial: 'idle',
      states: {
        idle: {
          entry: ['emitMessageMode'],
          on: {
            LOAD: 'loading',
          },
        },
        loading: {
          entry: ['emitMessageMode'],
          on: {
            SUCCESS: 'options',
            FAIL: 'empty',
            ERROR: 'error',
            CLOSE: 'idle',
          },
        },
        options: {
          entry: ['emitMessageMode'],
          on: {
            CLOSE: 'idle',
            LOAD: 'loading',
          },
        },
        empty: {
          entry: ['emitMessageMode'],
          on: {
            LOAD: 'loading',
          }
        },
        error: {
          entry: ['emitMessageMode'],
          on: {
            LOAD: 'loading',
          }
        },
        // open: {
        //   initial: 'entering',
        //   entry: ['emitMessageMode'],
        //   on: {
        //     CLOSE: 'idle',
        //     LOAD: 'open.loading',
        //   },
        //   states: {
        //     entering: {
        //       entry: ['emitMessageMode'],
        //     },
        //     loading: {
        //       entry: ['emitMessageMode'],
        //       on: {
        //         SUCCESS: 'options',
        //         FAIL: 'empty',
        //         ERROR: 'error',
        //       },
        //     },
        //     options: {
        //       entry: ['emitMessageMode'],
        //     },
        //     empty: {
        //       entry: ['emitMessageMode'],
        //     },
        //     error: {
        //       entry: ['emitMessageMode'],
        //     },
        //   },
        // },
      },
    },
    {
      actions: {
        emitMessageMode: (
          _context: EntitySelectContext,
          event: EntitySelectEvent
        ) => {
          switch (event.type) {
            case 'OPEN':
              onMessageMode.next('entering')
              break
            case 'LOAD':
              onMessageMode.next('loading')
              break
            case 'SUCCESS':
              onMessageMode.next('options')
              break
            case 'FAIL':
              onMessageMode.next('empty')
              break
            case 'ERROR':
              onMessageMode.next('error')
              break
            default:
              onMessageMode.next('idle')
          }
        },
        log: (context: EntitySelectContext, event: EntitySelectEvent) => {
          console.log(
            'entity-select.component state.actions.log():',
            context,
            event
          )
        },
      },
    }
  )
}

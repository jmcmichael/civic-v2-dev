import { NzSelectOptionInterface } from 'ng-zorro-antd/select'
import { Subject } from 'rxjs'
import { createMachine, StateMachine } from 'xstate'
import { CvcEntitySelectMessageMode } from './entity-select.component'

export interface EntitySelectContext {}

export type EntitySelectEvent =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'LOAD'; loading: boolean }
  | { type: 'SUCCESS'; options: NzSelectOptionInterface[] }
  | { type: 'FAIL' }
  | { type: 'ERROR' }

export interface EntitySelectSchema {
  states: {
    idle: {}
    open: {
      states: {
        loading: {}
        options: {}
        empty: {}
        error: {}
      }
    }
  }
}

export type EntitySelectTypestate =
  | {
      value: 'idle'
      context: EntitySelectContext
    }
  | {
      value: 'open.loading'
      context: EntitySelectContext & { loading: boolean }
    }
  | {
      value: 'open.options'
      context: EntitySelectContext & { options: NzSelectOptionInterface[] }
    }
  | {
      value: 'open.empty'
      context: EntitySelectContext
    }
  | {
      value: 'open.error'
      context: EntitySelectContext
    }

export function getEntitySelectMachine(
  onMessageMode: Subject<CvcEntitySelectMessageMode>
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
          on: {
            OPEN: 'open',
          },
        },
        open: {
          initial: 'loading',
          // entry: ['emitMessageMode'],
          on: {
            CLOSE: 'idle',
            LOAD: 'open.loading',
          },
          states: {
            loading: {
              entry: ['emitMessageMode'],
              on: {
                SUCCESS: 'options',
                FAIL: 'empty',
                ERROR: 'error',
              },
            },
            options: {
              entry: ['emitMessageMode'],
            },
            empty: {
              entry: ['emitMessageMode'],
            },
            error: {
              entry: ['emitMessageMode'],
            },
          },
        },
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
              if (event.loading) onMessageMode.next('loading')
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

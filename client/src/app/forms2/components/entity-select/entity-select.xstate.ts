import { Maybe } from '@app/generated/civic.apollo'
import { NzSelectOptionInterface } from 'ng-zorro-antd/select'
import { BehaviorSubject, Subject } from 'rxjs'
import { createMachine, StateMachine, StateSchema } from 'xstate'
import { CvcEntitySelectMessageMode } from './entity-select.component'

export interface EntitySelectContext {
  options: NzSelectOptionInterface[]
  message: string
  showSpinner: boolean
}

export type EntitySelectEvent =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'LOAD' }
  | { type: 'SUCCESS' }
  | { type: 'FAIL' }
  | { type: 'ERROR' }

export interface EntitySelectSchema extends StateSchema {
  context: EntitySelectContext
  events: EntitySelectEvent
}

export type EntitySelectTypestate =
  | {
      value: 'idle'
      context: EntitySelectContext
    }
  | {
      value: 'open.query'
      context: EntitySelectContext
    }
  | {
      value: 'open.loading'
      context: EntitySelectContext
    }
  | {
      value: 'open.listing'
      context: EntitySelectContext
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
          on: {
            OPEN: {
              target: 'open',
            },
          },
        },
        open: {
          initial: 'query',
          states: {
            query: {
              on: {
                LOAD: {
                  target: 'loading',
                },
              },
            },
            loading: {
              on: {
                SUCCESS: {
                  target: 'listing',
                },
                FAIL: {
                  target: 'empty',
                },
                ERROR: {
                  target: 'error',
                },
              },
            },
            listing: {},
            empty: {},
            error: {},
          },
          on: {
            CLOSE: {
              target: 'idle',
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
            case 'LOAD':
              onMessageMode.next('loading')
              break
            case 'FAIL':
              onMessageMode.next('empty')
              break
            case 'OPEN':
              onMessageMode.next('open')
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

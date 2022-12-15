import { Maybe } from '@app/generated/civic.apollo'
import { NzSelectOptionInterface } from 'ng-zorro-antd/select'
import { BehaviorSubject, Subject } from 'rxjs'
import {
  ActionObject,
  assign,
  createMachine,
  InternalMachineOptions,
  StateMachine,
  StateSchema,
} from 'xstate'
import { CvcEntitySelectMessageMode } from './entity-select.component'

export interface EntitySelectContext {
  result: any[]
  options: NzSelectOptionInterface[]
  mode: string
  query: string
  paramName: string
  message: string
  showSpinner: boolean
  isLoading: boolean
}
type BaseEvents =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'SEARCH'; query: string; paramName?: string }
  | { type: 'LOAD'; isLoading: boolean }
  | { type: 'SUCCESS'; options: NzSelectOptionInterface[] }
  | { type: 'FAIL' }
  | { type: 'ERROR' }

// extend all base events with optional message attribute
type EventExtension = { message?: string }
type ExtendEvents<E, X> = X & E
export type EntitySelectEvent = ExtendEvents<BaseEvents, EventExtension>

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
      value: 'open'
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
  // actions functions
  const assignMessage = assign<EntitySelectContext, EntitySelectEvent>({
    message: (_context, event) => {
      if (event.message) return event.message
      else return ''
    },
    showSpinner: (_context, event) => {
      if (
        event.type === 'LOAD' ||
        (event.type === 'SEARCH' && event.query.length === 0)
      ) {
        return true
      } else {
        return false
      }
    },
  })

  const assignOptions = assign<EntitySelectContext, EntitySelectEvent>({
    options: (context, event) => {
      if (event.type !== 'SUCCESS') return context.options
      return event.options
    },
  })

  const assignQuery = assign<EntitySelectContext, EntitySelectEvent>({
    query: (context, event) => {
      if (event.type !== 'SEARCH') return context.query
      return event.query
    },
  })

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
          entry: [],
          on: {
            OPEN: {
              target: 'open',
            },
          },
        },
        open: {
          initial: 'query',
          entry: [],
          states: {
            query: {
              entry: ['assignQuery', 'assignMessage'],
              on: {
                LOAD: {
                  target: 'loading',
                },
                SEARCH: {
                  target: 'query',
                },
              },
            },
            loading: {
              entry: ['assignMessage'],
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
                LOAD: {
                  target: 'loading',
                },
              },
            },
            listing: {
              entry: ['assignOptions'],
            },
            empty: {
              entry: ['assignMessage'],
            },
            error: {
              entry: ['assignMessage'],
            },
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
        assignOptions: assignOptions,
        assignQuery: assignQuery,
        assignMessage: assignMessage,
      },
    }
  )
}

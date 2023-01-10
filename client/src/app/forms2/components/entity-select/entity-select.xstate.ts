import { NzSelectOptionInterface } from 'ng-zorro-antd/select'
import { assign, createMachine, StateMachine, StateSchema } from 'xstate'
import { CvcSelectEntityName } from './entity-select.component'

type SelectMessageFn = (
  entityName: string,
  searchStr: string,
  paramName?: string
) => string

export type EntitySelectMessageOptions = {
  search: SelectMessageFn
  searchParam: SelectMessageFn
  searchParamAll: SelectMessageFn
  empty: SelectMessageFn
  emptyParam: SelectMessageFn
  emptyParamAll: SelectMessageFn
}

export interface EntitySelectContext {
  result: any[]
  options: NzSelectOptionInterface[]
  mode: string
  query: string
  isLoading: boolean
  paramName: string
  message: string
  showSpinner: boolean
  entityName: CvcSelectEntityName
  messageOptions: EntitySelectMessageOptions | undefined
}

const initialContext: EntitySelectContext = {
  result: [],
  options: [],
  mode: 'default',
  query: '',
  isLoading: false,
  paramName: '',
  message: '',
  showSpinner: false,
  entityName: { singular: 'Entity', plural: 'Entities' },
  messageOptions: undefined,
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
type EventExtension = { message?: string; showSpinner?: boolean }
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

export type EntitySelectMachineConfig = {
  entityName: CvcSelectEntityName
  messageOptions: EntitySelectMessageOptions
}

export function getEntitySelectMachine(
  config: EntitySelectMachineConfig
): StateMachine<EntitySelectContext, EntitySelectSchema, EntitySelectEvent> {
  // action functions
  const assignSearchMessage = assign<EntitySelectContext, EntitySelectEvent>({
    message: (context, _event) => {
      try {
        const { entityName, paramName, query, messageOptions } = context
        if (!messageOptions) return 'Searching...'

        const plName = entityName.plural
        if (paramName && query.length > 0) {
          return messageOptions.searchParam(plName, query, paramName)
        } else if (!paramName && query.length > 0) {
          return messageOptions.searchParamAll(plName, query, paramName)
        } else if (paramName && query.length === 0) {
          return messageOptions.searchParamAll(plName, query, paramName)
        } else {
          return `Searching ${plName}...`
        }
      } catch (error) {
        console.error(error)
        return ''
      }
    },
    showSpinner: (_context, event) => {
      if (event.showSpinner) return event.showSpinner
      else return false
    },
  })

  const assignEmptyMessage = assign<EntitySelectContext, EntitySelectEvent>({
    message: (context, _event) => {
      const { entityName, paramName, query, messageOptions } = context
      if (!messageOptions) return 'Query returned no results'

      const plName = entityName.plural
      if (paramName && query.length > 0) {
        return messageOptions.emptyParam(plName, query)
      } else if (paramName && query.length === 0) {
        return messageOptions.emptyParamAll(plName, query)
      } else {
        return messageOptions.empty(plName, query)
      }
    },
  })

  const assignErrorMessage = assign<EntitySelectContext, EntitySelectEvent>({
    message: (_context, event) => {
      if (event.message) return event.message
      else return 'An error occurred.'
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
      context: {
        ...initialContext,
        entityName: config.entityName,
        messageOptions: config.messageOptions,
      },
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
          entry: ['assignSearchMessage'],
          states: {
            query: {
              entry: ['assignQuery'],
              // entry: ['assignQuery', 'assignSearchMessage'],
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
              // entry: ['assignSearchMessage'],
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
              entry: ['assignEmptyMessage'],
            },
            error: {
              entry: ['assignErrorMessage'],
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
        assignSearchMessage: assignSearchMessage,
      },
    }
  )
}

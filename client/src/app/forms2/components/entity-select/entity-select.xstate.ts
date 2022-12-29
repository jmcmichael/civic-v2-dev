import { NzSelectOptionInterface } from 'ng-zorro-antd/select'
import { assign, createMachine, StateMachine, StateSchema } from 'xstate'
import { CvcSelectEntityName } from './entity-select.component'

/* SELECT MESSAGES - displayed at top of options dropdown
 * - loading: while API requests loading, e.g. "Loading Variants..."
 * - empty: if no results returned, e.g. "No BRAF Variants found matching V600000"
 *   NOTE: if cvcCreateEntity provided, its quick-add form will be displayed instead, which will include its own prompt, e.g. "No BRAF Variants found matching V60000, would you like to create it?"
 * */
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

export const messageOptions: EntitySelectMessageOptions = {
  search: (entityName, query, _paramName) =>
    `Searching ${entityName} matching "${query}""...`,
  searchParam: (entityName, query, paramName) =>
    `Searching ${paramName} ${entityName} matching "${query}""...`,
  searchParamAll: (entityName, _query, paramName) =>
    `Listing all ${paramName} ${entityName}...`,
  empty: (entityName, query) => `No ${entityName} found matching "${query}"`,
  emptyParam: (entityName, query, paramName) =>
    `No ${paramName} ${entityName} found matching "${query}"`,
  emptyParamAll: (entityName, _query, paramName) =>
    `No ${paramName} ${entityName} found`,
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
  messageOptions: EntitySelectMessageOptions
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
  messageOptions: messageOptions,
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
        const { entityName, paramName, query } = context
        // if (!entityName) return ''

        const plName = entityName.plural
        if (paramName && query.length > 0) {
          return context.messageOptions.searchParam(plName, query, paramName)
        } else if (!paramName && query.length > 0) {
          return context.messageOptions.searchParamAll(plName, query, paramName)
        } else if (paramName && query.length === 0) {
          return context.messageOptions.searchParamAll(plName, query, paramName)
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
      const { entityName, paramName, query } = context
      const plName = entityName.plural
      if (paramName && query.length > 0) {
        return context.messageOptions.emptyParam(plName, query)
      } else if (paramName && query.length === 0) {
        return context.messageOptions.emptyParamAll(plName, query)
      } else {
        return context.messageOptions.empty(plName, query)
      }
    },
  })

  const assignErrorMessage = assign<EntitySelectContext, EntitySelectEvent>({
    message: (_context, event) => {
      if (event.message) return event.message
      else return ''
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
      // context: {
      //   entityName: options.entityName,
      //   messageOptions: options.messageOptions,
      // },
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
          // entry: ['assignSearchMessage'],
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

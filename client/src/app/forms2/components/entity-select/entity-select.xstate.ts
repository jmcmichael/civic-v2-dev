import { createMachine, InternalMachineOptions, StateMachine } from 'xstate'

export interface EntitySelectContext {
  messages: {
    prompt: string
    focus: string
    loading: string
    options: string
    empty: string
    description: string
    error: string
  }
}

export type EntitySelectEvent =
  | { type: 'FOCUS' }
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'SEARCH'; value: string }

export interface EntitySelectSchema {
  states: {
    idle: {}
    loading: {}
    options: {}
    empty: {}
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
      context: EntitySelectContext
    }
  | {
      value: 'empty'
      context: EntitySelectContext
    }

export function getEntitySelectMachine(
  machineOptions?: InternalMachineOptions<
    EntitySelectContext,
    EntitySelectEvent,
    any
  >
): StateMachine<EntitySelectContext, EntitySelectSchema, EntitySelectEvent> {
  return createMachine<
    EntitySelectContext,
    EntitySelectEvent,
    EntitySelectTypestate,
    any,
    any
  >(
    {
      tsTypes: {} as import('./entity-select.xstate.typegen').Typegen0,
      id: 'entity-select',
      initial: 'idle',
      states: {
        idle: {
          /* ... */
        },
        loading: {
          /* ... */
        },
        options: {
          /* ... */
        },
        empty: {
          /* ... */
        },
      },
    },
    machineOptions
  )
}

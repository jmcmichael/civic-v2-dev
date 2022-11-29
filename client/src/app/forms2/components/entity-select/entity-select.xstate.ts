import { NzSelectOptionInterface } from 'ng-zorro-antd/select'
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
  | { type: 'SEARCH'; searchStr: string }

export interface EntitySelectSchema {
  states: {
    idle: {}
    focused: {
      states: {
        searching: {}
        loading: {}
        // options: {}
        // empty: {}
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
      value: 'focused.searching'
      context: EntitySelectContext & { searchStr: string }
    }
  | {
      value: 'focused.loading'
      context: EntitySelectContext
    }
  | {
      value: 'focused.options'
      context: EntitySelectContext
    }
  | {
      value: 'focused.empty'
      context: EntitySelectContext
    }

export function getEntitySelectMachine(): StateMachine<
  EntitySelectContext,
  EntitySelectSchema,
  EntitySelectEvent
> {
  return createMachine<
    EntitySelectContext,
    EntitySelectEvent,
    EntitySelectTypestate,
    any,
    any
  >(
    {
      tsTypes: {} as import('./entity-select.xstate.typegen').Typegen0,
      predictableActionArguments: true,
      id: 'entity-select',
      initial: 'idle',
      states: {
        idle: {
          on: {
            FOCUS: 'focused'
          },
        },
        focused: {
          initial: 'loading',
          on: {
            CLOSE: 'idle'
          },
          states: {
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
      },
    },
    {
      actions: {
        log: (context: EntitySelectContext, event: EntitySelectEvent) => {
          console.log(
            'entity-select.component state.actions.log():',
            context,
            event
          )
        },
        fetchTag: (context: EntitySelectContext, event: EntitySelectEvent) => {
          console.log(
            'entity-select.component state.actions.fetchTag():',
            context,
            event
          )
        },
      },
    }
  )
}

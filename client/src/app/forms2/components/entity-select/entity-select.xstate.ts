import {
    createMachine, StateMachine
} from 'xstate'

export interface EntitySelectContext {
  message: string
  // messages: {
  //   entering: string
  //   loading: string
  //   empty: string
  //   error: string
  // }
}

export type EntitySelectEvent =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'LOAD'; loading: boolean }
// | { type: 'ENTER'; searchStr: string }

export interface EntitySelectSchema {
  states: {
    idle: {}
    open: {
      states: {
        loading: {}
        options: {}
        empty: {}
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
      value: 'loading.loading'
      context: EntitySelectContext & { loading: boolean }
    }
  | {
      value: 'loading.options'
      context: EntitySelectContext
    }
  | {
      value: 'loading.empty'
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
          on: {
            CLOSE: 'idle',
          },
          states: {
            loading: {
              on: {
                LOAD: 'loading',
              },
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
      },
    }
  )
}

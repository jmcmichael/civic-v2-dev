import { Maybe } from '@app/generated/civic.apollo'
import { InternalMachineOptions, Machine, StateMachine, StateSchema } from 'xstate'

interface EntitySelectStateMessages {
  // standard select placeholder, displayed in idle state, describes what the select will do, e.g. 'search entity, select enum'
  placeholder: Maybe<string>

  // displayed below select field in idle state, provides action prompt for user, e.g. 'Select a Gene to search Variants'
  prompt: Maybe<string>

  // displayed below select field in the seleted state, describes the selected value of the field, e.g. 'pertains to a variant's effect on therapeutic response'
  description: Maybe<string>
}

export interface EntitySelectStateContext {
  messages: {
    idle: EntitySelectStateMessages
    focus: EntitySelectStateMessages
    load: EntitySelectStateMessages
    search: EntitySelectStateMessages
    empty: EntitySelectStateMessages
    added: EntitySelectStateMessages
    error: EntitySelectStateMessages
  }
}

export type EntitySelectStateEvent =
  | { type: 'IDLE' }
  | { type: 'FOCUS' }
  | { type: 'BLUR' }
  | { type: 'LOAD'; value: boolean }
  | { type: 'SEARCH'; value: string }
  | { type: 'OPTIONS'; value: any[] }
  | { type: 'SELECT'; value: any[] }
  | { type: 'ADD'; value: number }
  | { type: 'ERROR'; value: string }

export interface EntitySelectStateSchema {
  states: {
    idle: {}
    focus: {}
    blur: {}
    search: {}
    load: {}
    options: {}
    selected: {}
    added: {}
    error: {}
  }
}

export const selectStateConfig: EntitySelectStateSchema = {
  states: {
    idle: {
      on: {
        FOCUS: { target: 'focus' },
      },
    },
    focus: {
      entry: ['log'],
      on: {
        SEARCH: { target: 'search' },
        BLUR: { target: 'blur' },
      },
    },
    search: {
      entry: ['log'],
      on: {
        SEARCH: { target: 'search' },
        LOAD: { target: 'load' },
      },
    },
    load: {
      entry: ['log'],
      on: {
        LOAD: { target: 'load' },
        OPTIONS: { target: 'options' },
        ERROR: { target: 'error' },
      },
    },
    options: {
      entry: ['log'],
      on: {
        ADD: { target: 'added' },
        SELECT: { target: 'selected' },
      },
    },
    selected: {},
    added: {},
    blur: {},
    error: {},
  },
}

export function getEntitySelectStateMachine(
  options?: InternalMachineOptions<
    EntitySelectStateContext,
    EntitySelectStateEvent,
    any
  >
): StateMachine<
  EntitySelectStateContext,
  EntitySelectStateSchema,
  EntitySelectStateEvent
> {
  return Machine<
    EntitySelectStateContext,
    EntitySelectStateSchema,
    EntitySelectStateEvent
  >({
    id: 'entity-select',
    initial: 'idle',
    ...selectStateConfig,
  }, options)
}

// const selectStateConfig: Partial<EntitySelectStateSchema> = {
//     states: {
//       idle: {
//         on: {
//           FOCUS: { target: 'focus' },
//         },
//       },
//       focus: {
//         on: {
//           SEARCH: { target: 'search' },
//           BLUR: { target: 'blur' }
//         },
//       },
//       search: {
//         on: {
//           LOAD: { target: 'load' },
//         },
//       },
//       load: {
//         on: {
//           OPTIONS: { target: 'options' },
//           ERROR: { target: 'error' },
//         },
//       },
//       options: {
//         on: {
//           ADD: { target: 'added' },
//           SELECT: { target: 'selected' }
//         }
//       },
//       selected: {},
//       added: {},
//       blur: {},
//       error: {},
//     },
// }

// export const entitySelectStateMachine = Machine<
//   EntitySelectStateContext,
//   EntitySelectStateSchema,
//   EntitySelectStateEvent
// >(
//   {
//     id: 'entity-select',
//     initial: 'idle',
//     ...selectStateConfig,
//   }
// )

import { Maybe } from '@app/generated/civic.apollo'
import {
  InternalMachineOptions,
  Machine,
  StateMachine,
  StateSchema,
} from 'xstate'

export type EntitySelectStateEventMessage = {
  // displayed inside select field during idle state - describes what the select will do, e.g. 'search entity, select enum'
  placeholder?: Maybe<string>

  // displayed below select field in idle state, provides optional action prompt for user, e.g. 'Select a Gene to search Variants'. if field is disabled until some other action is taken, this prompt should indicate what the user needs to do to enable it
  prompt?: Maybe<string>

  // displayed below select field in the seleted state, describes the selected value of the field, e.g. 'pertains to a variant's effect on therapeutic response'
  description?: Maybe<string>

  // displayed below select field w/ error styles. any form/field errors will supercede the display of this error message.
  error?: Maybe<string>

    // NOTE: entity-select does not provide a message for the 'added' state, which should be displayed by the quick-add form component in its initial, idle state.
}

export type EntitySelectStateContext = {
  messages: {
    idle: EntitySelectStateEventMessage
    focus: EntitySelectStateEventMessage
    load: EntitySelectStateEventMessage
    search: EntitySelectStateEventMessage
    empty: EntitySelectStateEventMessage
    added: EntitySelectStateEventMessage
    error: EntitySelectStateEventMessage
  }
}

export type EntitySelectStateEvent =
  | { type: 'IDLE' }
  | { type: 'FOCUS' }
  | { type: 'BLUR' }
  | { type: 'LOAD'; value: boolean }
  | { type: 'SEARCH'; value: string }
  | { type: 'OPTIONS'; value: any[] }
  | { type: 'CHANGE'; value: any | any[] }
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
    changed: {}
    added: {}
    error: {}
  }
}

export const selectStateConfig: EntitySelectStateSchema = {
  states: {
    idle: {
      on: {
        FOCUS: { target: 'focus' },
        CHANGED: { target: 'changed' },
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
        CHANGE: { target: 'changed' },
        BLUR: { target: 'blur' },
      },
    },
    added: {
      // triggered by quick add output event, passing entity id. on enter, execute linkable tag query, then display '[spinner] Adding [tag]...' for a second, then update field with setValue()
      entry:['fetchTag']
    },
    changed: {},
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
  >(
    {
      id: 'entity-select',
      initial: 'idle',
      ...selectStateConfig,
    },
    options
  )
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

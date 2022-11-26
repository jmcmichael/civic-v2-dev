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

  // NOTE: entity-select does not provide a message for the 'created' state, which should be displayed by the quick-add form component in its initial, idle state.
}

export type EntitySelectStateContext = {
  messages: {
    idle: EntitySelectStateEventMessage
    focus: EntitySelectStateEventMessage
    load: EntitySelectStateEventMessage
    search: EntitySelectStateEventMessage
    empty: EntitySelectStateEventMessage
    error: EntitySelectStateEventMessage
  }
}

export type EntitySelectStateEvent =
  | { type: 'IDLE' }
  | { type: 'FOCUS' }
  | { type: 'BLUR' }
  | { type: 'OPEN', value: boolean }
  | { type: 'LOAD'; value: boolean }
  | { type: 'SEARCH'; value: string }
  | { type: 'OPTIONS'; value: any[] }
  | { type: 'CHANGE'; value: any | any[] }
  | { type: 'ERROR'; value: string }

export interface EntitySelectStateSchema {
  states: {
    idle: {}
    focus: {}
    opened: {}
    blur: {}
    closed: {}
    search: {}
    load: {}
    options: {}
    created: {}
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
        CREATE: { target: 'created' },
        BLUR: { target: 'blur' },
      },
    },
    created: {
      entry: ['log'],
      on: {
        BLUR: 'blur',
      },
    },
    opened: { entry: ['log'] },
    closed: { entry: ['log'] },
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

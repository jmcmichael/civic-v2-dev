import { TemplateRef } from '@angular/core'
import { Maybe } from '@app/generated/civic.apollo'

interface SelectMessages {
  placeholder: Maybe<string>
  description: Maybe<string>
  prompt: Maybe<string | TemplateRef<any>>
  add: Maybe<TemplateRef<any>>
}

interface SelectContext {
  messages: {
    idle: SelectMessages
    focus: SelectMessages
    search: SelectMessages
    empty: SelectMessages
    create: SelectMessages
    error: SelectMessages
  }
}

interface SelectStateSchema {
  states: {
    idle: {}
    focus: {
      search: {}
      options: {}
      added: {}
      blur: {}
      error: {}
    }
  }
}

type SelectEvent =
  | { type: 'IDLE' }
  | { type: 'FOCUS' }
  | { type: 'BLUR' }
  | { type: 'SEARCH'; value: string }
  | { type: 'OPTIONS'; value: any[] }
  | { type: 'ADDED'; value: number }
  | { type: 'ERROR'; value: string }

const selectStateConfig = {
  id: 'entitySelect',
  initial: 'idle',
  states: {
    idle: {
      on: {
        FOCUS: {
          target: 'focus',
        },
      },
    },
    focus: {
      on: {
        SEARCH: {
          target: 'search',
        },
        BLUR: {
          target: '.blur',
        },
      },
      states: {
        search: {
          on: {
            OPTIONS: {
              target: 'options',
            },
            ERROR: {
              target: 'error',
            },
          },
        },
        options: {
          // if options.length > 0, hide messages (options will be displayed)
          // if no results and no optional search param, show not found msg/tmpl
          //
          // NOTE: entity-select's cvcSelectMessage attr provides these message strings/templates, so will display:
          // - a standard no results msg, e.g. 'No entity found matching search'
          // - a msg including the optional parameter name, e.g. 'No BRAF variant found matching search'
          // - a quick-add template, if provided, which will provide its own msg, prompt, and add button, e.g. 'No BRAF variant found matching 'abc123', would you like to create a new variant 'ABC123'?'
          on: {
            ADDED: {
              // add form successfully added entity, emitted entity ID
              target: 'added',
            },
          },
        },
        added: {
          // show 'entity created' msg, pause, update model
          // NOTE: model update should cause select component to hide options overlay, and blur the field, thus emiting a BLUR event, which executes and returns state machine to idle
        },
        error: {
          // show error msg
        },
      },
    },
    blur: {
      // reset displays, return to idle state
    },
  },
}

// import { createMachine } from "xstate";

// const machine = createMachine({
//   schema: {
//     context: {} as { value: string },
//     events: {} as { type: "FOO"; value: string } | { type: "BAR" },
//   },
//   initial: "a",
//   states: {
//     a: {
//       on: {
//         FOO: {
//           actions: "consoleLogValue",
//           target: "b",
//         },
//       },
//     },
//     b: {
//       entry: "consoleLogValueAgain",
//     },
//   },
// });

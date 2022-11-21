import { TemplateRef } from '@angular/core'
import { Maybe } from '@app/generated/civic.apollo'

interface SelectContext {
  messages: {
    initial: Maybe<string | TemplateRef<any>>
    focus: Maybe<string | TemplateRef<any>>
    search: Maybe<string | TemplateRef<any>>
    result: Maybe<string | TemplateRef<any>>
    noResult: Maybe<string | TemplateRef<any>>
    create: Maybe<string | TemplateRef<any>>
    error: Maybe<string | TemplateRef<any>>
  }
}

interface SelectStateSchema {
  states: {
    idle: {}
    focus: {}
    search: {}
    result: {
      // results returned, select options displayed
      select: {}
      // no results
      none: {}
      // no results, create entity
      create: {}
    }
    created: {}
    error: {}
  }
}

type SelectEvent =
  | { type: 'IDLE'; value: string }
  | { type: 'SEARCH'; value: string }
  | { type: 'RESULT'; value: number }
  | { type: 'CREATE'; value: string }
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
      // if minLength search string specified, show 'enter query of n length to search'
      // else trigger search state w/ empty string to populate options
      on: {
        SEARCH: {
          target: 'search',
        },
        IDLE: {
          target: 'idle'
        }
      },
      states: {
        search: {
          on: {
            RESULT: {
              target: 'result',
            },
            ERROR: {
              target: 'error',
            },
          },
        },
        result: {
          // if results > 0, hide messages (options will be displayed)
          // if no results and no optional search param, show std not found msg
          // if no results, and optional param provided, show param not found msg
          // if no results, and create entity templateRef provided, show create msg & form
          on: {
            CREATE: {
              target: 'create'
            }

          },
        },
        create: {
          // show 'entity created' msg, pause, return to idle state
          on: {
            IDLE: {
              target: 'idle'
            }
          }
        },
        error: {
          // show error msg
          on: {},
        },
      },
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

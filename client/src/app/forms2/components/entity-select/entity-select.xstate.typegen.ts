// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true
  internalEvents: {
    'xstate.init': { type: 'xstate.init' }
  }
  invokeSrcNameMap: {}
  missingImplementations: {
    actions: never
    services: never
    guards: never
    delays: never
  }
  eventsCausingActions: {
    emitMessageMode: 'ERROR' | 'FAIL' | 'LOAD' | 'OPEN' | 'SUCCESS'
  }
  eventsCausingServices: {}
  eventsCausingGuards: {}
  eventsCausingDelays: {}
  matchesStates:
    | 'idle'
    | 'open'
    | 'open.empty'
    | 'open.error'
    | 'open.loading'
    | 'open.options'
    | { open?: 'empty' | 'error' | 'loading' | 'options' }
  tags: never
}

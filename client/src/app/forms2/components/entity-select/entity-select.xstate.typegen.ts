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
    emitMessageMode:
      | 'CLOSE'
      | 'ERROR'
      | 'FAIL'
      | 'LOAD'
      | 'OPEN'
      | 'SUCCESS'
      | 'xstate.init'
  }
  eventsCausingServices: {}
  eventsCausingGuards: {}
  eventsCausingDelays: {}
  matchesStates:
    | 'idle'
    | 'open'
    | 'open.empty'
    | 'open.entering'
    | 'open.error'
    | 'open.loading'
    | 'open.options'
    | { open?: 'empty' | 'entering' | 'error' | 'loading' | 'options' }
  tags: never
}

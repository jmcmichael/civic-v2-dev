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
    assignOptions: 'SUCCESS'
    emitMessageMode: 'CLOSE' | 'ERROR' | 'FAIL' | 'OPEN' | 'xstate.init'
  }
  eventsCausingServices: {}
  eventsCausingGuards: {}
  eventsCausingDelays: {}
  matchesStates:
    | 'idle'
    | 'open'
    | 'open.empty'
    | 'open.error'
    | 'open.listing'
    | 'open.loading'
    | 'open.query'
    | { open?: 'empty' | 'error' | 'listing' | 'loading' | 'query' }
  tags: never
}

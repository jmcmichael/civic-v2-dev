import { Maybe } from '@app/generated/civic.apollo'
import { NzSelectOptionInterface } from 'ng-zorro-antd/select'
import { BehaviorSubject, Subject } from 'rxjs'
import { createMachine, StateMachine, StateSchema } from 'xstate'
import { CvcEntitySelectMessageMode } from './entity-select.component'

export interface EntitySelectContext {
  options: NzSelectOptionInterface[]
  message: string
  showSpinner: boolean
}

export type EntitySelectEvent =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'LOAD' }
  | { type: 'SUCCESS' }
  | { type: 'FAIL' }
  | { type: 'ERROR' }

export interface EntitySelectSchema extends StateSchema {
  states: {
    idle: {}
    open: {}
    loading: {}
    options: {}
    empty: {}
    error: {}
  }
}

export type EntitySelectTypestate =
  | {
      value: 'idle'
      context: EntitySelectContext
    }
  | {
      value: 'open'
      context: EntitySelectContext
    }
  | {
      value: 'loading'
      context: EntitySelectContext
    }
  | {
      value: 'options'
      context: EntitySelectContext & { options: NzSelectOptionInterface[] }
    }
  | {
      value: 'empty'
      context: EntitySelectContext
    }
  | {
      value: 'error'
      context: EntitySelectContext
    }

export function getEntitySelectMachine(
  onMessageMode: BehaviorSubject<Maybe<CvcEntitySelectMessageMode>>
): StateMachine<EntitySelectContext, EntitySelectSchema, EntitySelectEvent> {
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
          entry: ['emitMessageMode'],
          on: {
            OPEN: 'open',
          },
        },
        open: {
          entry: ['emitMessageMode'],
          on: {
            LOAD: 'loading',
            CLOSE: 'idle',
          },
        },
        loading: {
          entry: ['emitMessageMode'],
          on: {
            SUCCESS: 'options',
            FAIL: 'empty',
            ERROR: 'error',
            CLOSE: 'idle',
          },
        },
        options: {
          entry: ['emitMessageMode'],
          on: {
            CLOSE: 'idle',
            LOAD: 'loading',
          },
        },
        empty: {
          entry: ['emitMessageMode'],
          on: {
            CLOSE: 'idle',
            LOAD: 'loading',
          },
        },
        error: {
          entry: ['emitMessageMode'],
          on: {
            CLOSE: 'idle',
            LOAD: 'loading',
          },
        },
      },
    },
    {
      actions: {
        emitMessageMode: (
          _context: EntitySelectContext,
          event: EntitySelectEvent
        ) => {
          switch (event.type) {
            case 'LOAD':
              onMessageMode.next('loading')
              break
            case 'FAIL':
              onMessageMode.next('empty')
              break
            case 'OPEN':
              onMessageMode.next('open')
              break
          }
        },
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

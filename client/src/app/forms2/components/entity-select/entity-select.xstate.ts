import { Maybe } from '@app/generated/civic.apollo'
import { NzSelectOptionInterface } from 'ng-zorro-antd/select'
import { BehaviorSubject, Subject } from 'rxjs'
import {
  ActionObject,
  assign,
  createMachine,
  InternalMachineOptions,
  StateMachine,
  StateSchema,
} from 'xstate'
import { CvcEntitySelectMessageMode } from './entity-select.component'

export interface EntitySelectContext {
  options: NzSelectOptionInterface[]
  message: string
  mode: string
  showSpinner: boolean
}

export type EntitySelectEvent =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'LOAD' }
  | { type: 'SUCCESS'; options: NzSelectOptionInterface[] }
  | { type: 'FAIL' }
  | { type: 'ERROR' }

export interface EntitySelectSchema extends StateSchema {
  context: EntitySelectContext
  events: EntitySelectEvent
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
      value: 'open.query'
      context: EntitySelectContext
    }
  | {
      value: 'open.loading'
      context: EntitySelectContext
    }
  | {
      value: 'open.listing'
      context: EntitySelectContext
    }
  | {
      value: 'open.empty'
      context: EntitySelectContext
    }
  | {
      value: 'open.error'
      context: EntitySelectContext
    }

export function getEntitySelectMachine(
  onMessageMode: BehaviorSubject<Maybe<CvcEntitySelectMessageMode>>
): StateMachine<EntitySelectContext, EntitySelectSchema, EntitySelectEvent> {
  function emitMessageMode(
    _context: EntitySelectContext,
    event: EntitySelectEvent
  ): void {
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
  }

  const assignOptions = assign<EntitySelectContext, EntitySelectEvent>({
    options: (context, event) => {
      if(event.type !== 'SUCCESS') return context.options
      return event.options
    }
  })

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
            OPEN: {
              target: 'open',
            },
          },
        },
        open: {
          initial: 'query',
          entry: ['emitMessageMode'],
          states: {
            query: {
              entry: ['emitMessageMode'],
              on: {
                LOAD: {
                  target: 'loading',
                },
              },
            },
            loading: {
              on: {
                SUCCESS: {
                  target: 'listing',
                },
                FAIL: {
                  target: 'empty',
                },
                ERROR: {
                  target: 'error',
                },
              },
            },
            listing: {
              entry: ['assignOptions'],
            },
            empty: {
              entry: ['emitMessageMode'],
            },
            error: {
              entry: ['emitMessageMode'],
            },
          },
          on: {
            CLOSE: {
              target: 'idle',
            },
          },
        },
      },
    },
    {
      actions: {
        emitMessageMode: emitMessageMode,
        assignOptions: assignOptions,
      },
    }
  )
}

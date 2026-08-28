import { TestBed } from '@angular/core/testing'
import {
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
  LocalStateError,
  ServerError,
  UnconventionalError,
} from '@apollo/client/errors'
import { InvariantError } from '@apollo/client/utilities/invariant'
import { Subject } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'
import { FormMutationService } from './form-mutation'

type FakeResult = { data?: Record<string, unknown> }

function setup() {
  TestBed.configureTestingModule({})
  const service = TestBed.inject(FormMutationService)
  const result$ = new Subject<FakeResult>()
  const gql = { mutate: vi.fn(() => result$.asObservable()) }
  return { service, gql, result$ }
}

describe('FormMutationService', () => {
  it('reports in-flight state until the mutation settles', () => {
    const { service, gql, result$ } = setup()
    const state = service.mutate(gql as any, { input: {} })
    expect(state.isSubmitting()).toBe(true)
    result$.next({ data: {} })
    result$.complete()
    expect(state.isSubmitting()).toBe(false)
  })

  it('delivers data to the callback and flips success on completion', () => {
    const { service, gql, result$ } = setup()
    const onData = vi.fn()
    const state = service.mutate(gql as any, { input: {} }, undefined, onData)
    result$.next({ data: { addThing: { id: 1 } } })
    result$.complete()
    expect(onData).toHaveBeenCalledWith({ addThing: { id: 1 } })
    expect(state.success()).toBe(true)
    expect(state.errors()).toEqual([])
  })

  it('passes variables and options through to the mutation', () => {
    const { service, gql } = setup()
    service.mutate(gql as any, { input: { id: 5 } }, {
      refetchQueries: ['Thing'],
    } as any)
    expect(gql.mutate).toHaveBeenCalledWith({
      variables: { input: { id: 5 } },
      refetchQueries: ['Thing'],
    })
  })

  it('categorizes GraphQL errors with code and path details', () => {
    const { service, gql, result$ } = setup()
    const state = service.mutate(gql as any, { input: {} })
    result$.error(
      new CombinedGraphQLErrors({
        errors: [
          {
            message: 'name is invalid',
            extensions: { code: 'VALIDATION_FAILED' },
            path: ['addThing', 'name'],
          },
          { message: 'id is taken' },
        ],
      })
    )
    expect(state.errors()).toMatchObject([
      {
        category: 'graphql',
        code: 'VALIDATION_FAILED',
        message: 'name is invalid',
        meta: [{ label: 'path', value: 'addThing.name' }],
      },
      {
        category: 'graphql',
        code: undefined,
        message: 'id is taken',
        meta: undefined,
      },
    ])
    // the popover's detail: the serialized GraphQL error as json + log text
    expect(state.errors()[0].json).toMatchObject({ message: 'name is invalid' })
    expect(state.errors()[0].log).toContain('VALIDATION_FAILED')
    expect(state.errors()[0].log).toContain('name is invalid')
    expect(state.success()).toBe(false)
    expect(state.isSubmitting()).toBe(false)
  })

  it('categorizes subscription protocol errors as graphql', () => {
    const { service, gql, result$ } = setup()
    const state = service.mutate(gql as any, { input: {} })
    result$.error(new CombinedProtocolErrors([{ message: 'subgraph down' }]))
    expect(state.errors()).toMatchObject([
      {
        category: 'graphql',
        message: 'subgraph down',
        meta: [{ label: 'source', value: 'subscription protocol' }],
      },
    ])
  })

  it('categorizes HTTP failures with status, url and parsed body', () => {
    const { service, gql, result$ } = setup()
    const state = service.mutate(gql as any, { input: {} })
    result$.error(
      new ServerError('Response not successful: Received status code 502', {
        response: new Response(null, { status: 502 }),
        bodyText: '{"error":"upstream timeout"}',
      })
    )
    expect(state.errors()).toMatchObject([{ category: 'network', code: '502' }])
    expect(state.errors()[0].meta).toContainEqual({
      label: 'status',
      value: '502',
    })
    // a JSON body lands in the structured payload
    expect(state.errors()[0].json).toEqual({ error: 'upstream timeout' })
    expect(state.errors()[0].log).toContain('upstream timeout')
  })

  it('categorizes cache invariant violations as cache errors', () => {
    const { service, gql, result$ } = setup()
    const state = service.mutate(gql as any, { input: {} })
    result$.error(new InvariantError('Missing field while writing result'))
    expect(state.errors()).toMatchObject([
      {
        category: 'cache',
        code: 'InvariantError',
        message: 'Missing field while writing result',
      },
    ])
  })

  it('categorizes local state failures as apollo errors', () => {
    const { service, gql, result$ } = setup()
    const state = service.mutate(gql as any, { input: {} })
    result$.error(
      new LocalStateError('resolver blew up', { path: ['thing', 'flag'] })
    )
    expect(state.errors()).toMatchObject([
      {
        category: 'apollo',
        code: 'LocalState',
        meta: [{ label: 'path', value: 'thing.flag' }],
      },
    ])
  })

  it('captures the cause of a non-Error thrown in the link chain', () => {
    const { service, gql, result$ } = setup()
    const state = service.mutate(gql as any, { input: {} })
    result$.error(new UnconventionalError({ weird: true }))
    expect(state.errors()).toMatchObject([
      { category: 'apollo', code: 'Unconventional' },
    ])
    expect(state.errors()[0].json).toEqual({ weird: true })
  })

  it('categorizes a failed fetch as a network error', () => {
    const { service, gql, result$ } = setup()
    const state = service.mutate(gql as any, { input: {} })
    result$.error(new TypeError('Failed to fetch'))
    expect(state.errors()).toMatchObject([
      {
        category: 'network',
        code: 'TypeError',
        message: 'Failed to fetch',
      },
    ])
    expect(state.errors()[0].log).toContain('Failed to fetch')
  })

  it('categorizes other exceptions as code errors', () => {
    const { service, gql, result$ } = setup()
    const state = service.mutate(gql as any, { input: {} })
    result$.error(new Error('boom'))
    expect(state.errors()).toMatchObject([
      { category: 'code', code: 'Error', message: 'boom' },
    ])
    // the stack, when the runtime provides one
    expect(state.errors()[0].log).toContain('boom')
  })

  it('invokes the error callback with every failure category', () => {
    const { service, gql, result$ } = setup()
    const onError = vi.fn()
    service.mutate(gql as any, { input: {} }, undefined, undefined, onError)
    result$.error(
      new CombinedGraphQLErrors({ errors: [{ message: 'rejected' }] })
    )
    expect(onError).toHaveBeenCalledWith([
      expect.objectContaining({ category: 'graphql', message: 'rejected' }),
    ])

    const transport$ = new Subject<FakeResult>()
    const transportGql = { mutate: vi.fn(() => transport$.asObservable()) }
    const onTransportError = vi.fn()
    service.mutate(
      transportGql as any,
      { input: {} },
      undefined,
      undefined,
      onTransportError
    )
    transport$.error(new TypeError('Failed to fetch'))
    expect(onTransportError).toHaveBeenCalledWith([
      expect.objectContaining({ category: 'network' }),
    ])
  })
})

import { TestBed } from '@angular/core/testing'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
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
        details: ['path: addThing.name'],
      },
      {
        category: 'graphql',
        code: undefined,
        message: 'id is taken',
        details: undefined,
      },
    ])
    // the details modal's log: the serialized GraphQL error
    expect(state.errors()[0].log).toContain('VALIDATION_FAILED')
    expect(state.errors()[0].log).toContain('name is invalid')
    expect(state.success()).toBe(false)
    expect(state.isSubmitting()).toBe(false)
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

  it('categorizes other exceptions as browser errors', () => {
    const { service, gql, result$ } = setup()
    const state = service.mutate(gql as any, { input: {} })
    result$.error(new Error('boom'))
    expect(state.errors()).toMatchObject([
      { category: 'browser', code: 'Error', message: 'boom' },
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

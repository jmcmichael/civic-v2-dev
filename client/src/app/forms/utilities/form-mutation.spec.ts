import { TestBed } from '@angular/core/testing'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { NetworkErrorsService } from '@app/core/services/network-errors.service'
import { Subject } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'
import { FormMutationService } from './form-mutation'

type FakeResult = { data?: Record<string, unknown> }

function setup() {
  const networkError$ = { next: vi.fn() }
  TestBed.configureTestingModule({
    providers: [{ provide: NetworkErrorsService, useValue: { networkError$ } }],
  })
  const service = TestBed.inject(FormMutationService)
  const result$ = new Subject<FakeResult>()
  const gql = { mutate: vi.fn(() => result$.asObservable()) }
  return { service, gql, result$, networkError$ }
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

  it('surfaces GraphQL errors as messages without touching the banner', () => {
    const { service, gql, result$, networkError$ } = setup()
    const state = service.mutate(gql as any, { input: {} })
    result$.error(
      new CombinedGraphQLErrors({
        errors: [{ message: 'name is invalid' }, { message: 'id is taken' }],
      })
    )
    expect(state.errors()).toEqual(['name is invalid', 'id is taken'])
    expect(state.success()).toBe(false)
    expect(state.isSubmitting()).toBe(false)
    expect(networkError$.next).not.toHaveBeenCalled()
  })

  it('invokes the error callback for GraphQL errors only', () => {
    const { service, gql, result$ } = setup()
    const onError = vi.fn()
    service.mutate(gql as any, { input: {} }, undefined, undefined, onError)
    result$.error(
      new CombinedGraphQLErrors({ errors: [{ message: 'rejected' }] })
    )
    expect(onError).toHaveBeenCalledWith(['rejected'])

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
    transport$.error(new Error('socket hangup'))
    expect(onTransportError).not.toHaveBeenCalled()
  })

  it('routes transport failures to the network error banner', () => {
    const { service, gql, result$, networkError$ } = setup()
    const state = service.mutate(gql as any, { input: {} })
    result$.error(new Error('socket hangup'))
    expect(state.errors()).toEqual([])
    expect(networkError$.next).toHaveBeenCalledTimes(1)
    expect(networkError$.next).not.toHaveBeenCalledWith(undefined)
  })

  it('never clears the banner on success', () => {
    // the core MutatorWithState pushed undefined into networkError$ on every
    // successful mutation, dismissing unrelated app-wide errors; the forms
    // version must not
    const { service, gql, result$, networkError$ } = setup()
    service.mutate(gql as any, { input: {} })
    result$.next({ data: {} })
    result$.complete()
    expect(networkError$.next).not.toHaveBeenCalled()
  })
})

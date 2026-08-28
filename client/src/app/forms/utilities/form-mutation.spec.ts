import { TestBed } from '@angular/core/testing'
import { CombinedGraphQLErrors, ServerError } from '@apollo/client/errors'
import { InvariantError } from '@apollo/client/utilities/invariant'
import { AppErrorsService } from '@app/core/services/app-errors.service'
import { Subject } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'
import { FormMutationService } from './form-mutation'

type FakeResult = { data?: Record<string, unknown> }

function setup() {
  const appErrors = { reportErrors: vi.fn() }
  TestBed.configureTestingModule({
    providers: [{ provide: AppErrorsService, useValue: appErrors }],
  })
  const service = TestBed.inject(FormMutationService)
  const result$ = new Subject<FakeResult>()
  const gql = { mutate: vi.fn(() => result$.asObservable()) }
  return { service, gql, result$, appErrors }
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

  it('keeps graphql validation errors form-local', () => {
    const { service, gql, result$, appErrors } = setup()
    const state = service.mutate(gql as any, { input: {} })
    result$.error(
      new CombinedGraphQLErrors({
        errors: [
          {
            message: 'name is invalid',
            extensions: { code: 'VALIDATION_FAILED' },
          },
        ],
      })
    )
    expect(state.errors()).toMatchObject([
      { category: 'graphql', code: 'VALIDATION_FAILED' },
    ])
    expect(appErrors.reportErrors).toHaveBeenCalledWith([])
    expect(state.success()).toBe(false)
    expect(state.isSubmitting()).toBe(false)
  })

  it('drops network failures: the apollo error link reports those', () => {
    const { service, gql, result$, appErrors } = setup()
    const state = service.mutate(gql as any, { input: {} })
    result$.error(
      new ServerError('Received status code 502', {
        response: new Response(null, { status: 502 }),
        bodyText: '',
      })
    )
    expect(state.errors()).toEqual([])
    expect(appErrors.reportErrors).toHaveBeenCalledWith([])
  })

  it('forwards cache and code failures to the app error service', () => {
    const { service, gql, result$, appErrors } = setup()
    const state = service.mutate(gql as any, { input: {} })
    result$.error(new InvariantError('Missing field while writing'))
    expect(state.errors()).toEqual([])
    expect(appErrors.reportErrors).toHaveBeenCalledWith([
      expect.objectContaining({ category: 'cache' }),
    ])
  })

  it('invokes the error callback with every category, form-local or not', () => {
    const { service, gql, result$ } = setup()
    const onError = vi.fn()
    service.mutate(gql as any, { input: {} }, undefined, undefined, onError)
    result$.error(new InvariantError('cache write failed'))
    expect(onError).toHaveBeenCalledWith([
      expect.objectContaining({ category: 'cache' }),
    ])
  })
})

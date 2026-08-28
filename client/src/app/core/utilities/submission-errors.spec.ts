import {
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
  LocalStateError,
  ServerError,
  UnconventionalError,
} from '@apollo/client/errors'
import { InvariantError } from '@apollo/client/utilities/invariant'
import { describe, expect, it } from 'vitest'
import { toSubmissionErrors } from './submission-errors'

describe('toSubmissionErrors', () => {
  it('categorizes GraphQL errors with code, path meta and payload', () => {
    const errors = toSubmissionErrors(
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
    expect(errors).toMatchObject([
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
    expect(errors[0].json).toMatchObject({ message: 'name is invalid' })
    expect(errors[0].log).toContain('VALIDATION_FAILED')
  })

  it('categorizes subscription protocol errors as graphql', () => {
    expect(
      toSubmissionErrors(new CombinedProtocolErrors([{ message: 'down' }]))
    ).toMatchObject([
      {
        category: 'graphql',
        message: 'down',
        meta: [{ label: 'source', value: 'subscription protocol' }],
      },
    ])
  })

  it('categorizes HTTP failures with status, url and parsed body', () => {
    const errors = toSubmissionErrors(
      new ServerError('Response not successful: Received status code 502', {
        response: new Response(null, { status: 502 }),
        bodyText: '{"error":"upstream timeout"}',
      })
    )
    expect(errors).toMatchObject([{ category: 'network', code: '502' }])
    expect(errors[0].meta).toContainEqual({ label: 'status', value: '502' })
    expect(errors[0].json).toEqual({ error: 'upstream timeout' })
    expect(errors[0].log).toContain('upstream timeout')
  })

  it('categorizes cache invariant violations as cache errors', () => {
    expect(
      toSubmissionErrors(new InvariantError('Missing field while writing'))
    ).toMatchObject([{ category: 'cache', code: 'InvariantError' }])
  })

  it('categorizes local state failures as apollo errors', () => {
    expect(
      toSubmissionErrors(
        new LocalStateError('resolver blew up', { path: ['thing', 'flag'] })
      )
    ).toMatchObject([
      {
        category: 'apollo',
        code: 'LocalState',
        meta: [{ label: 'path', value: 'thing.flag' }],
      },
    ])
  })

  it('captures the cause of a non-Error thrown in the link chain', () => {
    const errors = toSubmissionErrors(new UnconventionalError({ weird: true }))
    expect(errors).toMatchObject([
      { category: 'apollo', code: 'Unconventional' },
    ])
    expect(errors[0].json).toEqual({ weird: true })
  })

  it('categorizes a failed fetch as network, other exceptions as code', () => {
    expect(toSubmissionErrors(new TypeError('Failed to fetch'))).toMatchObject([
      { category: 'network', code: 'TypeError' },
    ])
    const errors = toSubmissionErrors(new Error('boom'))
    expect(errors).toMatchObject([
      { category: 'code', code: 'Error', message: 'boom' },
    ])
    expect(errors[0].log).toContain('boom')
  })
})

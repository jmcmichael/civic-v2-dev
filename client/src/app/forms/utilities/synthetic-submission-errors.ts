import { signal } from '@angular/core'
import { MissingFieldError } from '@apollo/client/cache'
import {
  CombinedGraphQLErrors,
  LocalStateError,
  ServerError,
  UnconventionalError,
} from '@apollo/client/errors'
import { InvariantError } from '@apollo/client/utilities/invariant'
import { DocumentNode } from 'graphql'
import { FormMutationState, toSubmissionErrors } from './form-mutation'

const emptyQuery = { kind: 'Document', definitions: [] } as DocumentNode

/**
 * Dev-only specimen state for the submission-error indicators: at least one
 * error of every category, produced by running real Apollo error instances
 * through the same capture ladder as live failures, so specimens cannot
 * drift from what production errors carry. Most categories (cache, local
 * state, non-Error throws) cannot be tripped from outside the client, which
 * is why this harness exists. Activate on any form in a dev serve by adding
 * `?syntheticErrors` to the URL — see cvc-form-submission-status-display.
 */
export function syntheticSubmissionState(): FormMutationState {
  const nonFetchTypeError = new TypeError(
    "Cannot read properties of undefined (reading 'id')"
  )
  const specimens: unknown[] = [
    // graphql: server-side validation failure
    new CombinedGraphQLErrors({
      errors: [
        {
          message: 'Evidence level is not included in the list',
          extensions: { code: 'VALIDATION_FAILED' },
          path: ['submitEvidenceItem', 'fields', 'evidenceLevel'],
        },
      ],
    }),
    // network: non-200 response with a JSON body
    new ServerError('Response not successful: Received status code 502', {
      response: new Response(null, { status: 502 }),
      bodyText: '{"error":"Bad Gateway","request_id":"synthetic-1234"}',
    }),
    // network: a fetch that never reached the server
    new TypeError('Failed to fetch'),
    // cache: write-time invariant violation
    new InvariantError('Missing field "name" while writing result {"id":123}'),
    // cache: read miss on a dangling reference
    new MissingFieldError(
      'Dangling reference to missing EvidenceItem:9999 object',
      ['evidenceItem', 'name'],
      emptyQuery
    ),
    // apollo: @client field resolver failure
    new LocalStateError('Field "viewerCanEdit" resolver threw', {
      path: ['evidenceItem', 'viewerCanEdit'],
    }),
    // apollo: a non-Error value thrown in the link chain
    new UnconventionalError({
      reason: 'link chain threw a plain object',
      operation: 'SubmitEvidenceItem',
    }),
    // code: any other client-side exception
    nonFetchTypeError,
  ]
  const errors = specimens.flatMap((e) => toSubmissionErrors(e))
  return {
    isSubmitting: signal(false).asReadonly(),
    success: signal(false).asReadonly(),
    errors: signal(errors).asReadonly(),
  }
}

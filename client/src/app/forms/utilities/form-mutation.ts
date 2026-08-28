import { Injectable, Signal, signal } from '@angular/core'
import { MissingFieldError } from '@apollo/client/cache'
import {
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
  LinkError,
  LocalStateError,
  ServerError,
  ServerParseError,
  UnconventionalError,
  toErrorLike,
} from '@apollo/client/errors'
import { InvariantError } from '@apollo/client/utilities/invariant'
import { Apollo, Mutation } from 'apollo-angular'
import { Observable, finalize } from 'rxjs'

/**
 * One submit-time failure, categorized for the form error tag's popover:
 * server validation (`graphql`), transport (`network`), apollo client
 * internals (`apollo`), normalized-cache failures (`cache`), or any other
 * client-side exception (`code`). `code` the machine code when one exists
 * (GraphQL extension code, HTTP status, error class), `meta` label/value
 * rows for the detail view (path, url…), `json` a structured payload for
 * the JSON tree, and `log` the full raw error as copyable text.
 */
export interface FormSubmissionError {
  readonly category: 'graphql' | 'network' | 'apollo' | 'cache' | 'code'
  readonly code?: string
  readonly message: string
  readonly meta?: { label: string; value: string }[]
  readonly json?: unknown
  readonly log?: string
}

/**
 * Per-submit mutation state for form templates. Every submit failure —
 * server validation, transport, or a client-side exception — lands in
 * `errors`, categorized; forms display them locally via the error tag.
 */
export interface FormMutationState {
  readonly isSubmitting: Signal<boolean>
  readonly success: Signal<boolean>
  readonly errors: Signal<FormSubmissionError[]>
}

// apollo's Mutation class cannot be matched by a conditional type — its
// `mutate` is declared with a `{} extends TVariables` conditional tuple, which
// makes even `GQL extends Mutation<any, any>` resolve false — so data and
// variables types are extracted from the concrete mutate() signature instead
type MutationData<M extends Mutation<any, any>> = M['mutate'] extends (
  ...args: any[]
) => Observable<Apollo.MutateResult<infer T>>
  ? T
  : never
type MutationVars<M extends Mutation<any, any>> = Exclude<
  NonNullable<Parameters<M['mutate']>[0]>['variables'],
  undefined
>

// a thrown cause can hold anything, including cycles
function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2) ?? String(value)
  } catch {
    return String(value)
  }
}

function toSubmissionErrors(error: unknown): FormSubmissionError[] {
  // server-side validation and execution errors, one entry each
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors.map((e) => {
      const code = e.extensions?.['code']
      return {
        category: 'graphql' as const,
        code: typeof code === 'string' ? code : undefined,
        message: e.message,
        meta: e.path ? [{ label: 'path', value: e.path.join('.') }] : undefined,
        // formatted errors are plain message/path/locations/extensions
        json: e,
        log: JSON.stringify(e, null, 2),
      }
    })
  }
  // multipart-subscription transport errors carry the same formatted shape
  if (CombinedProtocolErrors.is(error)) {
    return error.errors.map((e) => ({
      category: 'graphql' as const,
      message: e.message,
      meta: [{ label: 'source', value: 'subscription protocol' }],
      json: e,
      log: JSON.stringify(e, null, 2),
    }))
  }
  if (ServerError.is(error) || ServerParseError.is(error)) {
    const url = error.response?.url
    let json: unknown
    try {
      json = JSON.parse(error.bodyText)
    } catch {
      // non-JSON bodies (HTML error pages) stay in the log text
    }
    return [
      {
        category: 'network',
        code: String(error.statusCode),
        message: error.message,
        meta: [
          { label: 'status', value: String(error.statusCode) },
          ...(url ? [{ label: 'url', value: url }] : []),
        ],
        json,
        log: [`HTTP ${error.statusCode}`, url, error.bodyText, error.stack]
          .filter(Boolean)
          .join('\n\n'),
      },
    ]
  }
  if (error instanceof MissingFieldError) {
    return [
      {
        category: 'cache',
        code: 'MissingField',
        message: error.message,
        json: error.missing,
        log: error.stack ?? error.message,
      },
    ]
  }
  // in the mutate path an invariant violation is a cache write/normalization
  // failure (bad keyFields, malformed data passed to writeQuery/modify)
  if (error instanceof InvariantError) {
    return [
      {
        category: 'cache',
        code: 'InvariantError',
        message: error.message,
        log: error.stack ?? error.message,
      },
    ]
  }
  if (LocalStateError.is(error)) {
    return [
      {
        category: 'apollo',
        code: 'LocalState',
        message: error.message,
        meta: error.path
          ? [{ label: 'path', value: error.path.join('.') }]
          : undefined,
        log: error.stack ?? error.message,
      },
    ]
  }
  // a non-Error value thrown somewhere in the link chain
  if (UnconventionalError.is(error)) {
    return [
      {
        category: 'apollo',
        code: 'Unconventional',
        message: error.message,
        json: error.cause,
        log: safeStringify(error.cause),
      },
    ]
  }
  const errorLike = toErrorLike(error)
  // a fetch that never reached the server rejects with a TypeError
  const isTransport =
    errorLike.name === 'TypeError' &&
    /fetch|network|load/i.test(errorLike.message)
  return [
    {
      category: isTransport ? 'network' : 'code',
      code: errorLike.name,
      message: errorLike.message,
      meta: LinkError.is(error)
        ? [{ label: 'origin', value: 'apollo link chain' }]
        : undefined,
      log: errorLike.stack ?? `${errorLike.name}: ${errorLike.message}`,
    },
  ]
}

/**
 * Successor to core's MutatorWithState, now used app-wide (see the
 * signal-boundary plan §6). Differences: state is signals rather than
 * BehaviorSubjects, there is no cleanup() to remember (apollo's mutate
 * completes after one emission), and submit failures of every category stay
 * form-local — the app-wide network banner is for out-of-form operations.
 */
@Injectable({ providedIn: 'root' })
export class FormMutationService {
  mutate<M extends Mutation<any, any>>(
    mutation: M,
    vars: MutationVars<M>,
    options?: Omit<
      Apollo.MutateOptions<MutationData<M>, any>,
      'mutation' | 'variables'
    >,
    dataCallback?: (data: MutationData<M>) => void,
    errorCallback?: (errors: FormSubmissionError[]) => void
  ): FormMutationState {
    const isSubmitting = signal(true)
    const success = signal(false)
    const errors = signal<FormSubmissionError[]>([])

    // bind + assert to sidestep the `{} extends V` conditional tuple in
    // Mutation#mutate's signature, which cannot resolve for a generic V
    const mutate = mutation.mutate.bind(mutation) as (
      options: Record<string, unknown>
    ) => Observable<Apollo.MutateResult<MutationData<M>>>

    mutate({ variables: vars, ...options })
      .pipe(finalize(() => isSubmitting.set(false)))
      .subscribe({
        next: (res) => {
          if (res.data && dataCallback) {
            dataCallback(res.data)
          }
        },
        error: (error: unknown) => {
          const submissionErrors = toSubmissionErrors(error)
          errors.set(submissionErrors)
          if (errorCallback) errorCallback(submissionErrors)
        },
        complete: () => {
          errors.set([])
          success.set(true)
        },
      })

    return {
      isSubmitting: isSubmitting.asReadonly(),
      success: success.asReadonly(),
      errors: errors.asReadonly(),
    }
  }
}

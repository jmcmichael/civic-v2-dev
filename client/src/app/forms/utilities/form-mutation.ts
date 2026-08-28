import { Injectable, Signal, signal } from '@angular/core'
import {
  CombinedGraphQLErrors,
  ServerError,
  ServerParseError,
  toErrorLike,
} from '@apollo/client/errors'
import { Apollo, Mutation } from 'apollo-angular'
import { Observable, finalize } from 'rxjs'

/**
 * One submit-time failure, categorized for the form error tag: what kind of
 * failure (`category`), a machine code when one exists (GraphQL extension
 * code, HTTP status), the `message`, and optional `details` for the tag's
 * popover. `log` carries the full raw error — serialized GraphQL error,
 * response body, or stack trace — for the error tag's details modal.
 */
export interface FormSubmissionError {
  readonly category: 'graphql' | 'network' | 'browser'
  readonly code?: string
  readonly message: string
  readonly details?: string[]
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

function toSubmissionErrors(error: unknown): FormSubmissionError[] {
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors.map((e) => {
      const code = e.extensions?.['code']
      return {
        category: 'graphql' as const,
        code: typeof code === 'string' ? code : undefined,
        message: e.message,
        details: e.path ? [`path: ${e.path.join('.')}`] : undefined,
        // GraphQLError#toJSON serializes message, path, locations, extensions
        log: JSON.stringify(e, null, 2),
      }
    })
  }
  if (ServerError.is(error) || ServerParseError.is(error)) {
    return [
      {
        category: 'network',
        code: String(error.statusCode),
        message: error.message,
        log: [`HTTP ${error.statusCode}`, error.bodyText, error.stack]
          .filter(Boolean)
          .join('\n\n'),
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
      category: isTransport ? 'network' : 'browser',
      code: errorLike.name,
      message: errorLike.message,
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

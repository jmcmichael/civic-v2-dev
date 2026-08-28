import { inject, Injectable, Signal, signal } from '@angular/core'
import { AppErrorsService } from '@app/core/services/app-errors.service'
import {
  FormSubmissionError,
  toSubmissionErrors,
} from '@app/core/utilities/submission-errors'
import { Apollo, Mutation } from 'apollo-angular'
import { Observable, finalize } from 'rxjs'

// the error model lives in core (the app-wide error service shares it);
// re-exported here so form-side consumers keep one import site
export { toSubmissionErrors }
export type { FormSubmissionError }

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

/**
 * Successor to core's MutatorWithState, now used app-wide (see the
 * signal-boundary plan §6). Differences: state is signals rather than
 * BehaviorSubjects, there is no cleanup() to remember (apollo's mutate
 * completes after one emission), and submit failures route by category:
 * graphql validation stays form-local, the rest reach AppErrorsService
 * (network via the apollo error link, which sees every operation).
 */
@Injectable({ providedIn: 'root' })
export class FormMutationService {
  private appErrors = inject(AppErrorsService)

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
          // the form owns graphql validation; transport failures already
          // reported once via the apollo error link (network → the app
          // modal); apollo/cache/code failures notify app-wide
          errors.set(submissionErrors.filter((e) => e.category === 'graphql'))
          this.appErrors.reportErrors(
            submissionErrors.filter(
              (e) => e.category !== 'graphql' && e.category !== 'network'
            )
          )
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

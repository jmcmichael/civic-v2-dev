import { Injectable, Signal, inject, signal } from '@angular/core'
import { CombinedGraphQLErrors, toErrorLike } from '@apollo/client/errors'
import { NetworkErrorsService } from '@app/core/services/network-errors.service'
import { Apollo, Mutation } from 'apollo-angular'
import { Observable, finalize } from 'rxjs'

/**
 * Per-submit mutation state for form templates. Server-side validation
 * messages land in `errors`; transport failures go to the app's network
 * error banner, same as before.
 */
export interface FormMutationState {
  readonly isSubmitting: Signal<boolean>
  readonly success: Signal<boolean>
  readonly errors: Signal<string[]>
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
 * Forms-local successor to core's MutatorWithState (see the signal-boundary
 * plan §6). Differences: state is signals rather than BehaviorSubjects, there
 * is no cleanup() to remember (apollo's mutate completes after one emission),
 * and success no longer clears the app-wide network error banner — a
 * per-mutation helper has no business dismissing errors it did not raise.
 * The app-wide consumers migrate to this once it has proven out here.
 */
@Injectable({ providedIn: 'root' })
export class FormMutationService {
  private readonly networkErrors = inject(NetworkErrorsService)

  mutate<M extends Mutation<any, any>>(
    mutation: M,
    vars: MutationVars<M>,
    options?: Omit<
      Apollo.MutateOptions<MutationData<M>, any>,
      'mutation' | 'variables'
    >,
    dataCallback?: (data: MutationData<M>) => void
  ): FormMutationState {
    const isSubmitting = signal(true)
    const success = signal(false)
    const errors = signal<string[]>([])

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
          if (CombinedGraphQLErrors.is(error)) {
            errors.set(error.errors.map((e) => e.message))
          } else {
            this.networkErrors.networkError$.next(toErrorLike(error))
          }
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

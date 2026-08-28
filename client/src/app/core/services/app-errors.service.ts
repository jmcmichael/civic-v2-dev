import { Injectable, signal } from '@angular/core'
import {
  FormSubmissionError,
  toSubmissionErrors,
} from '@app/core/utilities/submission-errors'
import { Subject } from 'rxjs'

/**
 * App-wide error reporting: categorizes failures with the same capture
 * ladder as form submits and routes them by severity — network failures
 * collect for the blocking error modal, everything else raises an error
 * notification. Successor to NetworkErrorsService and its banner.
 *
 * Capture-and-route only: cvc-app-errors (rendered once in the app
 * component) owns the NzNotification and NzModal display, so this service
 * stays free of UI dependencies. Producers: the apollo error link
 * (transport failures on any operation), FormMutationService (a submit's
 * non-graphql failures) and AppErrorHandler (uncaught exceptions, stale
 * lazy chunks after a deploy).
 */
@Injectable({ providedIn: 'root' })
export class AppErrorsService {
  // errors awaiting the blocking modal: network failures, plus any batch
  // escalated from a notification's View Details
  private readonly _modalErrors = signal<FormSubmissionError[]>([])
  readonly modalErrors = this._modalErrors.asReadonly()

  /** notification-worthy batches (apollo internals, cache, code errors) */
  readonly notify$ = new Subject<FormSubmissionError[]>()

  // a deploy replaced the lazy chunks this session was built from
  private readonly _staleChunk = signal(false)
  readonly staleChunk = this._staleChunk.asReadonly()

  report(error: unknown, operation?: string): void {
    const errors = toSubmissionErrors(error).map((e) =>
      operation
        ? {
            ...e,
            meta: [...(e.meta ?? []), { label: 'operation', value: operation }],
          }
        : e
    )
    this.reportErrors(errors)
  }

  reportErrors(errors: FormSubmissionError[]): void {
    const blocking = errors.filter((e) => e.category === 'network')
    const notified = errors.filter((e) => e.category !== 'network')
    if (blocking.length) {
      this._modalErrors.update((current) => [...current, ...blocking])
    }
    if (notified.length) {
      this.notify$.next(notified)
    }
  }

  /** move a notification's batch into the blocking modal */
  escalate(errors: FormSubmissionError[]): void {
    this._modalErrors.update((current) => [...current, ...errors])
  }

  clearModal(): void {
    this._modalErrors.set([])
  }

  promptStaleChunk(): void {
    this._staleChunk.set(true)
  }
}

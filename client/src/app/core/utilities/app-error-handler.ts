import { ErrorHandler, Injectable, Injector, inject } from '@angular/core'
import { AppErrorsService } from '@app/core/services/app-errors.service'
import { environment } from 'environments/environment'

// webpack said "Loading chunk N failed"; the esbuild builder throws
// "Failed to fetch dynamically imported module" (Chrome) / "error loading
// dynamically imported module" (Firefox)
const CHUNK_FAILED =
  /Loading chunk \S+ failed|(Failed to fetch|error loading) dynamically imported module/i

/**
 * Global catch-all feeding AppErrorsService: a failed lazy-chunk load in
 * production means a deploy replaced this session's build, so prompt a
 * reload; anything else reports as an app error (a notification, routed by
 * the service). Everything still lands on the console.
 */
@Injectable()
export class AppErrorHandler implements ErrorHandler {
  // Injector, not the service: ErrorHandler is constructed before most of
  // the app, and must never fail its own injection
  private injector = inject(Injector)

  handleError(error: unknown): void {
    console.error(error)
    const errorLike = error as { message?: string; rejection?: Error }
    const message = String(
      errorLike?.message ?? errorLike?.rejection?.message ?? ''
    )
    try {
      const appErrors = this.injector.get(AppErrorsService)
      if (CHUNK_FAILED.test(message)) {
        if (environment.production) appErrors.promptStaleChunk()
        return
      }
      appErrors.report(errorLike?.rejection ?? error)
    } catch {
      // the reporter itself failed; the console already has the error
    }
  }
}

import { Injectable, signal } from '@angular/core'
import { EventFeedMode } from '@app/generated/civic.apollo.types'
import { ActivityStreamScope } from './activity-stream.types'

/**
 * Per-stream presentation state the activity item renderers read — provided
 * by `cvc-activity-stream` and reached through the element injector, so
 * item content rendered inside the stream's view needs no inputs threaded
 * through the generic shell.
 *
 * `scope` drives which tags a summary line elides (a user-scoped stream
 * repeats no user tag; a subject-scoped one names no subject);
 * `showOrganization` is the settings/filter-derived visibility of the
 * organization tag.
 */
@Injectable()
export class ActivityStreamState {
  readonly scope = signal<ActivityStreamScope>({
    mode: EventFeedMode.Unscoped,
  })
  readonly showOrganization = signal(true)
}

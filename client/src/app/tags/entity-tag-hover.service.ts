import { Injectable, computed, signal } from '@angular/core'

/** instant-open persists this long after the last popover interaction */
const WARM_WINDOW_MS = 1000
/** ng-zorro's stock enter delay, in its unit (seconds) */
const COLD_ENTER_DELAY_S = 0.15

/**
 * Shared hover intent across every tag popover, giving them menu-bar
 * semantics: the first popover costs the normal enter delay, and while the
 * user keeps moving between popover-bearing tags — under a second between
 * interactions — each subsequent popover opens instantly. Pause longer and
 * the delay is back.
 *
 * ng-zorro has no grouped-hover API, but its directive reads the enter
 * delay at mouseenter time, so tags simply bind `enterDelay` and report
 * their popovers' visibility changes here. Both opening and closing count
 * as interaction: a close is the user leaving one tag for (possibly) the
 * next, which is exactly the moment the window should restart from.
 */
@Injectable({ providedIn: 'root' })
export class EntityTagHoverService {
  private readonly warmState = signal(false)
  private expiry?: ReturnType<typeof setTimeout>

  /** whether the user is actively scanning popovers */
  readonly warm = this.warmState.asReadonly()

  /** seconds zorro should wait before opening a popover */
  readonly enterDelay = computed(() =>
    this.warmState() ? 0 : COLD_ENTER_DELAY_S
  )

  /** report a popover opening or closing; (re)starts the warm window */
  noteActivity(): void {
    this.warmState.set(true)
    clearTimeout(this.expiry)
    this.expiry = setTimeout(() => this.warmState.set(false), WARM_WINDOW_MS)
  }
}

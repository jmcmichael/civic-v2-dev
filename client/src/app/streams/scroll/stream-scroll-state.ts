import { DestroyRef, Injectable, inject, signal } from '@angular/core'

/**
 * How long after the last scroll event the stream still counts as
 * scrolling. Covers the gap between event bursts so hover-suspension does
 * not flicker mid-scroll.
 */
export const SCROLL_SETTLE_MS = 300

/**
 * The scroll state a stream's item content reads — provided per stream
 * instance, fed by the scroll engine's event routines.
 *
 * `isScrolling` is the signal item renderers suspend hover-triggered
 * overlays (popovers, tooltips) on; `isAtTop`/`isAtBottom` describe the
 * viewport's position within the scrollable extent.
 */
@Injectable()
export class CvcStreamScrollState {
  private readonly scrolling = signal(false)
  private readonly atTop = signal(true)
  private readonly atBottom = signal(true)
  private settleTimer?: ReturnType<typeof setTimeout>

  /** true from the first scroll event until `SCROLL_SETTLE_MS` after the last */
  readonly isScrolling = this.scrolling.asReadonly()

  /** true while the viewport shows the top of the scrollable extent */
  readonly isAtTop = this.atTop.asReadonly()

  /** true while the viewport shows the bottom of the scrollable extent */
  readonly isAtBottom = this.atBottom.asReadonly()

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.settleTimer))
  }

  /**
   * Records one scroll observation. The engine calls this on every viewport
   * scroll event and once on attachment, so position state is defined before
   * the first scroll.
   *
   * @param position the viewport's scroll offset (px)
   * @param scrollerSize the scrollable content's full extent (px)
   * @param viewportSize the viewport's visible extent (px)
   */
  reportScroll(
    position: number,
    scrollerSize: number,
    viewportSize: number
  ): void {
    this.atTop.set(position <= 0)
    this.atBottom.set(position + viewportSize >= scrollerSize)
    this.scrolling.set(true)
    clearTimeout(this.settleTimer)
    this.settleTimer = setTimeout(
      () => this.scrolling.set(false),
      SCROLL_SETTLE_MS
    )
  }

  /**
   * Records the initial geometry without counting it as scrolling — the
   * engine reports once on attachment so `isAtTop`/`isAtBottom` are defined
   * before any user scroll.
   */
  reportGeometry(
    position: number,
    scrollerSize: number,
    viewportSize: number
  ): void {
    this.atTop.set(position <= 0)
    this.atBottom.set(position + viewportSize >= scrollerSize)
  }
}

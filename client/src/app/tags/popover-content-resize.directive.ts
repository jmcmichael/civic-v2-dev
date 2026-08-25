import {
  Directive,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  inject,
  output,
} from '@angular/core'

/**
 * Emits whenever the host element's size changes (initial layout included —
 * `ResizeObserver` reports once on observe).
 *
 * Exists for popover content: the overlay positions itself against whatever
 * is rendered at open — for `cvc-tag` that is a small spinner — and never
 * re-measures on its own, so when the lazy popover component and then its
 * query content land, the card grows away from the anchor and the stem
 * points at nothing. The bespoke tags solved this with a per-component
 * `(contentRendered)` output; observing the content's box covers every
 * growth step (lazy load, query, images) with no per-popover contract.
 */
@Directive({
  selector: '[cvcPopoverContentResize]',
})
export class CvcPopoverContentResizeDirective implements OnInit, OnDestroy {
  readonly cvcPopoverContentResize = output<void>()

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef)
  private readonly zone = inject(NgZone)
  private observer?: ResizeObserver

  ngOnInit(): void {
    this.observer = new ResizeObserver(() =>
      this.zone.run(() => this.cvcPopoverContentResize.emit())
    )
    this.observer.observe(this.host.nativeElement)
  }

  ngOnDestroy(): void {
    this.observer?.disconnect()
  }
}

import {
  DestroyRef,
  Directive,
  ElementRef,
  NgZone,
  OnInit,
  inject,
} from '@angular/core'

/**
 * Gives the host a viewport-filling min-height from first paint, so a page
 * container renders at its final size before its content (a lazy-loading
 * browse table) arrives, instead of jumping short-to-tall. The bottom
 * reserve is measured — every ancestor's bottom padding/border/margin plus
 * the host's own bottom margin — the same method as the entity-table's
 * 'auto' height and the form card's 'page' target, never a hand-tuned
 * offset. Content taller than the viewport still grows the host normally.
 */
@Directive({
  selector: '[cvcPageFill]',
  standalone: true,
})
export class CvcPageFillDirective implements OnInit {
  private host = inject<ElementRef<HTMLElement>>(ElementRef)
  private zone = inject(NgZone)
  private destroyRef = inject(DestroyRef)

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      const el = this.host.nativeElement
      const update = () => {
        const top = el.getBoundingClientRect().top
        let reserve = parseFloat(getComputedStyle(el).marginBottom) || 0
        let ancestor = el.parentElement
        while (ancestor && ancestor !== document.documentElement) {
          const style = getComputedStyle(ancestor)
          reserve +=
            (parseFloat(style.paddingBottom) || 0) +
            (parseFloat(style.borderBottomWidth) || 0) +
            (parseFloat(style.marginBottom) || 0)
          ancestor = ancestor.parentElement
        }
        el.style.minHeight = `${window.innerHeight - top - reserve}px`
      }
      // now, again after first layout settles, then on any host resize or
      // window resize. The parent is observed too: a top-edge shift
      // (content above the host settling in) changes the host's available
      // height without resizing the host itself — and the body can't stand
      // in for it, since the app scrolls in an inner container and the
      // body never resizes.
      update()
      const raf = requestAnimationFrame(update)
      const settle = setTimeout(update, 300)
      const resizeObserver = new ResizeObserver(update)
      resizeObserver.observe(el)
      if (el.parentElement) resizeObserver.observe(el.parentElement)
      window.addEventListener('resize', update, { passive: true })
      this.destroyRef.onDestroy(() => {
        cancelAnimationFrame(raf)
        clearTimeout(settle)
        resizeObserver.disconnect()
        window.removeEventListener('resize', update)
      })
    })
  }
}

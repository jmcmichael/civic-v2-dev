import {
  DestroyRef,
  Directive,
  ElementRef,
  NgZone,
  OnInit,
  Renderer2,
  inject,
  input,
} from '@angular/core'

/**
 * Marks a host whose inner container scrolls: while content is scrolled
 * under the header edge the host gets `scrolled-from-top`, and while more
 * content continues past the footer edge it gets `scrolled-from-bottom`.
 * The host's stylesheet draws the shadows; this directive only keeps the
 * two classes truthful, on scroll and on any resize of the container or
 * its content, and carries the tint they should be cast in.
 */
@Directive({
  selector: '[cvcScrollShadows]',
  standalone: true,
  host: { '[style.--cvc-shadow-tint]': 'cvcScrollShadowTint()' },
})
export class CvcScrollShadowsDirective implements OnInit {
  /**
   * CSS selector for the scrolling container inside the host. A bare
   * attribute binds '' — treated as the default.
   */
  readonly cvcScrollShadows = input<string>('')

  /**
   * A CSS color the host's shadows are cast in, published as
   * `--cvc-shadow-tint`. The paint stays in the host's stylesheet; this only
   * carries the value there, so a shadow can take the color of the surface
   * casting it rather than a neutral black. Unset publishes nothing, and the
   * stylesheet's own fallback stands.
   */
  readonly cvcScrollShadowTint = input<string | null>(null)

  private host = inject<ElementRef<HTMLElement>>(ElementRef)
  private renderer = inject(Renderer2)
  private zone = inject(NgZone)
  private destroyRef = inject(DestroyRef)

  ngOnInit(): void {
    // the container may render after this host (e.g. inside @if); poll a
    // frame at a time until it exists, then attach
    this.zone.runOutsideAngular(() => this.attachWhenReady())
  }

  private attachWhenReady(attempts = 0): void {
    const container = this.host.nativeElement.querySelector<HTMLElement>(
      this.cvcScrollShadows() || '.ant-card-body'
    )
    if (!container) {
      if (attempts < 60) {
        const id = requestAnimationFrame(() =>
          this.attachWhenReady(attempts + 1)
        )
        this.destroyRef.onDestroy(() => cancelAnimationFrame(id))
      }
      return
    }

    const update = () => {
      const scrolledFromTop = container.scrollTop > 0
      // allow a sub-pixel of slack: scrollTop is fractional on zoomed displays
      const scrolledFromBottom =
        container.scrollTop + container.clientHeight <
        container.scrollHeight - 1
      this.toggle('scrolled-from-top', scrolledFromTop)
      this.toggle('scrolled-from-bottom', scrolledFromBottom)
    }

    container.addEventListener('scroll', update, { passive: true })
    const resizeObserver = new ResizeObserver(update)
    resizeObserver.observe(container)
    // content growth/shrink changes scrollHeight without a scroll event
    for (const child of Array.from(container.children)) {
      resizeObserver.observe(child)
    }
    this.destroyRef.onDestroy(() => {
      container.removeEventListener('scroll', update)
      resizeObserver.disconnect()
    })
    update()
  }

  private toggle(className: string, on: boolean): void {
    if (on) {
      this.renderer.addClass(this.host.nativeElement, className)
    } else {
      this.renderer.removeClass(this.host.nativeElement, className)
    }
  }
}

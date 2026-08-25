import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling'
import {
  DestroyRef,
  Directive,
  effect,
  inject,
  input,
  output,
} from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { Maybe } from '@app/generated/civic.apollo.types'
import { CvcPageInfo } from './connection.types'
import { NzTableComponent } from 'ng-zorro-antd/table'
import { asyncScheduler } from 'rxjs'
import {
  debounceTime,
  filter,
  map,
  take,
  tap,
  throttleTime,
} from 'rxjs/operators'

/** phase of a scroll gesture; hosts use it to suspend expensive cell content */
export type CvcScrollEvent = 'scroll' | 'stop' | 'bottom'

/** a request for the next page, in relay terms */
export type CvcScrollFetch = { first: number; after: string }

/** distance from the end of the rendered rows at which to ask for more */
const DEFAULT_TARGET_HEIGHT = 140
/** at most one fetch request per this interval */
const LOAD_THROTTLE_MS = 500
/** 'scroll' repeats at this interval while a gesture continues */
const SCROLL_THROTTLE_MS = 250
/** 'stop' fires this long after the last throttled scroll */
const SCROLL_DEBOUNCE_MS = 300

/**
 * Emits scroll phase and next-page requests for a virtual-scrolled nz-table.
 *
 * It reports rather than acts: the host owns the QueryRef and decides what a
 * fetch request means, which is what lets one query pipeline serialise
 * refetches and fetchMores instead of racing them. (The app-wide
 * `cvcTableScroll` calls `fetchMore` itself; it stays until the browse tables
 * move onto this table, at which point it goes too.)
 *
 * The selector is `cvcTableScrollObserver`, not `cvcTableScroll`, because that
 * name belongs to the app-wide directive and both would otherwise run on the
 * same `nz-table` — with the app-wide one calling `fetchMore` on a QueryRef
 * this table owns. The bindings are not prefixed: this is an implementation
 * detail of `cvc-entity-table`, read in exactly one template.
 *
 * Bottom detection reads the current offset rather than comparing successive
 * offsets with `pairwise()`: requiring two distinct decreasing readings means
 * a single-motion scrollbar drag to the end produces only one event and
 * silently fetches nothing.
 */
@Directive({ selector: '[cvcTableScrollObserver]' })
export class CvcTableScrollObserverDirective {
  private readonly host = inject(NzTableComponent<unknown>, { host: true })
  private readonly destroyRef = inject(DestroyRef)

  /** how close to the end, in px, counts as "at the bottom" */
  readonly targetHeight = input(DEFAULT_TARGET_HEIGHT)
  /** rows per page; only consulted when a fetch is actually requested */
  readonly fetchCount = input(50)
  /** the current connection's page info; without it nothing is ever fetched */
  readonly pageInfo = input<Maybe<CvcPageInfo>>(undefined)
  /** set to send the viewport back to a row, e.g. row 0 after a refetch */
  readonly scrollToIndex = input<Maybe<number>>(undefined)

  /** scroll gesture phase; `bottom` accompanies each fetch request */
  readonly scrollPhase = output<CvcScrollEvent>()
  /**
   * A request for the next page. Near-bottom scrolling fires repeatedly, so
   * the host must ignore a request for a cursor it already has in flight —
   * dedup lives with the QueryRef's owner because only it knows when a
   * refetch has made a cursor stale (see
   * `CvcEntityTableComponent.onFetchRequest`).
   */
  readonly fetchRequest = output<CvcScrollFetch>()

  constructor() {
    effect(() => {
      const index = this.scrollToIndex()
      if (index === undefined || index === null) return
      this.viewport()?.scrollToIndex(index)
    })

    // the viewport only exists after the table has rendered, so binding to it
    // waits for a microtask rather than running in the constructor
    afterViewportReady(this.host, (viewport) => this.connect(viewport))
  }

  private viewport(): Maybe<CdkVirtualScrollViewport> {
    return this.host.cdkVirtualScrollViewport
  }

  private connect(viewport: CdkVirtualScrollViewport): void {
    this.keepViewportMeasured(viewport)

    const scrolled = viewport.elementScrolled()

    scrolled
      .pipe(
        throttleTime(SCROLL_THROTTLE_MS, asyncScheduler, {
          leading: true,
          trailing: true,
        }),
        tap(() => this.scrollPhase.emit('scroll')),
        debounceTime(SCROLL_DEBOUNCE_MS),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.scrollPhase.emit('stop'))

    scrolled
      .pipe(
        // An unmeasured viewport reports zero distance to the bottom, so it
        // reads as "already scrolled to the end" and would ask for a page
        // before the user has done anything. A table mounting inside a drawer
        // does spend a frame at zero height, and the resize that fixes it
        // emits a scroll event — so this is reachable.
        filter(() => viewport.getViewportSize() > 0),
        map(() => viewport.measureScrollOffset('bottom')),
        filter((offset) => offset < this.targetHeight()),
        throttleTime(LOAD_THROTTLE_MS),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.scrollPhase.emit('bottom')
        this.requestFetch()
      })
  }

  /**
   * Keeps the viewport's measurement in step with its container's actual size.
   *
   * CDK measures the viewport once, during its first render — which lands
   * before the auto-height directives above it have finished sizing the
   * container. The viewport is left believing it is short, renders a handful of
   * rows into a tall table, and never re-measures. The long-standing workaround
   * was a one-shot `checkViewportSize()` after the first rendered range, plus,
   * on some tables, a min-height chosen to force the initial correction.
   *
   * Both are timing guesses. Observing the element instead removes the timing
   * question: whatever resizes it and whenever — auto-height settling, a drawer
   * opening, a window resize, a column-visibility change — the measurement
   * follows. The re-measure is deferred to an animation frame and coalesced,
   * because `checkViewportSize()` can itself resize the element and would
   * otherwise re-enter the observer.
   */
  private keepViewportMeasured(viewport: CdkVirtualScrollViewport): void {
    const element = viewport.elementRef.nativeElement
    let scheduled = false

    const remeasure = () => {
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(() => {
        scheduled = false
        viewport.checkViewportSize()
      })
    }

    const observer = new ResizeObserver(remeasure)
    observer.observe(element)
    // the container is what the auto-height directives actually resize
    if (element.parentElement) observer.observe(element.parentElement)

    this.destroyRef.onDestroy(() => observer.disconnect())

    // covers the first paint, before any resize has necessarily occurred
    viewport.renderedRangeStream
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(remeasure)
  }

  private requestFetch(): void {
    const fetch = nextFetch(this.pageInfo(), this.fetchCount())
    if (fetch) this.fetchRequest.emit(fetch)
  }
}

/**
 * The next page to ask for, or undefined when there is nothing to ask for.
 *
 * Split out from the directive because it carries the rules worth testing, and
 * exercising them through a directive would mean standing up a real
 * virtual-scroll viewport with real layout — which jsdom does not provide.
 *
 * In-flight cursor dedup is deliberately NOT here. A stale guard held in the
 * directive cannot be reset when the host refetches, and relay cursors are
 * positional, so a post-refetch first page can legitimately end on the same
 * cursor string — the host's own guard is the only one that can be reset at
 * the right moment.
 *
 * @param pageInfo the current connection's page info
 * @param fetchCount rows to request per page
 * @returns relay pagination arguments for the next page, or undefined
 */
export function nextFetch(
  pageInfo: Maybe<CvcPageInfo>,
  fetchCount: number
): Maybe<CvcScrollFetch> {
  if (!pageInfo?.hasNextPage) return undefined
  const after = pageInfo.endCursor
  // endCursor is nullable on an empty connection
  if (!after) return undefined
  return { first: fetchCount, after }
}

/**
 * Runs `fn` once the table has produced its virtual-scroll viewport. nz-table
 * creates it during its own first render, so it is not available when a
 * directive on the same element constructs.
 */
function afterViewportReady(
  host: NzTableComponent<unknown>,
  fn: (viewport: CdkVirtualScrollViewport) => void
): void {
  queueMicrotask(() => {
    const viewport = host.cdkVirtualScrollViewport
    if (viewport) {
      fn(viewport)
      return
    }
    // one frame later covers the case where the table renders asynchronously
    requestAnimationFrame(() => {
      const late = host.cdkVirtualScrollViewport
      if (!late) {
        throw new Error(
          'cvcTableScrollObserver found no cdkVirtualScrollViewport on its host nz-table. ' +
            'The table needs [nzVirtualItemSize] and an nz-virtual-scroll body.'
        )
      }
      fn(late)
    })
  })
}

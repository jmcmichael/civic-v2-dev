import { ViewportRuler } from '@angular/cdk/scrolling'
import { DecimalPipe } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  computed,
  contentChild,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
} from '@angular/core'
import { debouncedSignal } from '@app/core/utilities/debounced-signal'
import { Maybe } from '@app/generated/civic.apollo.types'
import { CvcConnection, CvcEdge } from '@app/tables/connection.types'
import { PolymorpheusOutlet } from '@taiga-ui/polymorpheus'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzCardModule } from 'ng-zorro-antd/card'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzResultModule } from 'ng-zorro-antd/result'
import { NzSpaceModule } from 'ng-zorro-antd/space'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { NzTooltipModule } from 'ng-zorro-antd/tooltip'
import { NzTypographyModule } from 'ng-zorro-antd/typography'
import { UiScrollModule } from 'ngx-ui-scroll'
import { EntityStreamSpec } from './entity-stream-config'
import {
  CvcEntityStreamQuery,
  CvcStreamRequestError,
} from './entity-stream-query'
import { CvcStreamEmptyContext } from './entity-stream.types'
import { CvcStreamScrollState } from './scroll/stream-scroll-state'
import {
  CvcStreamScrollEngine,
  createVscrollEngine,
} from './scroll/vscroll-engine'
import { CvcStreamItemComponent } from './stream-item.component'
import { CvcStreamSidebarDirective } from './stream-slots'
import { CvcStreamState } from './stream-state'

/** how long filter changes coalesce before one query runs */
const QUERY_DEBOUNCE_MS = 300

/** the smallest list body `height: 'auto'` will produce */
const AUTO_HEIGHT_MIN = 200

/** what `'auto'` renders before its first measurement */
const AUTO_HEIGHT_FALLBACK = '400px'

/**
 * The configurable entity stream: a card-framed, cursor-paginated list of
 * heterogeneous items — virtual-scrolled or Load-More-buttoned — whose
 * rendering, identity and filtering vocabulary all travel in an
 * `EntityStreamSpec` built by `entityStreamConfig()`.
 *
 * A host builds a spec, renders `<cvc-entity-stream [spec]="...">`, and
 * projects any of three content slots:
 *
 * - `[cvcStreamSidebar]` — the filter/facet panel column (its presence is
 *   what renders the sidebar column; import `CvcStreamSidebarDirective`);
 * - `[cvcStreamHeaderExtra]` — the card-extra corner (settings buttons);
 * - `[cvcStreamBanner]` — a full-width region above the list (alerts).
 *
 * Filters are an erased variables patch: the host owns its filter
 * vocabulary and widgets, converts them to query variables, and binds
 * `[filters]`; the stream merges `{ first, ...filters, ...scope }` —
 * scope wins collisions, so a filter cannot widen the stream's scope —
 * debounces, dedups by value, and runs the query.
 */
@Component({
  selector: 'cvc-entity-stream',
  templateUrl: './entity-stream.component.html',
  styleUrl: './entity-stream.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CvcStreamScrollState, CvcStreamState],
  imports: [
    DecimalPipe,
    NzButtonModule,
    NzCardModule,
    NzGridModule,
    NzIconModule,
    NzResultModule,
    NzSpaceModule,
    NzSpinModule,
    NzTagModule,
    NzTooltipModule,
    NzTypographyModule,
    PolymorpheusOutlet,
    UiScrollModule,
    CvcStreamItemComponent,
  ],
})
export class CvcEntityStreamComponent<TItem extends { id: number }> {
  /** the stream's configuration; see `entityStreamConfig` */
  readonly spec = input.required<EntityStreamSpec<TItem>>()

  /**
   * The host's filter state as a query-variables patch. Cleared filters are
   * `undefined` (dropped from the request), never explicit nulls.
   */
  readonly filters = input<Record<string, unknown>>({})

  /**
   * The list body height, three ways:
   *
   * - an explicit CSS height (`'400px'`) — the list scrolls inside it;
   * - `'auto'` — fit the visible viewport: the list fills the window's
   *   remaining height minus everything below it that the page layout
   *   reserves, measured live (see `measureAutoHeight`);
   * - omitted — fill a height-bounded ancestor through the card's flex
   *   chain. With no bounded ancestor an `'infinite'` stream collapses —
   *   use `'auto'` there instead; a `'button'` stream simply flows.
   */
  readonly height = input<string>()

  /** ids of the checked items; two-way, and the complete set on every change */
  readonly selectedIds = model<number[]>([])

  private readonly destroyRef = inject(DestroyRef)
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef)
  private readonly zone = inject(NgZone)
  private readonly viewportRuler = inject(ViewportRuler)
  private readonly state = inject(CvcStreamState)
  private readonly scroll = inject(CvcStreamScrollState)

  /**
   * The query pipeline. Public so a facade can reach `refresh()` and the
   * loading/error signals through a `viewChild` of this component.
   */
  readonly query = new CvcEntityStreamQuery({
    query: () => this.spec().query,
    connection: (data) => this.spec().connection(data),
    destroyRef: this.destroyRef,
    onRefetch: () => this.engineRef()?.reload(),
  })

  /** the spec's connection, typed back to the component's item type */
  readonly connection = computed(
    () => this.query.connection() as Maybe<CvcConnection<TItem>>
  )
  readonly loading = this.query.loading
  readonly refetching = this.query.refetching
  readonly requestError = this.query.requestError

  /** ids of the items whose detail regions are shown */
  readonly expandedIds = this.state.expandedIds

  protected readonly edges = computed(
    () => (this.connection()?.edges ?? []) as ReadonlyArray<CvcEdge<TItem>>
  )
  protected readonly hasNextPage = computed(
    () => this.connection()?.pageInfo?.hasNextPage ?? false
  )

  /** a result set arrived and holds nothing — the empty state's condition */
  readonly zeroItems = computed(
    () => !this.loading() && !!this.connection() && this.edges().length === 0
  )

  /** the spec's counts, derived from the current connection */
  readonly counts = computed(() => {
    const connection = this.connection()
    const accessor = this.spec().counts
    return connection && accessor ? accessor(connection) : undefined
  })

  private readonly engineRef =
    signal<Maybe<CvcStreamScrollEngine<TItem>>>(undefined)
  protected readonly engine = this.engineRef.asReadonly()

  private readonly sidebarContent = contentChild(CvcStreamSidebarDirective)
  protected readonly hasSidebar = computed(
    () => this.sidebarContent() !== undefined
  )

  protected readonly emptyContext = computed<CvcStreamEmptyContext>(() => ({
    scope: this.spec().scope,
  }))

  private readonly measuredAutoHeight = signal<Maybe<string>>(undefined)

  /** what the list body's height style receives; see `height` */
  protected readonly bodyHeight = computed(() => {
    const height = this.height()
    if (height === 'auto') {
      return this.measuredAutoHeight() ?? AUTO_HEIGHT_FALLBACK
    }
    return height
  })

  /** everything the query runs with; scope wins collisions with filters */
  private readonly queryVars = computed<Record<string, unknown>>(() => ({
    first: this.spec().pageSize,
    ...this.filters(),
    ...this.spec().scope,
  }))

  constructor() {
    // One debounced driver for the whole query. The JSON identity matters:
    // `queryVars` builds a fresh object on any read of its sources, and
    // variables are JSON by definition, so stringify is a sound identity
    // that keeps identical variable sets from re-querying.
    const debouncedVars = debouncedSignal(
      this.queryVars,
      QUERY_DEBOUNCE_MS,
      (a, b) => JSON.stringify(a) === JSON.stringify(b)
    )
    effect(() => {
      const vars = debouncedVars()
      if (!vars) return
      untracked(() => this.query.run(vars))
    })

    // The scroll engine exists once an `'infinite'` stream has its first
    // result set — the scroller renders windows of an extent that has to
    // exist first — and lives for the component's lifetime; refetches go
    // through `reload()` rather than a new engine.
    effect(() => {
      if (this.engineRef()) return
      if (!this.connection()) return
      untracked(() => {
        if (this.spec().pagination !== 'infinite') return
        this.engineRef.set(
          createVscrollEngine<TItem>({
            getRange: (index, count) =>
              this.query.getRange(index, count) as Promise<
                ReadonlyArray<CvcEdge<TItem>>
              >,
            settings: this.spec().scroller,
            state: this.scroll,
          })
        )
      })
    })

    // selection: model in, state out
    effect(() => {
      const ids = this.selectedIds()
      untracked(() => this.state.setSelection(ids))
    })
    this.state.onSelectionChange = (ids) => this.selectedIds.set([...ids])
    this.state.onHeightSettled = () => this.engineRef()?.check()

    // `height: 'auto'` — measure once the view exists, then on every window
    // resize (ViewportRuler) and host box change. Signal equality makes the
    // loop stable: re-measuring after our own height write produces the
    // same string and notifies nothing.
    afterNextRender(() => {
      if (this.height() !== 'auto') return
      this.measureAutoHeight()

      const observer = new ResizeObserver(() =>
        this.zone.run(() => this.measureAutoHeight())
      )
      observer.observe(this.hostRef.nativeElement)
      const ruler = this.viewportRuler
        .change(50)
        .subscribe(() => this.zone.run(() => this.measureAutoHeight()))
      this.destroyRef.onDestroy(() => {
        observer.disconnect()
        ruler.unsubscribe()
      })
    })
  }

  /** re-runs the current variable set — a host's refresh affordance */
  refresh(): void {
    this.query.refresh()
  }

  protected loadMore(): void {
    const pageInfo = this.connection()?.pageInfo
    void this.query.fetchMore({
      first: this.spec().pageSize,
      after: pageInfo?.endCursor ?? undefined,
    })
  }

  protected errorMessages(error: CvcStreamRequestError): string {
    if (error.query) return error.query.map((e) => e.message).join('; ')
    return error.network?.message ?? 'request failed'
  }

  /**
   * What `'auto'` means: the list body fills the window's remaining height,
   * stopping where the page layout ends rather than at the window edge —
   * the bottom reserve is the *measured* bottom padding/border/margin of
   * every ancestor, plus the card's own chrome below the list body. The
   * same model as `cvc-entity-table`'s `height: 'auto'`.
   */
  private measureAutoHeight(): void {
    if (this.height() !== 'auto') return
    const host = this.hostRef.nativeElement
    const card = host.querySelector('.entity-stream')
    const body = host.querySelector('.stream-body')
    if (!card || !body) return
    const cardRect = card.getBoundingClientRect()
    const bodyRect = body.getBoundingClientRect()
    // not laid out (hidden tab, display: none): keep the last measurement
    if (cardRect.height === 0) return

    // the card's own bottom padding/border live between the two rects
    // below, so the card contributes only its margin here; ancestors
    // contribute all three
    let reserve = parseFloat(getComputedStyle(card).marginBottom) || 0
    for (
      let el: Element | null = card.parentElement;
      el && el !== document.documentElement;
      el = el.parentElement
    ) {
      const style = getComputedStyle(el)
      reserve +=
        (parseFloat(style.paddingBottom) || 0) +
        (parseFloat(style.borderBottomWidth) || 0) +
        (parseFloat(style.marginBottom) || 0)
    }
    // in-card chrome between the list body and the card's border box —
    // stable whatever the body's current height, so measuring after our own
    // height write is not a feedback loop
    const chromeBelowBody = cardRect.bottom - bodyRect.bottom

    const available =
      this.viewportRuler.getViewportSize().height -
      bodyRect.top -
      chromeBelowBody -
      reserve
    const height = Math.max(AUTO_HEIGHT_MIN, Math.floor(available))
    this.measuredAutoHeight.set(`${height}px`)
  }
}

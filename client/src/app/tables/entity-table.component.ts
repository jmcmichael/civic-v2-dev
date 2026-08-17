import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  model,
  signal,
  TemplateRef,
  untracked,
} from '@angular/core'
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop'
import { FormsModule } from '@angular/forms'
import { CombinedGraphQLErrors, type ErrorLike } from '@apollo/client'
import { Maybe, SortDirection } from '@app/generated/civic.apollo.types'
import { CvcAttributeTagModule } from '@app/forms/components/attribute-tag/attribute-tag.module'
import { CvcEmptyValueModule } from '@app/forms/components/empty-value/empty-value.module'
import {
  CvcCollectionTagComponent,
  CvcTagComponent,
  CvcTagListComponent,
  LabelSegment,
  labelSegments,
  readCachedEntityName,
  writeCachedEntity,
} from '@app/tags'
import { Apollo, QueryRef } from 'apollo-angular'
import type { GraphQLFormattedError } from 'graphql'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzCardModule } from 'ng-zorro-antd/card'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox'
import { NzDropdownModule } from 'ng-zorro-antd/dropdown'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { NzSpaceModule } from 'ng-zorro-antd/space'
import { NzTableModule, NzTableSortOrder } from 'ng-zorro-antd/table'
import { NzTooltipModule } from 'ng-zorro-antd/tooltip'
import { NzTypographyModule } from 'ng-zorro-antd/typography'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { CvcPipesModule } from '@app/core/pipes/pipes.module'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { CvcCellContext, CvcCellDirective } from './cell.directive'
import {
  CvcPageInfo,
  connectionNodes,
  displayedCount,
} from './connection.types'
import { CvcSpecColumn, EntityTableSpec } from './entity-table-config'
import {
  CvcEntityTagCell,
  CvcSortState,
  CvcTableSettings,
  DEFAULT_EMPTY_VALUE,
} from './entity-table.types'
import { CvcEnumFilterMenuComponent } from './filters/enum-filter-menu.component'
import { CvcTableFilterInputComponent } from './filters/table-filter-input.component'
import {
  CvcScrollEvent,
  CvcScrollFetch,
  CvcTableScrollObserverDirective,
} from './table-scroll.directive'

/**
 * Quiet period before a filter or sort change becomes a query. Matches the
 * select typeahead's 300 ms — anything under a fast typist's inter-key
 * interval issues roughly one query per keystroke — and it must be long
 * enough to collapse a filter reset, which emits one change per column.
 */
const QUERY_DEBOUNCE_MS = 300

/** what a request error looks like once split out of Apollo's ErrorLike */
export interface CvcTableRequestError {
  network?: ErrorLike
  query?: ReadonlyArray<GraphQLFormattedError>
}

/** a pinned column's resolved position, and whether it carries the edge shadow */
interface CvcStickyOffset {
  left?: string
  right?: string
  lastLeft: boolean
  firstRight: boolean
}

/**
 * A column's declared width in pixels. Widths are `nzWidth` strings, documented
 * as px on `CvcColumn`; anything else yields 0 rather than NaN, which would
 * poison every offset after it.
 */
function pxWidth(width: string): number {
  const parsed = Number.parseFloat(width)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * One configurable, virtual-scrolled entity table, driven entirely by an
 * `EntityTableSpec` (see `entityTableConfig`).
 *
 * ## The query pipeline, and what must not change about it
 *
 * One `QueryRef`, created lazily on the first variables emission and never
 * re-created. Refetch and fetchMore go through the same guarded path so they
 * cannot race: a refetch replaces the variable set, a fetchMore appends a
 * page, and Apollo's `relayStylePagination` policy — not this component —
 * accumulates the rows.
 *
 * Errors are re-derived by hand because `valueChanges` does not surface
 * errors raised by imperative `refetch`/`fetchMore` calls
 * (apollographql/apollo-client#6857), so each promise's result is inspected
 * too.
 *
 * Filter values live in one signal map that both the query variables and the
 * filter inputs read, so reset clears a single source and the two cannot
 * disagree.
 *
 * @template TRow the row/node type. `id: number` is required because
 *   selection (`selectedIds`, `isSelected`) and row tracking key on it.
 */
@Component({
  selector: 'cvc-entity-table',
  imports: [
    CommonModule,
    FormsModule,
    CvcAttributeTagModule,
    CvcCollectionTagComponent,
    CvcEnumFilterMenuComponent,
    CvcPipesModule,
    CvcTableFilterInputComponent,
    CvcTableScrollObserverDirective,
    CvcTagComponent,
    CvcTagListComponent,
    CvcEmptyValueModule,
    NzButtonModule,
    NzCardModule,
    NzCheckboxModule,
    NzDropdownModule,
    NzGridModule,
    NzIconModule,
    NzPopoverModule,
    NzSpaceModule,
    NzTableModule,
    NzTagModule,
    NzTooltipModule,
    NzTypographyModule,
  ],
  templateUrl: './entity-table.component.html',
  styleUrl: './entity-table.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcEntityTableComponent<TRow extends { id: number }> {
  private readonly apollo = inject(Apollo)
  private readonly destroyRef = inject(DestroyRef)

  readonly spec = input.required<EntityTableSpec<TRow>>()

  /** ids of the checked rows; two-way, and the complete set on every change */
  readonly selectedIds = model<number[]>([])

  /** filters and column visibility pushed in by a host, e.g. a form field */
  readonly settings = input<Maybe<CvcTableSettings>>(undefined)

  /**
   * An explicit body height. Omit to fill the available space: the card is a
   * flex column and the table region is `flex: 1; min-height: 0`, which is what
   * lets `nzScroll.y: 100%` resolve. `nzScroll.y` is not a measurement API — it
   * is written straight to the viewport's `style.height` — so nothing here
   * computes a pixel height in JavaScript.
   */
  readonly height = input<string>()

  /**
   * `cvcCell` overrides supplied by the host. Content children, so the *host*
   * imports `CvcCellDirective` — this component only queries for the type, and
   * importing it here would be flagged as an unused directive.
   */
  readonly cellTemplates = contentChildren(CvcCellDirective)

  /** what an empty cell renders as unless its column overrides it */
  protected readonly defaultEmptyValue = DEFAULT_EMPTY_VALUE

  // ---------------------------------------------------------------- columns

  /** per-key visibility overrides from the preferences panel or `settings` */
  private readonly hiddenOverrides = signal<ReadonlyMap<string, boolean>>(
    new Map()
  )

  readonly columns = computed<CvcSpecColumn<TRow>[]>(() => {
    const overrides = this.hiddenOverrides()
    return this.spec().columns.map((column) => {
      const override = overrides.get(column.key)
      return override === undefined ? column : { ...column, hidden: override }
    })
  })

  readonly visibleColumns = computed(() =>
    this.columns().filter((column) => !column.hidden)
  )

  /**
   * Where each pinned column sits, as a CSS length, plus which one carries the
   * edge shadow.
   *
   * ng-zorro can derive this itself — `nzLeft="true"` makes `NzTrDirective`
   * measure the preceding columns and push an offset back into each cell — but
   * that coordination does not reach these cells: every pinned column resolved
   * to `left: 0` and stacked on top of the next, so the select column sat over
   * the first data column. `ant-table-cell-fix-left-last` never appeared
   * either, and that class is pure list logic with no measurement in it, which
   * is what rules out a width problem. `NzCellFixedDirective.ngOnChanges` also
   * resets that flag on every input change, so the result depends on an
   * ordering we do not control.
   *
   * Every width is a declared px value in the column config, so the offsets are
   * simple arithmetic. Computing them here is exact, needs no measurement pass,
   * and cannot be undone by a later change-detection cycle. `nzLeft` accepts a
   * CSS length as well as a boolean; a string turns ng-zorro's own auto-offset
   * off (`isAutoLeft` is only true for `''` or `true`), which is what we want.
   */
  private readonly stickyOffsets = computed(() => {
    const columns = this.visibleColumns()
    const offsets = new Map<string, CvcStickyOffset>()

    let left = 0
    const pinnedLeft = columns.filter((c) => c.fixed === 'left')
    for (const column of pinnedLeft) {
      offsets.set(column.key, {
        left: `${left}px`,
        lastLeft: column === pinnedLeft[pinnedLeft.length - 1],
        firstRight: false,
      })
      left += pxWidth(column.width)
    }

    let right = 0
    const pinnedRight = columns.filter((c) => c.fixed === 'right')
    // right-pinned columns accumulate from the right-hand edge inward
    for (const column of [...pinnedRight].reverse()) {
      offsets.set(column.key, {
        right: `${right}px`,
        lastLeft: false,
        firstRight: column === pinnedRight[0],
      })
      right += pxWidth(column.width)
    }

    return offsets
  })

  /** `nzLeft` for a column: a CSS length when pinned left, else false */
  stickyLeft(column: CvcSpecColumn<TRow>): string | false {
    return this.stickyOffsets().get(column.key)?.left ?? false
  }

  /** `nzRight` for a column: a CSS length when pinned right, else false */
  stickyRight(column: CvcSpecColumn<TRow>): string | false {
    return this.stickyOffsets().get(column.key)?.right ?? false
  }

  /** the pinned column that carries the shadow separating it from the scroll */
  isLastLeft(column: CvcSpecColumn<TRow>): boolean {
    return this.stickyOffsets().get(column.key)?.lastLeft ?? false
  }

  isFirstRight(column: CvcSpecColumn<TRow>): boolean {
    return this.stickyOffsets().get(column.key)?.firstRight ?? false
  }

  /**
   * `tooltip || label`, matching what the preferences panel has always shown.
   * The shape is ng-zorro 22's `NzCheckboxOption` (`{ label, value }`) for
   * `nz-checkbox-group [nzOptions]`; checked values ride `ngModel`
   * separately under the v22 API split.
   */
  readonly columnPrefs = computed(() =>
    this.columns()
      .filter((column) => !column.omitFromPrefs)
      .map((column) => ({
        label: column.tooltip || column.label,
        value: column.key,
      }))
  )

  readonly checkedPrefs = computed(() =>
    this.columns()
      .filter((column) => !column.omitFromPrefs && !column.hidden)
      .map((column) => column.key)
  )

  // ------------------------------------------------------- filters and sort

  private readonly filterValues = signal<ReadonlyMap<string, unknown>>(
    new Map()
  )

  /**
   * The user's sort, or `undefined` for "they have not expressed one".
   *
   * Three states, not two. `undefined` means untouched, so a column's
   * configured `sort.default` applies; `{ key, order: null }` means the user
   * cycled a sorter back off, which is a different thing and must not spring
   * back to the default.
   */
  private readonly sortState = signal<Maybe<CvcSortState>>(undefined)

  /** the configured default sort, if a column declares one */
  private readonly defaultSort = computed<Maybe<CvcSortState>>(() => {
    const column = this.spec().columns.find((c) => c.sort?.default)
    if (!column?.sort?.default) return undefined
    return { key: column.key, order: column.sort.default }
  })

  /** what the table is actually sorted by right now */
  private readonly effectiveSort = computed<Maybe<CvcSortState>>(
    () => this.sortState() ?? this.defaultSort()
  )

  filterValue(key: string): unknown {
    return this.filterValues().get(key) ?? null
  }

  sortOrderFor(column: CvcSpecColumn<TRow>): NzTableSortOrder {
    const sort = this.effectiveSort()
    return sort?.key === column.key ? sort.order : null
  }

  // ------------------------------------------------------------ query state

  readonly queryVars = computed<Record<string, unknown>>(() => {
    const spec = this.spec()
    const vars: Record<string, unknown> = {
      ...spec.scope,
      first: spec.pageSize,
    }

    const sort = this.effectiveSort()
    if (sort?.order) {
      const column = spec.columns.find((c) => c.key === sort.key)
      if (column?.sort) {
        // SortDirection is generated from the schema, so the direction values
        // stay tied to the enum the server declares
        vars[spec.sortVar] = {
          column: column.sort.column,
          direction:
            sort.order === 'ascend' ? SortDirection.Asc : SortDirection.Desc,
        }
      }
    }

    for (const column of spec.columns) {
      if (!column.filter) continue
      const raw = this.filterValues().get(column.key)
      const value =
        column.filter.kind === 'text' && column.filter.transform
          ? column.filter.transform(raw as Maybe<string>)
          : raw
      // null and '' mean "cleared", and a cleared filter must be an *absent*
      // variable rather than an explicit null — a null still reaches the
      // resolver and filters for rows whose column is null
      vars[column.filter.var] =
        value === null || value === '' ? undefined : value
    }

    return vars
  })

  private queryRef?: QueryRef<unknown, Record<string, unknown>>
  private requestedCursor?: string

  private readonly result =
    signal<Maybe<{ data: unknown; loading: boolean }>>(undefined)
  private readonly fetchingMore = signal(false)
  readonly requestError = signal<Maybe<CvcTableRequestError>>(undefined)

  /** true until the first response, so the first paint is not a blank table */
  readonly loading = computed(() => this.result()?.loading ?? true)
  readonly isFetchingMore = computed(() => this.fetchingMore())

  readonly connection = computed(() =>
    this.spec().connection(this.result()?.data)
  )
  readonly rows = computed(() => connectionNodes(this.connection()))
  // no cast: CvcPageInfo is the generated PageInfo minus __typename, which is
  // what the scroll observer takes
  readonly pageInfo = computed<Maybe<CvcPageInfo>>(
    () => this.connection()?.pageInfo
  )
  readonly displayedTotal = computed(() => displayedCount(this.connection()))

  private readonly selectedSet = computed(() => new Set(this.selectedIds()))
  isSelected(row: TRow): boolean {
    return this.selectedSet().has(row.id)
  }

  // ------------------------------------------------------------- scrolling

  private readonly scrollPhase = signal<CvcScrollEvent>('stop')
  /** cells suspend popovers while a gesture is in flight */
  readonly isScrolling = computed(() => this.scrollPhase() !== 'stop')
  readonly noMoreRows = computed(
    () =>
      this.scrollPhase() === 'bottom' && this.pageInfo()?.hasNextPage === false
  )
  readonly scrollToIndex = signal<Maybe<number>>(undefined)

  constructor() {
    // one debounced driver for the whole query: a reset that touches every
    // column collapses into a single request
    const debouncedVars = toSignal(
      toObservable(this.queryVars).pipe(
        debounceTime(QUERY_DEBOUNCE_MS),
        // `queryVars` is a computed that builds a fresh object every time, so
        // any signal it reads re-emits it even when the variables are
        // identical. A host pushing `settings` does exactly that on mount —
        // writing nulls into the filter map changes the map without changing
        // the query — and the table answered with a second, identical request.
        // Variables are JSON by definition, so stringify is a sound identity.
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
    )

    effect(() => {
      const vars = debouncedVars()
      if (!vars) return
      untracked(() => this.runQuery(vars))
    })

    effect(() => {
      const settings = this.settings()
      if (settings) untracked(() => this.applySettings(settings))
    })

    // project denormalised rows back into the cache before the tags that read
    // from it paint
    effect(() => {
      const rows = this.rows()
      if (rows.length) untracked(() => this.seedRows(rows))
    })
  }

  // --------------------------------------------------------- query pipeline

  private runQuery(vars: Record<string, unknown>): void {
    this.requestError.set(undefined)
    this.fetchingMore.set(false)

    if (!this.queryRef) {
      // `{ variables }`, not positional — see CvcTableQuery. The three
      // apollo-angular entry points this class uses disagree (`watch` and
      // `fetchMore` take options objects, `refetch` takes variables), and a
      // positional call here would run yet silently send no variables. Two
      // guards hold it: CvcTableQuery types `watch` as options-only, and the
      // "puts those variables on the wire" spec fails if variables ever stop
      // reaching the link.
      this.queryRef = this.spec().query.watch({ variables: vars }) as QueryRef<
        unknown,
        Record<string, unknown>
      >
      this.queryRef.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (value) => {
            this.result.set(value)
            if (value.error) this.requestError.set(splitError(value.error))
          },
          error: (error: ErrorLike) => this.requestError.set(splitError(error)),
        })
      return
    }

    // a new variable set invalidates any cursor already asked for
    this.requestedCursor = undefined
    this.queryRef
      .refetch(vars)
      .then((value) => {
        if (value.error) this.requestError.set(splitError(value.error))
        this.scrollToIndex.set(0)
      })
      .catch((error: ErrorLike) => this.requestError.set(splitError(error)))
  }

  /**
   * Handles a scroll-observer page request. The in-flight cursor guard lives
   * here rather than in the directive because a refetch (`runQuery`) is what
   * makes a cursor stale, and only this class sees one happen.
   */
  onFetchRequest(fetch: CvcScrollFetch): void {
    if (!this.queryRef || fetch.after === this.requestedCursor) return
    this.requestedCursor = fetch.after
    this.fetchingMore.set(true)
    this.queryRef
      .fetchMore({ variables: { ...this.queryVars(), ...fetch } })
      .then((value) => {
        if (value.error) this.requestError.set(splitError(value.error))
      })
      .catch((error: ErrorLike) => this.requestError.set(splitError(error)))
      .finally(() => this.fetchingMore.set(false))
  }

  onScrollPhase(phase: CvcScrollEvent): void {
    this.scrollPhase.set(phase)
  }

  /**
   * Writes each entity-tag column's entities into the cache, for the columns
   * that declare how.
   *
   * A `Browse*` row flattens its entities into scalar columns, so it normalises
   * under its own typename and the tags — which render from the cache alone —
   * find nothing and fall back to `#<id>`. The projection lives on the column
   * because it describes the same entity the column's `ref` addresses; the
   * table only walks and writes.
   *
   * `writeCachedEntity` leaves an already-cached entity alone, so a real
   * query's copy always wins over a browse row's projection of it.
   */
  private seedRows(rows: ReadonlyArray<TRow>): void {
    const seeds = this.spec()
      .columns.map((column) => column.cell)
      .filter((cell) => cell.kind === 'entity-tag' && !!cell.seed)
      .map((cell) => (cell as CvcEntityTagCell<TRow>).seed!)
    if (seeds.length === 0) return

    for (const row of rows) {
      for (const seed of seeds) {
        const entities = seed(row)
        if (!entities) continue
        for (const entity of Array.isArray(entities) ? entities : [entities]) {
          writeCachedEntity(this.apollo, entity.__typename, entity)
        }
      }
    }
  }

  /** the `cvcCell` override for a column, if the host supplied one */
  templateFor(key: string): Maybe<TemplateRef<CvcCellContext<TRow>>> {
    return this.cellTemplates().find((cell) => cell.cvcCell() === key)?.template
  }

  /**
   * A text cell's value, split into segments so the active filter's match can
   * be emphasised. Empty when there is nothing to show, which is the signal to
   * render `cvc-empty-value` instead.
   *
   * `labelSegments` is the same helper `cvc-tag` highlights with: plain
   * case-insensitive string matching — deliberately not a `RegExp` built from
   * raw filter input (an unbalanced bracket would throw), and never through
   * `bypassSecurityTrustHtml` (server-supplied names must not render as
   * markup).
   */
  textSegments(column: CvcSpecColumn<TRow>, row: TRow): LabelSegment[] {
    const cell = column.cell
    if (cell.kind !== 'text') return []

    const value = cell.text(row)
    // codegen types a nullable field `T | undefined`, but the server sends
    // literal null, so both reach an accessor that just forwards a row field
    if (value === null || value === undefined) return []
    // a list joins into one string, so a match spanning the separator still
    // highlights; 0 is a value, not an absence
    const text = Array.isArray(value) ? value.join(', ') : String(value)
    if (text === '') return []

    if (!cell.highlight) return [{ text, highlight: false }]
    const filter = this.filterValues().get(column.key)
    return labelSegments(text, typeof filter === 'string' ? filter : undefined)
  }

  /**
   * Virtual scroll needs a stable identity per row: tracking by index
   * recycles a row's DOM into a different record when a refetch reorders the
   * list — visible as a tag briefly showing the wrong entity.
   */
  readonly trackById = (_index: number, row: TRow): number => row.id

  // ------------------------------------------------------------ user input

  onFilterChange(column: CvcSpecColumn<TRow>, value: unknown): void {
    this.filterValues.update((current) => {
      const next = new Map(current)
      next.set(column.key, value)
      return next
    })
  }

  /**
   * Records a sorter click, including one that turns a sorter off — hence
   * always a state, never `undefined`. Clearing a sort and never having sorted
   * are different, and only `onResetFilters` produces the latter.
   */
  onSortChange(column: CvcSpecColumn<TRow>, order: NzTableSortOrder): void {
    this.sortState.set({ key: column.key, order })
  }

  /**
   * Clears every filter and returns sort to its configured default.
   *
   * One assignment, because a filter's value has one home — which is what
   * keeps the query and the filter inputs in agreement. Column visibility is
   * deliberately untouched, and sort returns to `undefined`: the configured
   * default, not "no sort at all".
   */
  onResetFilters(): void {
    this.filterValues.set(new Map())
    this.sortState.set(undefined)
  }

  onRowSelectedChange(row: TRow, selected: boolean): void {
    const ids = new Set(this.selectedIds())
    if (selected) ids.add(row.id)
    else ids.delete(row.id)
    this.selectedIds.set([...ids])
  }

  onPrefsChange(visibleKeys: string[]): void {
    const shown = new Set(visibleKeys)
    this.hiddenOverrides.set(
      new Map(
        this.columns()
          .filter((column) => !column.omitFromPrefs)
          .map((column) => [column.key, !shown.has(column.key)])
      )
    )
  }

  /**
   * Applies filters and visibility pushed in by a host.
   *
   * A filter arrives as an entity **id**, but these columns filter by **name**,
   * so the name comes out of the Apollo cache. That read is synchronous and
   * cache-only: an entity that was never cached yields nothing and the filter is
   * skipped rather than guessed at.
   */
  private applySettings(settings: CvcTableSettings): void {
    if (settings.filters) {
      const columns = this.spec().columns
      this.filterValues.update((current) => {
        const next = new Map(current)
        for (const change of settings.filters ?? []) {
          const column = columns.find((c) => c.key === change.key)
          if (!column?.filter) continue

          const value = Array.isArray(change.value)
            ? change.value[0]
            : change.value
          if (value === null || value === undefined) {
            next.set(column.key, null)
            continue
          }

          const typename =
            column.filter.kind === 'text'
              ? column.filter.entityTypename
              : undefined
          if (!typename) {
            next.set(column.key, value)
            continue
          }

          const name = readCachedEntityName(
            this.apollo,
            typename,
            Number(value)
          )
          if (name) next.set(column.key, name)
        }
        return next
      })
    }

    if (settings.preferences) {
      this.hiddenOverrides.update((current) => {
        const next = new Map(current)
        for (const pref of settings.preferences ?? []) {
          next.set(pref.key, !pref.visible)
        }
        return next
      })
    }
  }
}

/**
 * Splits Apollo 4's single `ErrorLike` into the GraphQL errors and the transport
 * error, so the toolbar can label them differently.
 */
function splitError(error: ErrorLike): CvcTableRequestError {
  return {
    query: CombinedGraphQLErrors.is(error) ? error.errors : undefined,
    network: CombinedGraphQLErrors.is(error) ? undefined : error,
  }
}

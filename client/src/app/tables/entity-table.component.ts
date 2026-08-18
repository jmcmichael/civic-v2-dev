import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
} from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Maybe, SortDirection } from '@app/generated/civic.apollo.types'
import { CvcAttributeTagModule } from '@app/forms/components/attribute-tag/attribute-tag.module'
import { CvcEmptyValueModule } from '@app/forms/components/empty-value/empty-value.module'
import { CvcLinkTagModule } from '@app/components/shared/link-tag/link-tag.module'
import {
  CvcCollectionTagComponent,
  CvcTagComponent,
  CvcTagListComponent,
  EntityTagRef,
  LabelSegment,
  labelSegments,
  readCachedEntityName,
  writeCachedEntity,
} from '@app/tags'
import { CvcInputEnum } from '@app/forms/forms.types'
import { PolymorpheusOutlet } from '@taiga-ui/polymorpheus'
import { Apollo } from 'apollo-angular'
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
import { CvcPipesModule } from '@app/core/pipes/pipes.module'
import { debouncedSignal } from '@app/core/utilities/debounced-signal'
import { NzTagModule } from 'ng-zorro-antd/tag'
import {
  CvcPageInfo,
  connectionNodes,
  displayedCount,
} from './connection.types'
import { CvcSpecColumn, EntityTableSpec } from './entity-table-config'
import { CvcEntityTableQuery } from './entity-table-query'
import {
  CvcCellContext,
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

/**
 * One configurable, virtual-scrolled entity table, driven entirely by an
 * `EntityTableSpec` (see `entityTableConfig`).
 *
 * The component owns columns, filters, sort, selection and scroll state, and
 * turns them into one debounced variables signal. Everything downstream of
 * those variables — the QueryRef, the response and its errors — belongs to
 * `CvcEntityTableQuery`; pinned-column positions are ng-zorro's own
 * boolean-`nzLeft`/`nzRight` measurement.
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
    CvcLinkTagModule,
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
    PolymorpheusOutlet,
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
   * Replaces the card title's plain `spec().title` text — for hosts whose
   * legacy card titles carry markup (an icon, a link). The toolbar's
   * counterpart is the `[cvcTableToolbarExtra]` content slot, which projects
   * host content (downloaders, scope menus) into the card-extra row.
   */
  readonly titleTemplate = input<Maybe<TemplateRef<void>>>()

  /** what an empty cell renders as unless its column overrides it */
  protected readonly defaultEmptyValue = DEFAULT_EMPTY_VALUE

  /**
   * ng-zorro's own click-cycle order, restated so a column without
   * `sort.directions` binds a stable array (`th[nzSortDirections]` treats
   * `undefined` as "no directions", not "use the default").
   */
  protected readonly defaultSortDirections: NzTableSortOrder[] = [
    'ascend',
    'descend',
    null,
  ]

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

  // Pinned-column offsets are ng-zorro's own: the template passes boolean
  // `nzLeft`/`nzRight` and the table's measure row supplies the widths. This
  // only works because the template does NOT wrap its `nz-virtual-scroll`
  // template in a `<tbody>` — see the template comment at the body band.

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

  /** the active text filter for a column, for tag `emphasize` bindings */
  protected textFilterValue(key: string): string | undefined {
    const value = this.filterValues().get(key)
    return typeof value === 'string' ? value : undefined
  }

  /** a text/numeric filter's current value, in the filter input's own type */
  protected filterBoxValue(key: string): string | number | null {
    const value = this.filterValues().get(key)
    return typeof value === 'string' || typeof value === 'number' ? value : null
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

  /**
   * The QueryRef and everything derived from a response. Constructed here, and
   * not injected, because it needs the spec — a component input — and because a
   * landed refetch has to move this component's scroll position.
   */
  private readonly query = new CvcEntityTableQuery({
    query: () => this.spec().query,
    destroyRef: this.destroyRef,
    onRefetch: () => this.scrollRequest.set({ index: 0 }),
  })

  readonly loading = this.query.loading
  readonly isFetchingMore = this.query.isFetchingMore
  readonly requestError = this.query.requestError

  readonly connection = computed(() =>
    this.spec().connection(this.query.data())
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
  /**
   * A scroll *request*, not a position. Each landed refetch must return the
   * viewport to the top, and consecutive refetches request the same index —
   * a `signal<number>` would swallow the second `set(0)` on equality and
   * leave the viewport wherever the user had scrolled. A fresh object per
   * request keeps every one observable.
   */
  readonly scrollRequest = signal<Maybe<{ index: number }>>(undefined)

  constructor() {
    // One debounced driver for the whole query: a reset that touches every
    // column collapses into a single request. The JSON identity matters:
    // `queryVars` is a computed that builds a fresh object every time, so
    // any signal it reads re-emits it even when the variables are identical.
    // A host pushing `settings` does exactly that on mount — writing nulls
    // into the filter map changes the map without changing the query — and
    // the table answered with a second, identical request. Variables are
    // JSON by definition, so stringify is a sound identity.
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

  /**
   * Handles a scroll-observer page request. The directive reports that the
   * viewport wants another page; the store decides whether that cursor is
   * still worth asking for, and extends the variables it last ran with — not
   * this component's live `queryVars`, which can already be ahead of the
   * result set inside the debounce window.
   */
  onFetchRequest(fetch: CvcScrollFetch): void {
    this.query.fetchMore(fetch)
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
    const seeds = this.spec().columns.flatMap((column) =>
      column.cell.kind === 'entity-tag' && column.cell.seed
        ? [column.cell.seed]
        : []
    )
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

  /**
   * Context for a custom cell's polymorpheus content. A fresh object per
   * read — custom cells are rare, and the content treats it as data.
   */
  protected cellContext(
    column: CvcSpecColumn<TRow>,
    row: TRow
  ): CvcCellContext<TRow> {
    return { $implicit: row, row, column, isScrolling: this.isScrolling() }
  }

  /**
   * An entity-tag cell's refs, shaped for the template: exactly one of
   * `list`/`single` is set (or neither, for the empty state). Splitting here
   * keeps the template fully typed — a pipe cannot narrow a union in a
   * binding, which is what the `$any`s this replaces papered over.
   */
  protected entityTagRefs(
    cell: CvcEntityTagCell<TRow>,
    row: TRow
  ): { list: ReadonlyArray<EntityTagRef> | null; single: EntityTagRef | null } {
    const refs = cell.ref(row)
    if (Array.isArray(refs)) return { list: refs, single: null }
    // Array.isArray's false branch does not exclude ReadonlyArray (its guard
    // is `any[]`), so the compiler still sees the array arm here — it cannot
    // occur at runtime
    return { list: null, single: (refs as Maybe<EntityTagRef>) ?? null }
  }

  /**
   * The one deliberate erasure at the render boundary: the column model
   * cannot know which generated enum a column renders (`value` is
   * `string | number`), and `cvc-attribute-tag` resolves values by runtime
   * lookup — numbers included (evidence ratings). This method is the single
   * point where that erasure meets the tag's declared input type.
   */
  protected asAttrValue(value: string | number): Maybe<CvcInputEnum> {
    return value as unknown as Maybe<CvcInputEnum>
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
   * The full text a `tooltip: true` text cell discloses on hover — the same
   * normalisation as `textSegments`, because truncation hides exactly what
   * the segments render. `null` (no tooltip) unless the cell opts in, and
   * while the viewport scrolls — the same suspend rule every built-in
   * kind's popover/tooltip follows.
   */
  textTooltip(column: CvcSpecColumn<TRow>, row: TRow): string | null {
    const cell = column.cell
    if (cell.kind !== 'text' || !cell.tooltip || this.isScrolling()) {
      return null
    }
    const value = cell.text(row)
    if (value === null || value === undefined) return null
    const text = Array.isArray(value) ? value.join(', ') : String(value)
    return text === '' ? null : text
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

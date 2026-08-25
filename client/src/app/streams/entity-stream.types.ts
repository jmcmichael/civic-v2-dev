import { Type } from '@angular/core'
import { Maybe } from '@app/generated/civic.apollo.types'
import { PolymorpheusContent } from '@taiga-ui/polymorpheus'

/**
 * Counts a stream's header displays, as its config's `counts` accessor
 * derives them from the connection.
 *
 * An accessor rather than field names because connections disagree about
 * what their count fields mean: which field carries the filtered count and
 * which the unfiltered one is the connection's own convention, and the
 * config is where that knowledge belongs.
 */
export interface CvcStreamCounts {
  /** how many items the current filters match */
  total?: number
  /** how many items exist regardless of filters */
  unfiltered?: number
  /** how many pages the filtered set spans */
  page?: number
  /** how many items are currently loaded */
  rows?: number
}

/**
 * The context every item renderer receives — summary, detail and footer
 * content alike, via polymorpheus injection (`injectContext`).
 *
 * One context object exists per rendered item view and stays referentially
 * stable for that view's lifetime; `item`, `isScrolling`, `expanded` and
 * `selected` are live reads, so content holding the object across change
 * detection always sees current values. Reading them inside a template
 * registers reactivity for the reading view.
 */
export interface CvcStreamItemContext<TItem> {
  /** the item, for implicit template binding */
  readonly $implicit: TItem
  /** the item, by name */
  readonly item: TItem
  /**
   * True while the stream's viewport is being scrolled. Content with
   * hover-triggered overlays (popovers, tooltips) should suspend them while
   * this is true.
   */
  readonly isScrolling: boolean
  /** true while this item's detail region is shown */
  readonly expanded: boolean
  /** true while this item is in the stream's selection */
  readonly selected: boolean
  /** shows or hides this item's detail region */
  toggle(): void
  /** adds or removes this item from the stream's selection */
  setSelected(selected: boolean): void
}

/**
 * How one item kind renders, keyed by the config's `kind` discriminator.
 * Members are all optional: a kind entry exists to override the defaults for
 * items of that kind, and states only what differs.
 */
export interface CvcStreamItemKindSpec<TItem> {
  /** replaces the item spec's default `summary` for this kind */
  summary?: PolymorpheusContent<CvcStreamItemContext<TItem>>
  /**
   * Whether items of this kind offer an expandable detail region. A
   * predicate receives the item, for kinds where expandability depends on
   * the item's own data. Defaults to false.
   */
  expandable?: boolean | ((item: TItem) => boolean)
  /**
   * The detail region's component, loaded on first expansion. `load` returns
   * a dynamic `import()` so each kind's detail component (and everything
   * only it imports) stays in its own lazy chunk; the stream shows a
   * skeleton while the import and the component's own data load resolve.
   *
   * The component receives the item context via polymorpheus injection and
   * owns its detail data: whatever query the expanded view needs belongs to
   * the component, not to the stream's connection document.
   */
  detail?: { load: () => Promise<Type<unknown>> }
}

/**
 * A stream config's item model: how to identify, discriminate and render the
 * items of a connection.
 */
export interface CvcStreamItemSpec<TItem> {
  /**
   * The item's identity, used to track views, key expansion and selection
   * state, and address items in the `data-item-id` test hook. Must be unique
   * within the stream and stable across refetches.
   */
  id(item: TItem): number
  /**
   * The discriminator that selects an entry in `kinds` — an activity's
   * `__typename`, a revision's `fieldName`, whatever partitions the stream's
   * items into their renderings. Also exposed as the `data-item-kind` test
   * hook.
   */
  kind(item: TItem): string
  /** the summary renderer for kinds without a `summary` override */
  summary: PolymorpheusContent<CvcStreamItemContext<TItem>>
  /**
   * Content rendered in the item header's trailing position — a timestamp,
   * a status tag. Omitted, the header holds only the summary.
   */
  extra?: PolymorpheusContent<CvcStreamItemContext<TItem>>
  /** per-kind overrides; a kind absent here renders the default summary, unexpandable */
  kinds?: Record<string, CvcStreamItemKindSpec<TItem>>
  /**
   * Which items offer a selection checkbox. Omitted, the stream renders no
   * selection UI at all; present, each item's checkbox appears when the
   * predicate allows and the stream reports the selected id set through its
   * `selectedIds` model.
   */
  selectable?: (item: TItem) => boolean
  /** the tooltip an item's selection checkbox shows, enabled or not */
  selectTooltip?: (item: TItem) => Maybe<string>
  /** content rendered below the summary/detail, e.g. a resolution note */
  footer?: PolymorpheusContent<CvcStreamItemContext<TItem>>
}

/** The context an `emptyState` renderer receives. */
export interface CvcStreamEmptyContext {
  /** the spec's scope variables, for copy that names what the stream is scoped to */
  readonly scope: Record<string, unknown>
}

/**
 * How a stream presents its pages.
 *
 * - `'infinite'`: a virtual scroller renders a window of items and fetches
 *   pages as scrolling demands them.
 * - `'button'`: all loaded items render in a plain list and a Load More
 *   button fetches the next page. Suits streams whose items host stateful
 *   interactive content (open popovers, form inputs) that must not be
 *   recycled out from under the user.
 */
export type CvcStreamPagination = 'infinite' | 'button'

/**
 * Virtual scroller tuning, config-overridable per stream. Only meaningful
 * for `pagination: 'infinite'`.
 */
export interface CvcStreamScrollerSettings {
  /** the minimum number of items a scroll-driven fetch requests */
  bufferSize: number
  /** the item height estimate (px) the scroller positions with */
  itemSize: number
  /**
   * How the scroller treats item heights: `'constant'` applies `itemSize`
   * to every item, `'average'` refines the estimate from measured items,
   * `'frequent'` uses the most frequently measured height.
   */
  sizeStrategy: 'average' | 'frequent' | 'constant'
  /** viewport-height multiples rendered beyond the visible area */
  padding: number
}

import { CvcEdge } from '@app/tables/connection.types'
import { Datasource, IDatasource, Routines } from 'ngx-ui-scroll'
import { SizeStrategy } from 'vscroll'
import { CvcStreamScrollerSettings } from '../entity-stream.types'
import { CvcStreamScrollState } from './stream-scroll-state'

/**
 * The stream's virtual scroll engine, behind a seam: this module is the ONLY
 * one that imports from `ngx-ui-scroll`/`vscroll`. The component binds
 * `datasource` and `routines` in its template and calls `reload`/`check`;
 * nothing else about the engine's library reaches the rest of the streams
 * code, so a different engine is a new factory behind the same interface.
 */

/** the engine's library-agnostic surface */
export interface CvcStreamScrollEngine<TItem> {
  /** what the template's structural scroll directive iterates */
  readonly datasource: IDatasource<CvcEdge<TItem>>
  /** the scroll-event routines class the directive is configured with */
  readonly routines: typeof Routines
  /**
   * Discards the rendered window and re-renders from the top — the call
   * that follows a refetch, whose new result set replaces the old one's
   * indexes wholesale.
   */
  reload(): void
  /**
   * Re-measures rendered items against the data — the call that follows any
   * in-place item height change: a detail region expanding or collapsing, or
   * lazily-loaded detail content replacing its placeholder.
   */
  check(): void
}

export interface CvcVscrollEngineOptions<TItem> {
  /** the query store's range resolver; see `CvcEntityStreamQuery.getRange` */
  getRange: (
    index: number,
    count: number
  ) => Promise<ReadonlyArray<CvcEdge<TItem>>>
  /** the spec's scroller tuning, defaults already applied */
  settings: CvcStreamScrollerSettings
  /** the stream's scroll state, fed by the engine's event routines */
  state: CvcStreamScrollState
}

const SIZE_STRATEGY: Record<
  CvcStreamScrollerSettings['sizeStrategy'],
  SizeStrategy
> = {
  average: SizeStrategy.Average,
  frequent: SizeStrategy.Frequent,
  constant: SizeStrategy.Constant,
}

/** Builds the ngx-ui-scroll implementation of the engine surface. */
export function createVscrollEngine<TItem>(
  options: CvcVscrollEngineOptions<TItem>
): CvcStreamScrollEngine<TItem> {
  const { getRange, settings, state } = options

  const datasource = new Datasource<CvcEdge<TItem>>({
    // a fresh mutable array per page: the engine takes ownership of what it
    // is handed, and the store's edges are shared state
    get: (index: number, count: number) =>
      getRange(index, count).then((edges) => [...edges]),
    settings: {
      bufferSize: settings.bufferSize,
      minIndex: 0,
      startIndex: 0,
      itemSize: settings.itemSize,
      sizeStrategy: SIZE_STRATEGY[settings.sizeStrategy],
      padding: settings.padding,
    },
    devSettings: {
      // keep fetched items cached across window moves, so scrolling back
      // over a previously rendered range re-renders without re-fetching
      cacheData: true,
    },
  })

  /**
   * Routines subclass that feeds the scroll state from the viewport's own
   * scroll events, alongside the engine's normal handling. Reports once on
   * attachment so position state is defined before the first scroll.
   */
  const routines = class extends Routines {
    override onScroll(handler: EventListener): () => void {
      this.viewport.addEventListener('scroll', () => {
        state.reportScroll(
          super.getScrollPosition(),
          super.getScrollerSize(),
          super.getViewportSize()
        )
      })
      state.reportGeometry(
        super.getScrollPosition(),
        super.getScrollerSize(),
        super.getViewportSize()
      )
      return super.onScroll(handler)
    }
  }

  return {
    datasource,
    routines,
    reload: () => {
      if (!datasource.adapter.init) return
      void datasource.adapter.reload()
    },
    check: () => {
      if (!datasource.adapter.init) return
      void datasource.adapter.check()
    },
  }
}

/**
 * The configurable entity stream.
 *
 * A host builds an `EntityStreamSpec` with `entityStreamConfig()` — which
 * type-checks the item spec and scope against the query's generated types —
 * and renders `<cvc-entity-stream [spec]="...">`, projecting sidebar,
 * header-extra and banner content as needed. See
 * `components/activities/activity-stream` for a complete facade example.
 *
 * Consumer surface: `CvcEntityStreamComponent`, `entityStreamConfig`, the
 * `CvcStreamSidebarDirective` marker, and the item/context types renderers
 * are written against. The query store, scroll engine and item shell are
 * internals of the component, exported for tests.
 *
 * Developer docs live in ./docs: 01-architecture.md, 02-authoring-guide.md,
 * 03-troubleshooting.md.
 */
export { CvcEntityStreamComponent } from './entity-stream.component'
export {
  DEFAULT_STREAM_PAGE_SIZE,
  DEFAULT_STREAM_SCROLLER_SETTINGS,
  entityStreamConfig,
} from './entity-stream-config'
export type {
  CvcStreamQueryService,
  EntityStreamConfig,
  EntityStreamSpec,
} from './entity-stream-config'
export type {
  CvcStreamCounts,
  CvcStreamEmptyContext,
  CvcStreamItemContext,
  CvcStreamItemKindSpec,
  CvcStreamItemSpec,
  CvcStreamPagination,
  CvcStreamScrollerSettings,
} from './entity-stream.types'
export { CvcStreamSidebarDirective } from './stream-slots'
export { CvcEntityStreamQuery } from './entity-stream-query'
export type {
  CvcStreamPageRequest,
  CvcStreamRequestError,
} from './entity-stream-query'
export { CvcStreamItemComponent } from './stream-item.component'
export { CvcStreamState } from './stream-state'
export { CvcStreamScrollState } from './scroll/stream-scroll-state'
export { createVscrollEngine } from './scroll/vscroll-engine'
export type { CvcStreamScrollEngine } from './scroll/vscroll-engine'

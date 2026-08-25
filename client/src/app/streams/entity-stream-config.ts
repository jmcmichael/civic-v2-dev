import { isDevMode } from '@angular/core'
import { OperationVariables } from '@apollo/client'
import { AnyQuery, QueryData, QueryVars } from '@app/core/utilities/query-types'
import { Maybe } from '@app/generated/civic.apollo.types'
import { PolymorpheusContent } from '@taiga-ui/polymorpheus'
import { QueryRef } from 'apollo-angular'
import { CvcConnection } from '@app/tables/connection.types'
import {
  CvcStreamCounts,
  CvcStreamEmptyContext,
  CvcStreamItemSpec,
  CvcStreamPagination,
  CvcStreamScrollerSettings,
} from './entity-stream.types'

/**
 * Structural subset of a generated apollo-angular query service, as the
 * stream uses it: one long-lived QueryRef from `watch`, so `fetchMore` can
 * append pages into the same cache entry.
 *
 * `watch` takes an **options object**, not variables — the three sibling
 * entry points disagree (`refetch(vars)` is positional, `fetchMore({
 * variables })` and `watch({ variables })` are not), and this declaration is
 * what keeps a positional `watch(vars)` call from compiling while silently
 * sending no variables.
 */
export interface CvcStreamQueryService<
  TData,
  TVars extends OperationVariables,
> {
  watch(options?: {
    variables?: TVars
    /** see CvcEntityStreamQuery.run — refetches must not re-emit loading */
    notifyOnNetworkStatusChange?: boolean
  }): QueryRef<TData, TVars>
}

/**
 * A stream config's members, parameterised by the query types they depend
 * on. `EntityStreamConfig` binds these to a generated query service and
 * `EntityStreamSpec` erases them again; declaring each member once here is
 * what stops an addition to the config from being forgotten in the shape the
 * component actually reads.
 *
 * @template TData the query's result type
 * @template TVars the query's variables type
 * @template TItem the item type
 */
interface EntityStreamShape<TData, TVars, TItem> {
  /** shown in the card header; omit for an untitled stream */
  title?: string
  /**
   * Picks the connection out of the query result.
   *
   * A method rather than a function-typed property, which is what lets
   * `entityStreamConfig` erase `TData` by assignment: method parameters are
   * compared bivariantly, so a config's concrete result type still satisfies
   * the spec's `unknown`. The return type — the half that carries `TItem` —
   * is checked either way.
   */
  connection(data: Maybe<TData>): Maybe<CvcConnection<TItem>>
  /** how items are identified, discriminated and rendered */
  item: CvcStreamItemSpec<TItem>
  /**
   * Items per page, sent as `first` on the initial query as well as
   * subsequent ones — one value, so page one cannot silently take a server
   * default while later pages take another.
   */
  pageSize?: number
  /**
   * Variables that are always sent and are not user-editable — a subject
   * stream's `subject`, an embedded stream's fixed mode. User filters are
   * merged over these, so a filter cannot silently widen the stream's scope.
   */
  scope?: Partial<TVars>
  /** derives header counts from the connection; omit for no counts display */
  counts?: (connection: CvcConnection<TItem>) => CvcStreamCounts
  /** rendered in place of the list when the current variables match nothing */
  emptyState?: PolymorpheusContent<CvcStreamEmptyContext>
  /** how pages are presented; see {@link CvcStreamPagination} */
  pagination?: CvcStreamPagination
  /** virtual scroller tuning overrides, for `pagination: 'infinite'` */
  scroller?: Partial<CvcStreamScrollerSettings>
}

/**
 * Everything a stream needs beyond its template.
 *
 * Follows `entityTableConfig` (tables/entity-table-config.ts): infer every
 * query type from the arguments, type-check the literal, then erase the type
 * parameters so the component carries only its item type and no host ever
 * spells out a type argument.
 *
 * @template TQuery the generated apollo-angular query service class
 * @template TItem the item type, inferred from `connection`'s return
 */
export interface EntityStreamConfig<
  TQuery extends AnyQuery,
  TItem,
> extends EntityStreamShape<QueryData<TQuery>, QueryVars<TQuery>, TItem> {
  /** the generated *GQL service; TData and TVars are inferred from it */
  query: TQuery
}

/**
 * The config's shape once `entityStreamConfig` has erased its query types.
 *
 * `TVars` erases to `any`, not to a record type: `scope`'s `Partial<TVars>`
 * would otherwise reject every config bound to a real query. It reaches no
 * value — the erased spec redeclares `scope` as a record.
 */
type ErasedStreamShape<TItem> = EntityStreamShape<unknown, any, TItem>

/**
 * An EntityStreamConfig with its query type parameters erased and the
 * factory's defaults filled in — what `CvcEntityStreamComponent` reads.
 *
 * Inherits its members from `EntityStreamShape` rather than re-declaring
 * them, so a member added to the config cannot go missing here; the members
 * it redeclares are exactly the ones the factory supplies a default for.
 *
 * Only `entityStreamConfig` should produce one: the factory type-checks the
 * literal before erasing, so a hand-built spec bypasses every check the
 * config surface exists to make.
 */
export interface EntityStreamSpec<TItem> extends ErasedStreamShape<TItem> {
  query: CvcStreamQueryService<unknown, Record<string, unknown>>
  pageSize: number
  scope: Record<string, unknown>
  pagination: CvcStreamPagination
  scroller: CvcStreamScrollerSettings
}

/** items per page unless a config says otherwise */
export const DEFAULT_STREAM_PAGE_SIZE = 50

/** scroller tuning unless a config overrides members of it */
export const DEFAULT_STREAM_SCROLLER_SETTINGS: CvcStreamScrollerSettings = {
  bufferSize: 20,
  itemSize: 42,
  sizeStrategy: 'constant',
  padding: 0.8,
}

/**
 * Type-checks a stream config literal against its query, then erases the
 * query types. Inference does the work: `TItem` comes from `connection`'s
 * return, and every `scope` key is checked against that query's real
 * variables.
 *
 * @param config the stream's config literal; see `EntityStreamConfig`
 * @returns the same config with defaults applied and query types erased
 * @throws in dev mode when a kind is expandable but declares no detail
 *   component (see `assertExpandableDetail`)
 */
export function entityStreamConfig<TQuery extends AnyQuery, TItem>(
  config: EntityStreamConfig<TQuery, TItem>
): EntityStreamSpec<TItem> {
  assertExpandableDetail(config.item)
  return {
    ...config,
    // The two members no assignment can express. `query`: apollo-angular's
    // QueryRef is invariant in both of its parameters, so a generated
    // service is not assignable to the erased query surface however it is
    // spelled. `scope`: a generic variables type has no implicit index
    // signature, so Partial<TVars> does not reach Record<string, unknown>.
    // Everything else — the item spec, `connection`'s item type, the
    // remaining defaults — is still checked.
    query: config.query as unknown as CvcStreamQueryService<
      unknown,
      Record<string, unknown>
    >,
    pageSize: config.pageSize ?? DEFAULT_STREAM_PAGE_SIZE,
    scope: (config.scope ?? {}) as Record<string, unknown>,
    pagination: config.pagination ?? 'infinite',
    scroller: { ...DEFAULT_STREAM_SCROLLER_SETTINGS, ...config.scroller },
  }
}

/**
 * An expandable kind renders nothing in its detail region but the component
 * its `detail.load` resolves, so an expandable kind without one is a detail
 * region that expands to empty space — a config authoring mistake, refused
 * loudly rather than rendered blankly.
 *
 * Dev-mode only: this is an authoring-time condition, and the check costs
 * nothing to skip in production.
 */
function assertExpandableDetail(item: {
  kinds?: Record<
    string,
    { expandable?: boolean | ((item: never) => boolean); detail?: unknown }
  >
}): void {
  if (!isDevMode()) return
  const missing = Object.entries(item.kinds ?? {})
    .filter(([, kind]) => kind.expandable && !kind.detail)
    .map(([key]) => key)
  if (missing.length > 0) {
    throw new Error(
      `entityStreamConfig: expandable kind(s) ${missing.join(', ')} declare ` +
        'no detail component. An expandable item renders only the component ' +
        'its detail.load resolves.'
    )
  }
}

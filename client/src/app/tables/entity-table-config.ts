// Deep import: the forms/select barrel does not re-export QueryData/QueryVars,
// and duplicating them here would let the two copies drift.
import {
  AnyQuery,
  QueryData,
  QueryVars,
} from '@app/forms/select/entity-select-config'
import { isDevMode } from '@angular/core'
import { OperationVariables } from '@apollo/client'
import { Maybe } from '@app/generated/civic.apollo.types'
import { QueryRef } from 'apollo-angular'
import { CvcConnection } from './connection.types'
import { CvcColumn } from './entity-table.types'

/**
 * Structural subset of a generated apollo-angular query service, as the table
 * uses it. Mirrors `CvcSelectQuery`, but over `watch` rather than `fetch`: the
 * table holds one long-lived QueryRef so `fetchMore` can append pages into the
 * same cache entry.
 *
 * `watch` takes an **options object**, not variables. The three sibling APIs
 * disagree and it is worth stating once: `refetch(vars)` is positional,
 * `fetchMore({ variables })` and `watch({ variables })` are not. Declaring
 * this as `watch(variables?: TVars)` compiles perfectly and silently sends no
 * variables at all, because every key of a variables object is simply an
 * unrecognised option.
 */
export interface CvcTableQuery<TData, TVars extends OperationVariables> {
  watch(options?: { variables?: TVars }): QueryRef<TData, TVars>
}

/**
 * Everything a table needs beyond its template.
 *
 * Follows `entitySelectConfig` (forms/select/entity-select-config.ts): infer
 * every query type from the arguments, type-check the literal, then erase the
 * type parameters so the component carries only its row type and no host ever
 * spells out a type argument.
 *
 * @template TQuery the generated apollo-angular query service class
 * @template TNode the row type, inferred from `connection`'s return
 * @template TSortColumn the query's generated `*SortColumns` enum, inferred
 *   from the sort members the columns use
 */
export interface EntityTableConfig<
  TQuery extends AnyQuery,
  TNode,
  TSortColumn extends string,
> {
  /** shown in the card header; omit for an untitled table */
  title?: string
  /** the generated *GQL service; TData and TVars are inferred from it */
  query: TQuery
  /** picks the connection out of the query result */
  connection: (data: Maybe<QueryData<TQuery>>) => Maybe<CvcConnection<TNode>>
  /** rendered left-to-right in array order */
  columns: CvcColumn<TNode, QueryVars<TQuery>, TSortColumn>[]
  /**
   * The query variable carrying the sort, typed against the query's own
   * variables and defaulting to `sortBy` — a misspelled sort variable would
   * otherwise be sent and silently ignored, exactly like an unmapped filter.
   */
  sortVar?: keyof QueryVars<TQuery> & string
  /**
   * Rows per page, sent as `first` on the initial query as well as subsequent
   * ones — one value, so page one cannot silently take the server's
   * `default_max_page_size` (100) while later pages take another.
   */
  pageSize?: number
  /**
   * Variables that are always sent and are not user-editable — a browse table's
   * `diseaseId`, an embedded table's `sourceId`. User filters are merged over
   * these, so a column filter cannot silently widen the table's scope.
   */
  scope?: Partial<QueryVars<TQuery>>
  /**
   * Called with each page of rows as it arrives, to project entities the query
   * denormalised back into the cache.
   *
   * `cvc-tag` renders from the Apollo cache alone, keyed `__typename:id`. A
   * `Browse*` row flattens its entities into scalar columns — `BrowseVariant`
   * carries `featureId`/`featureName`/`featureLink` rather than a `feature`
   * object — so it normalises to `BrowseVariant:<id>` and no `Variant:<id>` or
   * `Feature:<id>` entry is ever written. Tags for those columns then render as
   * `#<id>` skeletons even though the names are in the response.
   *
   * Use `writeCachedEntity` here; it satisfies the right fragment and refuses
   * to overwrite an entity a real query already cached. Nothing else belongs in
   * this hook — it runs on every page, and it is not a place for state the
   * table should own.
   */
  seedCache?: (rows: ReadonlyArray<TNode>) => void
}

/**
 * A column as it appears once `entityTableConfig` has erased the query types.
 *
 * `CvcColumn`'s own defaults are not this: `TVars` defaults to `unknown`, which
 * is what a column looks like before a config binds it to a query. Anything
 * reading columns *off a spec* wants this shape.
 */
export type CvcSpecColumn<TNode> = CvcColumn<
  TNode,
  Record<string, unknown>,
  string
>

/**
 * An EntityTableConfig with its query type parameters erased.
 *
 * Only `entityTableConfig` should produce one: the factory type-checks the
 * literal before erasing, and its return statement asserts this shape, so a
 * hand-built spec bypasses every check the config surface exists to make.
 */
export interface EntityTableSpec<TNode> {
  title?: string
  query: CvcTableQuery<unknown, Record<string, unknown>>
  connection: (data: unknown) => Maybe<CvcConnection<TNode>>
  columns: CvcColumn<TNode, Record<string, unknown>, string>[]
  pageSize: number
  scope: Record<string, unknown>
  sortVar: string
}

/** the query variable a table sorts through unless its config says otherwise */
export const DEFAULT_SORT_VAR = 'sortBy'

/** matches the server's own default, so behaviour is unchanged when unset */
export const DEFAULT_PAGE_SIZE = 50

/**
 * Type-checks a table config literal against its query, then erases the query
 * types. Inference does the work: `TNode` comes from `connection`'s return,
 * `TSortColumn` from the sort members the columns actually use, and the filter
 * `var` of every column is checked against that query's real variables.
 *
 * @param config the table's config literal; see `EntityTableConfig`
 * @returns the same config with defaults applied and query types erased
 * @throws in dev mode when two columns share a `key` (see `assertUniqueKeys`)
 */
export function entityTableConfig<
  TQuery extends AnyQuery,
  TNode,
  TSortColumn extends string,
>(
  config: EntityTableConfig<TQuery, TNode, TSortColumn>
): EntityTableSpec<TNode> {
  assertUniqueKeys(config.columns)
  return {
    ...config,
    pageSize: config.pageSize ?? DEFAULT_PAGE_SIZE,
    scope: (config.scope ?? {}) as Record<string, unknown>,
    sortVar: config.sortVar ?? DEFAULT_SORT_VAR,
  } as unknown as EntityTableSpec<TNode>
}

/**
 * Column keys address a column in preferences, filters, sticky offsets and the
 * `data-column` test hook — every one of them a `Map` or a lookup by key, and
 * `@for` tracks by it. A duplicate is therefore a silent aliasing bug rather
 * than a rendering one.
 *
 * Dev-mode only: this is a config authoring mistake, not a runtime condition,
 * and the check costs nothing to skip in production.
 */
function assertUniqueKeys(columns: ReadonlyArray<{ key: string }>): void {
  if (!isDevMode()) return
  const seen = new Set<string>()
  const duplicates = columns
    .map((column) => column.key)
    .filter((key) => !seen.add(key))
  if (duplicates.length > 0) {
    throw new Error(
      `entityTableConfig: duplicate column key(s) ${duplicates.join(', ')}. ` +
        'Keys address columns in preferences, filters and sticky offsets, so ' +
        'they must be unique.'
    )
  }
}

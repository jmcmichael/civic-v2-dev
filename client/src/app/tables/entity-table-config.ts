// QueryData/QueryVars are imported from the file rather than the forms/select
// barrel, which does not re-export them
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
 * `fetchMore({ variables })` and `watch({ variables })` are not. Declaring this
 * as `watch(variables?: TVars)` — as an earlier draft did — compiles perfectly
 * and silently sends no variables at all, because every key of a variables
 * object is simply an unrecognised option. The table then gets the server's
 * default page size instead of its own.
 */
export interface CvcTableQuery<TData, TVars extends OperationVariables> {
  watch(options?: { variables?: TVars }): QueryRef<TData, TVars>
}

/**
 * Everything a table needs beyond its template.
 *
 * Follows `entitySelectConfig` (forms/select/entity-select-config.ts:93): infer
 * every query type from the arguments, type-check the literal, then erase the
 * type parameters so the component carries only its row type. That erasure is
 * the whole point — the previous attempt at a generic table foundered on type
 * parameters that had to be spelled out at every use.
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
   * variables and defaulting to `sortBy`.
   *
   * The name used to be hardcoded, which is exactly the shape of the bug
   * `filter.var` exists to prevent: the evidence rating filter named
   * `evidenceRating` where the query declares `$rating`, so it set a variable
   * nothing read and filtered nothing, silently. A sort variable spelled wrong
   * fails the same way.
   */
  sortVar?: keyof QueryVars<TQuery> & string
  /**
   * Rows per page, for the first query as well as subsequent ones.
   *
   * Both managers omit `first` on the initial and refetched queries and set it
   * only when paging, so page one silently takes the server's
   * `default_max_page_size` of 100 while every later page is 50.
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

/** An EntityTableConfig with its query type parameters erased. */
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
 * than a rendering one, and the evidence manager shipped with two columns keyed
 * `id`: a hidden one that rendered nothing, and the visible EID column. It
 * survived only because the hidden one never reached `visibleColumns`.
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

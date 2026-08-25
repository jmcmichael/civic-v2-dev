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
 * A table config's members, parameterised by the query types they depend on.
 *
 * `EntityTableConfig` binds these to a generated query service and
 * `EntityTableSpec` erases them again. Declaring each member once here is what
 * stops an addition to the config from being forgotten in the shape the
 * component actually reads.
 *
 * @template TData the query's result type
 * @template TVars the query's variables type
 * @template TNode the row type
 * @template TSortColumn the query's generated `*SortColumns` enum
 */
interface EntityTableShape<TData, TVars, TNode, TSortColumn extends string> {
  /** shown in the card header; omit for an untitled table */
  title?: string
  /**
   * Picks the connection out of the query result.
   *
   * A method rather than a function-typed property, which is what lets
   * `entityTableConfig` erase `TData` by assignment: method parameters are
   * compared bivariantly, so a config's concrete result type still satisfies
   * the spec's `unknown`. The return type — the half that carries `TNode` — is
   * checked either way.
   */
  connection(data: Maybe<TData>): Maybe<CvcConnection<TNode>>
  /** rendered left-to-right in array order */
  columns: CvcColumn<TNode, TVars, TSortColumn>[]
  /**
   * The query variable carrying the sort, typed against the query's own
   * variables and defaulting to `sortBy` — a misspelled sort variable would
   * otherwise be sent and silently ignored, exactly like an unmapped filter.
   */
  sortVar?: keyof TVars & string
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
  scope?: Partial<TVars>
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
> extends EntityTableShape<
  QueryData<TQuery>,
  QueryVars<TQuery>,
  TNode,
  TSortColumn
> {
  /** the generated *GQL service; TData and TVars are inferred from it */
  query: TQuery
}

/**
 * The config's shape once `entityTableConfig` has erased its query types.
 *
 * `TVars` erases to `any`, not to a record type. `keyof TVars` puts a column's
 * filter variable in a contravariant position, and nothing but `any` lets a
 * column bound to a real query assign to an erased one. It reaches no value:
 * every member it feeds — `sortVar`, a filter's `var` — resolves to `string`.
 */
type ErasedTableShape<TNode> = EntityTableShape<unknown, any, TNode, string>

/**
 * A column as it appears once `entityTableConfig` has erased the query types.
 *
 * `CvcColumn`'s own defaults are not this: `TVars` defaults to `unknown`, which
 * is what a column looks like before a config binds it to a query. Anything
 * reading columns *off a spec* wants this shape.
 */
export type CvcSpecColumn<TNode> = ErasedTableShape<TNode>['columns'][number]

/**
 * An EntityTableConfig with its query type parameters erased and the factory's
 * defaults filled in — what `CvcEntityTableComponent` reads.
 *
 * Inherits its members from `EntityTableShape` rather than re-declaring them,
 * so a member added to the config cannot go missing here; the three it
 * redeclares are exactly the ones the factory supplies a default for.
 *
 * Only `entityTableConfig` should produce one: the factory type-checks the
 * literal before erasing, so a hand-built spec bypasses every check the config
 * surface exists to make.
 */
export interface EntityTableSpec<TNode> extends ErasedTableShape<TNode> {
  query: CvcTableQuery<unknown, Record<string, unknown>>
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
    // The two members no assignment can express. `query`: apollo-angular's
    // QueryRef is invariant in both of its parameters, so a generated service
    // is not assignable to the erased query surface however it is spelled.
    // `scope`: a generic variables type has no implicit index signature, so
    // Partial<TVars> does not reach Record<string, unknown>. Everything else —
    // the columns, `connection`'s row type, both remaining defaults — is
    // still checked.
    query: config.query as unknown as CvcTableQuery<
      unknown,
      Record<string, unknown>
    >,
    pageSize: config.pageSize ?? DEFAULT_PAGE_SIZE,
    scope: (config.scope ?? {}) as Record<string, unknown>,
    sortVar: config.sortVar ?? DEFAULT_SORT_VAR,
  }
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

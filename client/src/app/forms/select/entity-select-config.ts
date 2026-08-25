import { Maybe } from '@app/generated/civic.apollo.types'
import { TaggableTypename } from '@app/tags'
import { Apollo } from 'apollo-angular'
import { Observable } from 'rxjs'
import { CvcSelectEntityName } from './select.types'

/** Minimum shape a typeahead result needs to render as an option and a tag. */
export interface CvcEntitySelectResult {
  readonly id: number
  readonly __typename: string
  readonly name: string
}

// Re-exported from their neutral home so existing importers keep working;
// the definitions live in core because tables' config factory shares them.
export {
  type AnyQuery,
  type QueryData,
  type QueryVars,
} from '@app/core/utilities/query-types'
import { AnyQuery, QueryData, QueryVars } from '@app/core/utilities/query-types'

/**
 * Structural subset of a generated query service used at runtime. Sidesteps
 * `Query#fetch`'s `{} extends TVariables` conditional tuple, which cannot be
 * resolved for a generic TVariables.
 */
export interface CvcSelectQuery<TData> {
  fetch(options: any): Observable<Apollo.QueryResult<TData>>
}

/**
 * Everything an entity-select field needs beyond its template: which entity it
 * selects, how to search for it, and how to fetch one by id.
 */
export interface EntitySelectConfig<
  TResult extends CvcEntitySelectResult,
  TTypeahead extends AnyQuery,
  TTag extends AnyQuery,
  TParam = void,
> {
  entityName: CvcSelectEntityName
  /**
   * Static typename, or a resolver for polymorphic results (Variant,
   * Feature). A resolver runs per *typeahead* result; for a prepopulated id
   * the concrete typename usually arrives via the tag query instead.
   */
  typename: TaggableTypename | ((result: TResult) => TaggableTypename)
  typeahead: TTypeahead
  /**
   * Builds the typeahead's variables. `search` is `''` when the dropdown
   * opens with no input — the field lists what the server offers for an
   * empty query — so do not assume a non-empty string.
   */
  typeaheadVars: (search: string, param: TParam) => QueryVars<TTypeahead>
  typeaheadResults: (data: Maybe<QueryData<TTypeahead>>) => TResult[]
  /**
   * Fetched cache-first for each already-selected id. Its result is not
   * rendered: the fetch exists to put the entity's Linkable* fragment in the
   * cache (CvcTag reads from there via watchFragment) and to recover the
   * concrete typename for polymorphic fields.
   */
  tag: {
    query: TTag
    vars: (id: number) => QueryVars<TTag>
    result: (data: Maybe<QueryData<TTag>>) => Maybe<TResult>
  }
  minSearchStrLength?: number
}

/**
 * The config with its query type parameters erased. Instantiating at `AnyQuery`
 * erases `QueryData`/`QueryVars` to `any` on its own, which covers every member
 * except the two query services themselves.
 */
type ErasedSelectConfig<
  TResult extends CvcEntitySelectResult,
  TParam,
> = EntitySelectConfig<TResult, AnyQuery, AnyQuery, TParam>

/**
 * An EntitySelectConfig with its query type parameters erased. Member docs live
 * on `EntitySelectConfig`; produce one only via `entitySelectConfig`, whose
 * literal type-check a hand-built spec would bypass.
 *
 * Members are inherited rather than re-declared, so one added to the config
 * cannot go missing here. The two exceptions are the query services: a spec
 * carries the structural subset a field actually calls, which is a different
 * type from the generated class rather than an erasure of it.
 */
export interface EntitySelectSpec<
  TResult extends CvcEntitySelectResult,
  TParam = void,
> extends Omit<ErasedSelectConfig<TResult, TParam>, 'typeahead' | 'tag'> {
  typeahead: CvcSelectQuery<any>
  tag: Omit<ErasedSelectConfig<TResult, TParam>['tag'], 'query'> & {
    query: CvcSelectQuery<any>
  }
}

/**
 * Type-checks a config literal — inferring every query type from the GQL
 * services passed in, so a field spells out no explicit type arguments — then
 * erases them so field classes carry only their result type.
 *
 * @param config the field's select config; see `EntitySelectConfig`
 * @returns the same object, with query type parameters erased
 */
export function entitySelectConfig<
  TResult extends CvcEntitySelectResult,
  TTypeahead extends AnyQuery,
  TTag extends AnyQuery,
  TParam = void,
>(
  config: EntitySelectConfig<TResult, TTypeahead, TTag, TParam>
): EntitySelectSpec<TResult, TParam> {
  return {
    ...config,
    // The two members no assignment can erase: `Query#fetch` types its
    // arguments as a `{} extends TVariables` conditional tuple, which does not
    // resolve for a generic TVariables and so satisfies no call signature.
    // Everything else — both accessors' result types, the typename resolver —
    // is still checked.
    typeahead: config.typeahead as unknown as CvcSelectQuery<any>,
    tag: {
      ...config.tag,
      query: config.tag.query as unknown as CvcSelectQuery<any>,
    },
  }
}

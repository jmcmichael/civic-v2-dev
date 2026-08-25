import { Apollo, Query } from 'apollo-angular'
import { Observable } from 'rxjs'

/**
 * Type-level helpers over generated apollo-angular query services, shared by
 * the config factories that type-check literals against a query and then
 * erase it (`entitySelectConfig` in forms/select, `entityTableConfig` in
 * tables). A neutral home: forms and tables both consume these, and the
 * previous arrangement — tables deep-importing them from the forms barrel's
 * internals — made the two surfaces a module cycle.
 */

/** Any generated apollo-angular query service. */
export type AnyQuery = Query<any, any>

/**
 * Query type extraction. `Q extends Query<infer D, any>` cannot recover the
 * data type — TData sits in invariant positions on Query and the inference
 * collapses to never — so the data type comes from fetch()'s return instead,
 * where it is covariant. Variables do infer from the class directly.
 */
export type QueryData<Q extends AnyQuery> =
  ReturnType<Q['fetch']> extends Observable<Apollo.QueryResult<infer D>>
    ? D
    : never
export type QueryVars<Q extends AnyQuery> =
  Q extends Query<any, infer V> ? V : never

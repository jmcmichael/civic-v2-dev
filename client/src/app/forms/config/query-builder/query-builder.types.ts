// query-builder.types.ts
import {
  AssertionSearchFilter,
  BooleanOperator,
  DiseaseSearchFilter,
  EvidenceItemSearchFilter,
  FeatureSearchFilter,
  InputMaybe,
  MolecularProfileSearchFilter,
  PhenotypeSearchFilter,
  SourceSearchFilter,
  TherapySearchFilter,
  UserSearchFilter,
  VariantSearchFilter,
  VariantTypeSearchFilter,
} from '@app/generated/civic.apollo'
import { FormlyFieldConfig } from '@ngx-formly/core'

/**
 * Advanced search endpoints-to-filter type map
 */
type EndpointToFilter = {
  searchAssertions: AssertionSearchFilter
  searchDiseases: DiseaseSearchFilter
  searchEvidenceItems: EvidenceItemSearchFilter
  searchFeatures: FeatureSearchFilter
  searchMolecularProfiles: MolecularProfileSearchFilter
  searchPhenotypes: PhenotypeSearchFilter
  searchSources: SourceSearchFilter
  searchTherapies: TherapySearchFilter
  searchUsers: UserSearchFilter
  searchVariants: VariantSearchFilter
  searchVariantTypes: VariantTypeSearchFilter
}

type UnwrapInputMaybe<T> = T extends InputMaybe<infer U> ? U : T

/**
 * Differentiators for the two types of subFilter payload:
 *  - SearchInputLike  → leaf filter (operator + value)
 *  - SearchFilterLike → nested filter (booleanOperator + subFilters)
 */
type SearchInputLike = { operator: any; value: any }
type SearchFilterLike = { booleanOperator?: any; subFilters?: any }

/**
 * Keys whose type looks like a SearchInput (has operator + value):
 * static attributes of the entity.
 */
type LeafFilterFieldKey<TFilter> = Exclude<
  {
    [K in keyof TFilter]: UnwrapInputMaybe<TFilter[K]> extends SearchInputLike
      ? K
      : never
  }[keyof TFilter],
  'booleanOperator' | 'subFilters'
>

/**
 * Keys whose type looks like a SearchFilter (has booleanOperator + subFilters):
 * recursive subFilters for attributes of related entities.
 */
type NestedFilterFieldKey<TFilter> = {
  [K in keyof TFilter]: UnwrapInputMaybe<TFilter[K]> extends SearchFilterLike
    ? K
    : never
}[keyof TFilter]

/**
 * Leaf + nested filter keys (used for NormalizedSubFilter.fieldKey).
 */
type AnyFilterFieldKey<TFilter> =
  | LeafFilterFieldKey<TFilter>
  | NestedFilterFieldKey<TFilter>

/**
 * Recursive “input” type:
 *  - if T is a SearchInputLike, keep it as-is
 *  - if T is a SearchFilterLike, wrap it in a normalized filter
 */
export type NormalizedFilterInput<T> =
  // leaf search input (e.g. IntSearchInput, StringSearchInput, etc)
  T extends SearchInputLike
    ? T
    : // nested filter (e.g. DiseaseSearchFilter)
      T extends SearchFilterLike
      ? NormalizedAdvancedSearchFilter<T>
      : // anything else, fall back (shouldn't usually happen)
        T

/**
 * Normalized, Formly-friendly subFilter:
 *  - `fieldKey` holds which field from the filter we’re targeting
 *  - `input` holds either a SearchInput or a nested normalized filter
 */
export interface NormalizedSubFilter<
  TFilter,
  K extends AnyFilterFieldKey<TFilter> = AnyFilterFieldKey<TFilter>,
> {
  // useful for trackBy / stable identity in formly
  id: string

  // which field from the filter this row represents (e.g. 'evidenceRating' or 'disease')
  fieldKey: K

  // either:
  // - a SearchInputLike (operator/value), OR
  // - a recursively-normalized nested filter (booleanOperator + subFilters)
  input: NormalizedFilterInput<UnwrapInputMaybe<TFilter[K]>> | null
}

/**
 * Normalized “filter” object:
 *  - this is the shape used for both root query.query and nested filters
 */
export type NormalizedAdvancedSearchFilter<TFilter> = {
  booleanOperator: BooleanOperator
  subFilters: NormalizedSubFilter<TFilter>[]
}

/**
 * Normalized form model for a given filter type.
 */
export type NormalizedQueryBuilderFormModel<TFilter> = {
  query: NormalizedAdvancedSearchFilter<TFilter>
  createPermalink: boolean
}

/**
 * Normalized form query as exposed by the Apollo field policy:
 *  - booleanOperator can be null for robustness against missing data.
 */
export type NormalizedFormQuery<TFilter> = {
  booleanOperator: BooleanOperator | null
  subFilters: NormalizedSubFilter<TFilter>[]
}

/**
 * Endpoint / filter lookups
 */
export type AdvancedSearchEndpoint = keyof EndpointToFilter
export type AdvancedSearchFilter = EndpointToFilter[AdvancedSearchEndpoint]

// returns the proper form model type for a given endpoint
export type QueryBuilderFormModelFor<E extends AdvancedSearchEndpoint> =
  NormalizedQueryBuilderFormModel<EndpointToFilter[E]>

/*
 * APOLLO FIELD POLICY HELPERS
 */

// `any`-based aliases - QueryBuilderFormModelFor<E> not
// easily available in field policy functions
export type AnyNormalizedSubFilter = NormalizedSubFilter<any>
export type AnyNormalizedFormQuery = NormalizedFormQuery<any>
export type AnyNormalizedQueryBuilderFormModel =
  NormalizedQueryBuilderFormModel<any>

// union of all possible query types, for use in apollo field policy functions
export type AdvancedSearchNormalizedFormQuery =
  NormalizedFormQuery<AdvancedSearchFilter>

/*
 * FORMLY FIELD CONFIG HELPERS
 *
 * These help ensure per-endpoint field configs are either:
 *  - leaf search inputs, or
 *  - recursive descriptors, but not both.
 */

type LeafFieldConfig = FormlyFieldConfig & {
  key: string
  props: { label: string }
  fieldGroup: FormlyFieldConfig[]
}

type RecursiveFieldConfig = FormlyFieldConfig & {
  key: string
  props: {
    label: string
    isRecursive: true
    filterEndpoint: AdvancedSearchEndpoint
  }
  fieldGroup?: never
}

/**
 * Per-field descriptor used by getFieldOptions(endpoint).
 *  - leaf: has a `fieldGroup` describing a SearchInput
 *  - recursive: has `isRecursive + filterEndpoint`, no fieldGroup
 */
export type QueryFieldDescriptor = LeafFieldConfig | RecursiveFieldConfig

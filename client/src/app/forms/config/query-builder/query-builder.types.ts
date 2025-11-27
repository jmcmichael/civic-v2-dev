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

export type AdvancedSearchRecursiveFilterKey =
  | 'assertion'
  | 'disease'
  | 'evidenceItem'
  | 'feature'
  | 'molecularProfile'
  | 'phenotype'
  | 'source'
  | 'therapy'
  | 'user'
  | 'variant'
  | 'variantType'

export type QueryBuilderFormModel = {
  query: AdvancedSearchFilter
  createPermalink: boolean
}

export type QueryBuilderSearchEndpoint =
  | 'searchAssertions'
  | 'searchDiseases'
  | 'searchEvidenceItems'
  | 'searchFeatures'
  | 'searchMolecularProfiles'
  | 'searchPhenotypes'
  | 'searchSources'
  | 'searchTherapies'
  | 'searchUsers'
  | 'searchVariants'
  | 'searchVariantTypes'

/*
 * REFACTORED TYPES
 */

// advanced search endpoints to filter type map
type EndpointToFilter = {
  searchAssertions: AssertionSearchFilter
  searchDiseases: DiseaseSearchFilter
  searchEvidenceItems: EvidenceItemSearchFilter
  searchFeatures: FeatureSearchFilter
  searchMolecularProfile: MolecularProfileSearchFilter
  searchPhenotypes: PhenotypeSearchFilter
  searchSources: SourceSearchFilter
  searchTherapies: TherapySearchFilter
  searchUsers: UserSearchFilter
  searchVariants: VariantSearchFilter
  searchVariantTypes: VariantTypeSearchFilter
}
type UnwrapInputMaybe<T> = T extends InputMaybe<infer U> ? U : T

// formQuery keys whose type looks like a SearchInput
// (has operator + value): static attributes of the entity
type FilterFieldKey<TFilter> = Exclude<
  {
    [K in keyof TFilter]: UnwrapInputMaybe<TFilter[K]> extends {
      operator: any
      value: any
    }
      ? K
      : never
  }[keyof TFilter],
  'booleanOperator' | 'subFilters'
>
// formQuery keys whose type looks like a SearchFilter
// (has booleanOperator + subFilters): recursive
// subFilters for attributes of related entities
type NestedFilterFieldKey<TFilter> = {
  [K in keyof TFilter]: UnwrapInputMaybe<TFilter[K]> extends SearchFilterLike
    ? K
    : never
}[keyof TFilter]

// normalized, formly-friendly subFilter, with subfilter key
// stored as fieldKey value
export interface NormalizedSubFilter<
  TFilter,
  K extends AnyFilterFieldKey<TFilter> = AnyFilterFieldKey<TFilter>,
> {
  // useful for trackBy / stable identity in formly
  id: string

  // which field from the filter this row represents
  // (e.g. 'evidenceRating' or 'disease')
  fieldKey: K

  // either:
  // - a SearchInputLike (operator/value), OR
  // - a recursively-normalized nested filter (booleanOperator + subFilters)
  input: NormalizedFilterInput<UnwrapInputMaybe<TFilter[K]>> | null
}
// normalized subFilter object
export type NormalizedAdvancedSearchFilter<TFilter> = {
  booleanOperator: BooleanOperator
  subFilters: NormalizedSubFilter<TFilter>[]
}

// normalized form model
export type NormalizedQueryBuilderFormModel<TFilter> = {
  query: NormalizedAdvancedSearchFilter<TFilter>
  createPermalink: boolean
}

// normalized form query
export type NormalizedFormQuery<TFilter> = {
  booleanOperator: BooleanOperator | null
  subFilters: NormalizedSubFilter<TFilter>[]
}

export type AdvancedSearchEndpoint = keyof EndpointToFilter
export type AdvancedSearchFilter = EndpointToFilter[AdvancedSearchEndpoint]

// returns the proper form model type for a given endpoint
export type QueryBuilderFormModelFor<E extends AdvancedSearchEndpoint> =
  NormalizedQueryBuilderFormModel<EndpointToFilter[E]>

/*
 * APOLLO FIELD POLICY HELPERS
 */

// `any`-based aliases - QueryBuilderFormModelFor<E> not
// easily available in field policy functions (?)
export type AnyNormalizedSubFilter = NormalizedSubFilter<any>
export type AnyNormalizedFormQuery = NormalizedFormQuery<any>
export type AnyNormalizedQueryBuilderFormModel =
  NormalizedQueryBuilderFormModel<any>
// union of all possible query types
export type AdvancedSearchNormalizedFormQuery =
  NormalizedFormQuery<AdvancedSearchFilter>

// differentiators for the two types of subFilter
type SearchInputLike = { operator: any; value: any }
type SearchFilterLike = { booleanOperator?: any; subFilters?: any }

export type NormalizedFilterInput<T> =
  // leaf search input (e.g. IntSearchInput, StringSearchInput, etc)
  T extends SearchInputLike
    ? T
    : // nested filter (e.g. DiseaseSearchFilter)
      T extends SearchFilterLike
      ? NormalizedAdvancedSearchFilter<T>
      : // anything else, fall back (shouldn't usually happen)
        T

// leaf-only keys (current behavior)
type LeafFilterFieldKey<TFilter> = FilterFieldKey<TFilter>

// leaf + nested filter keys (useful for fieldKey on subFilters)
type AnyFilterFieldKey<TFilter> =
  | LeafFilterFieldKey<TFilter>
  | NestedFilterFieldKey<TFilter>

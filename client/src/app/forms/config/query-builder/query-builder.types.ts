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

type UnwrapInputMaybe<T> = T extends InputMaybe<infer U> ? U : T

// keys whose type looks like a SearchInput (has operator + value)
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

export interface NormalizedSubFilter<
  TFilter,
  K extends FilterFieldKey<TFilter> = FilterFieldKey<TFilter>,
> {
  // useful for trackBy / stable identity in formly
  id: string

  // which field from the filter this row represents (e.g. 'evidenceRating')
  fieldKey: K

  // the actual SearchInput value, e.g. IntSearchInput, StringSearchInput, etc
  // remains strongly typed based on the fieldKey & TFilter
  input: UnwrapInputMaybe<TFilter[K]> | null
}

export type NormalizedAdvancedSearchFilter<TFilter> = {
  booleanOperator: BooleanOperator
  subFilters: NormalizedSubFilter<TFilter>[]
}

export type NormalizedQueryBuilderFormModel<TFilter> = {
  query: NormalizedAdvancedSearchFilter<TFilter>
  createPermalink: boolean
}

export type NormalizedFormQuery<TFilter> = {
  booleanOperator: BooleanOperator | null
  subFilters: NormalizedSubFilter<TFilter>[]
}

// `any`-based aliases for use where QueryBuilderFormModelFor<E>
// cannot be passed, e.g. in apollo field policy functions
export type AnyNormalizedSubFilter = NormalizedSubFilter<any>
export type AnyNormalizedFormQuery = NormalizedFormQuery<any>
export type AnyNormalizedQueryBuilderFormModel =
  NormalizedQueryBuilderFormModel<any>

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

export type AdvancedSearchEndpoint = keyof EndpointToFilter
export type AdvancedSearchFilter = EndpointToFilter[AdvancedSearchEndpoint]

// returns the proper form model type for a given endpoint
export type QueryBuilderFormModelFor<E extends AdvancedSearchEndpoint> =
  NormalizedQueryBuilderFormModel<EndpointToFilter[E]>

// union of all possible query types, for use in apollo field policy functions
export type AdvancedSearchNormalizedFormQuery =
  NormalizedFormQuery<AdvancedSearchFilter>

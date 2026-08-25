/* eslint-disable */
import * as Types from '../../../generated/civic.apollo.types';

import { gql } from 'apollo-angular';
import { LinkableVariantFragmentDoc, LinkableMolecularProfileFragmentDoc, LinkableAssertionFragmentDoc, LinkableEvidenceItemFragmentDoc } from '../../../tags/linkable.fragments.gql.generated';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type CountedEvidenceItemsQueryVariables = Types.Exact<{
  first: Types.Scalars['Int']['input'];
  assertionId?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  clinicalTrialId?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  diseaseId?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  molecularProfileId?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  phenotypeId?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  sourceId?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  therapyId?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  userId?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  variantId?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type CountedEvidenceItemsQuery = { __typename: 'Query', evidenceItems: { __typename: 'EvidenceItemConnection', totalCount: number, edges: Array<{ __typename: 'EvidenceItemEdge', node?: { __typename: 'EvidenceItem', id: number, name: string, link: string, flagged: boolean, status: Types.EvidenceStatus } | undefined }> } };

export type CountedAssertionsQueryVariables = Types.Exact<{
  first: Types.Scalars['Int']['input'];
  diseaseId?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  molecularProfileId?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  phenotypeId?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  therapyId?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  userId?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type CountedAssertionsQuery = { __typename: 'Query', assertions: { __typename: 'AssertionConnection', totalCount: number, edges: Array<{ __typename: 'AssertionEdge', node?: { __typename: 'Assertion', id: number, name: string, link: string, flagged: boolean, status: Types.EvidenceStatus } | undefined }> } };

export type CountedMolecularProfilesQueryVariables = Types.Exact<{
  first: Types.Scalars['Int']['input'];
  featureId?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type CountedMolecularProfilesQuery = { __typename: 'Query', molecularProfiles: { __typename: 'MolecularProfileConnection', totalCount: number, edges: Array<{ __typename: 'MolecularProfileEdge', node?: { __typename: 'MolecularProfile', id: number, name: string, link: string, flagged: boolean, deprecated: boolean } | undefined }> } };

export type CountedVariantsQueryVariables = Types.Exact<{
  first: Types.Scalars['Int']['input'];
  featureId?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  variantTypeIds?: Types.InputMaybe<Array<Types.Scalars['Int']['input']> | Types.Scalars['Int']['input']>;
}>;


export type CountedVariantsQuery = { __typename: 'Query', variants: { __typename: 'VariantInterfaceConnection', totalCount: number, edges: Array<{ __typename: 'VariantInterfaceEdge', node?:
        | { __typename: 'FactorVariant', id: number, name: string, link: string, flagged: boolean, deprecated: boolean }
        | { __typename: 'FusionVariant', id: number, name: string, link: string, flagged: boolean, deprecated: boolean }
        | { __typename: 'GeneVariant', id: number, name: string, link: string, flagged: boolean, deprecated: boolean }
        | { __typename: 'RegionVariant', id: number, name: string, link: string, flagged: boolean, deprecated: boolean }
        | { __typename: 'Variant', id: number, name: string, link: string, flagged: boolean, deprecated: boolean }
       | undefined }> } };

export type CountedGroupVariantsQueryVariables = Types.Exact<{
  first: Types.Scalars['Int']['input'];
  variantGroupId?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type CountedGroupVariantsQuery = { __typename: 'Query', browseVariants: { __typename: 'BrowseVariantConnection', totalCount: number, edges: Array<{ __typename: 'BrowseVariantEdge', node?: { __typename: 'BrowseVariant', id: number, name: string, link: string, flagged: boolean, deprecated: boolean } | undefined }> } };

export type CountedSourcesQueryVariables = Types.Exact<{
  first: Types.Scalars['Int']['input'];
  clinicalTrialId?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type CountedSourcesQuery = { __typename: 'Query', browseSources: { __typename: 'BrowseSourceConnection', totalCount: number, edges: Array<{ __typename: 'BrowseSourceEdge', node?: { __typename: 'BrowseSource', id: number, name?: string | undefined, link: string, citation: string, sourceType: Types.SourceSource, deprecated: boolean } | undefined }> } };

export const CountedEvidenceItemsDocument = gql`
    query CountedEvidenceItems($first: Int!, $assertionId: Int, $clinicalTrialId: Int, $diseaseId: Int, $molecularProfileId: Int, $phenotypeId: Int, $sourceId: Int, $therapyId: Int, $userId: Int, $variantId: Int) {
  evidenceItems(
    first: $first
    assertionId: $assertionId
    clinicalTrialId: $clinicalTrialId
    diseaseId: $diseaseId
    molecularProfileId: $molecularProfileId
    phenotypeId: $phenotypeId
    sourceId: $sourceId
    therapyId: $therapyId
    userId: $userId
    variantId: $variantId
  ) {
    totalCount
    edges {
      node {
        ...LinkableEvidenceItem
      }
    }
  }
}
    ${LinkableEvidenceItemFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class CountedEvidenceItemsGQL extends Apollo.Query<CountedEvidenceItemsQuery, CountedEvidenceItemsQueryVariables> {
    document = CountedEvidenceItemsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CountedAssertionsDocument = gql`
    query CountedAssertions($first: Int!, $diseaseId: Int, $molecularProfileId: Int, $phenotypeId: Int, $therapyId: Int, $userId: Int) {
  assertions(
    first: $first
    diseaseId: $diseaseId
    molecularProfileId: $molecularProfileId
    phenotypeId: $phenotypeId
    therapyId: $therapyId
    userId: $userId
  ) {
    totalCount
    edges {
      node {
        ...LinkableAssertion
      }
    }
  }
}
    ${LinkableAssertionFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class CountedAssertionsGQL extends Apollo.Query<CountedAssertionsQuery, CountedAssertionsQueryVariables> {
    document = CountedAssertionsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CountedMolecularProfilesDocument = gql`
    query CountedMolecularProfiles($first: Int!, $featureId: Int) {
  molecularProfiles(first: $first, featureId: $featureId) {
    totalCount
    edges {
      node {
        ...LinkableMolecularProfile
      }
    }
  }
}
    ${LinkableMolecularProfileFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class CountedMolecularProfilesGQL extends Apollo.Query<CountedMolecularProfilesQuery, CountedMolecularProfilesQueryVariables> {
    document = CountedMolecularProfilesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CountedVariantsDocument = gql`
    query CountedVariants($first: Int!, $featureId: Int, $variantTypeIds: [Int!]) {
  variants(first: $first, featureId: $featureId, variantTypeIds: $variantTypeIds) {
    totalCount
    edges {
      node {
        ...LinkableVariant
      }
    }
  }
}
    ${LinkableVariantFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class CountedVariantsGQL extends Apollo.Query<CountedVariantsQuery, CountedVariantsQueryVariables> {
    document = CountedVariantsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CountedGroupVariantsDocument = gql`
    query CountedGroupVariants($first: Int!, $variantGroupId: Int) {
  browseVariants(first: $first, variantGroupId: $variantGroupId) {
    totalCount
    edges {
      node {
        id
        name
        link
        flagged
        deprecated
      }
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class CountedGroupVariantsGQL extends Apollo.Query<CountedGroupVariantsQuery, CountedGroupVariantsQueryVariables> {
    document = CountedGroupVariantsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const CountedSourcesDocument = gql`
    query CountedSources($first: Int!, $clinicalTrialId: Int) {
  browseSources(first: $first, clinicalTrialId: $clinicalTrialId) {
    totalCount
    edges {
      node {
        id
        name
        link
        citation
        sourceType
        deprecated
      }
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class CountedSourcesGQL extends Apollo.Query<CountedSourcesQuery, CountedSourcesQueryVariables> {
    document = CountedSourcesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
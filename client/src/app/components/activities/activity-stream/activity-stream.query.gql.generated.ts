/* eslint-disable */
import * as Types from '../../../generated/civic.apollo.types';

import { gql } from 'apollo-angular';
import { ActivityFeedItemBaseFragmentDoc } from './activity-stream.fragments.gql.generated';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type ActivityStreamQueryVariables = Types.Exact<{
  subject?: Types.InputMaybe<Array<Types.SubscribableQueryInput> | Types.SubscribableQueryInput>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  organizationId?: Types.InputMaybe<Array<Types.Scalars['Int']['input']> | Types.Scalars['Int']['input']>;
  includeSubgroups: Types.Scalars['Boolean']['input'];
  userId?: Types.InputMaybe<Array<Types.Scalars['Int']['input']> | Types.Scalars['Int']['input']>;
  activityType?: Types.InputMaybe<Array<Types.ActivityTypeInput> | Types.ActivityTypeInput>;
  subjectType?: Types.InputMaybe<Array<Types.ActivitySubjectInput> | Types.ActivitySubjectInput>;
  linkedApprovalId?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  includeAutomatedEvents?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
  mode?: Types.InputMaybe<Types.EventFeedMode>;
  showFilters: Types.Scalars['Boolean']['input'];
  occurredAfter?: Types.InputMaybe<Types.Scalars['ISO8601DateTime']['input']>;
  occurredBefore?: Types.InputMaybe<Types.Scalars['ISO8601DateTime']['input']>;
  sortBy?: Types.InputMaybe<Types.DateSort>;
}>;


export type ActivityStreamQuery = { __typename: 'Query', activities: { __typename: 'ActivityInterfaceConnection', activityTypes?: Array<Types.ActivityTypeInput>, subjectTypes?: Array<Types.ActivitySubjectInput>, pageCount: number, totalCount: number, unfilteredCount: number, uniqueParticipants?: Array<{ __typename: 'User', id: number, displayName: string, role: Types.UserRole }>, participatingOrganizations?: Array<{ __typename: 'Organization', id: number, name: string }>, pageInfo: { __typename: 'PageInfo', startCursor?: string | undefined, endCursor?: string | undefined, hasNextPage: boolean, hasPreviousPage: boolean }, edges: Array<{ __typename: 'ActivityInterfaceEdge', cursor: string, node?:
        | { __typename: 'AcceptRevisionsActivity', id: number, verbiage: string, createdAt: any, organization?: { __typename: 'Organization', id: number, name: string } | undefined, user: { __typename: 'User', id: number, displayName: string, role: Types.UserRole }, subject:
            | { __typename: 'Assertion', id: number, name: string, link: string }
            | { __typename: 'Comment', deleted: boolean, deletedAt?: any | undefined, id: number, name: string, link: string, commentable:
                | { __typename: 'Assertion', id: number, name: string, link: string }
                | { __typename: 'EvidenceItem', id: number, name: string, link: string }
                | { __typename: 'Factor', id: number, name: string, link: string }
                | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Feature', id: number, name: string, link: string }
                | { __typename: 'Flag', id: number, name: string, link: string }
                | { __typename: 'Fusion', id: number, name: string, link: string }
                | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Gene', id: number, name: string, link: string }
                | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'MolecularProfile', id: number, name: string, link: string }
                | { __typename: 'Region', id: number, name: string, link: string }
                | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Revision', id: number, name: string, link: string }
                | { __typename: 'Source', id: number, name: string, link: string }
                | { __typename: 'SourcePopover', id: number, name: string, link: string }
                | { __typename: 'Variant', id: number, name: string, link: string }
                | { __typename: 'VariantGroup', id: number, name: string, link: string }
               }
            | { __typename: 'EvidenceItem', id: number, name: string, link: string }
            | { __typename: 'ExonCoordinate', id: number, name: string, link: string }
            | { __typename: 'Factor', id: number, name: string, link: string }
            | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Feature', id: number, name: string, link: string }
            | { __typename: 'Flag', id: number, name: string, link: string }
            | { __typename: 'Fusion', id: number, name: string, link: string }
            | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Gene', id: number, name: string, link: string }
            | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'MolecularProfile', id: number, name: string, link: string }
            | { __typename: 'Region', id: number, name: string, link: string }
            | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Revision', id: number, name: string, link: string }
            | { __typename: 'RevisionSet', id: number, name: string, link: string }
            | { __typename: 'Source', id: number, name: string, link: string }
            | { __typename: 'SourcePopover', id: number, name: string, link: string }
            | { __typename: 'SourceSuggestion', id: number, name: string, link: string }
            | { __typename: 'Variant', id: number, name: string, link: string }
            | { __typename: 'VariantCoordinate', id: number, name: string, link: string }
            | { __typename: 'VariantGroup', id: number, name: string, link: string }
           }
        | { __typename: 'ApproveAssertionActivity', id: number, verbiage: string, createdAt: any, organization?: { __typename: 'Organization', id: number, name: string } | undefined, user: { __typename: 'User', id: number, displayName: string, role: Types.UserRole }, subject:
            | { __typename: 'Assertion', id: number, name: string, link: string }
            | { __typename: 'Comment', deleted: boolean, deletedAt?: any | undefined, id: number, name: string, link: string, commentable:
                | { __typename: 'Assertion', id: number, name: string, link: string }
                | { __typename: 'EvidenceItem', id: number, name: string, link: string }
                | { __typename: 'Factor', id: number, name: string, link: string }
                | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Feature', id: number, name: string, link: string }
                | { __typename: 'Flag', id: number, name: string, link: string }
                | { __typename: 'Fusion', id: number, name: string, link: string }
                | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Gene', id: number, name: string, link: string }
                | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'MolecularProfile', id: number, name: string, link: string }
                | { __typename: 'Region', id: number, name: string, link: string }
                | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Revision', id: number, name: string, link: string }
                | { __typename: 'Source', id: number, name: string, link: string }
                | { __typename: 'SourcePopover', id: number, name: string, link: string }
                | { __typename: 'Variant', id: number, name: string, link: string }
                | { __typename: 'VariantGroup', id: number, name: string, link: string }
               }
            | { __typename: 'EvidenceItem', id: number, name: string, link: string }
            | { __typename: 'ExonCoordinate', id: number, name: string, link: string }
            | { __typename: 'Factor', id: number, name: string, link: string }
            | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Feature', id: number, name: string, link: string }
            | { __typename: 'Flag', id: number, name: string, link: string }
            | { __typename: 'Fusion', id: number, name: string, link: string }
            | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Gene', id: number, name: string, link: string }
            | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'MolecularProfile', id: number, name: string, link: string }
            | { __typename: 'Region', id: number, name: string, link: string }
            | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Revision', id: number, name: string, link: string }
            | { __typename: 'RevisionSet', id: number, name: string, link: string }
            | { __typename: 'Source', id: number, name: string, link: string }
            | { __typename: 'SourcePopover', id: number, name: string, link: string }
            | { __typename: 'SourceSuggestion', id: number, name: string, link: string }
            | { __typename: 'Variant', id: number, name: string, link: string }
            | { __typename: 'VariantCoordinate', id: number, name: string, link: string }
            | { __typename: 'VariantGroup', id: number, name: string, link: string }
           }
        | { __typename: 'CommentActivity', id: number, verbiage: string, createdAt: any, comment: { __typename: 'Comment', id: number, name: string, link: string }, organization?: { __typename: 'Organization', id: number, name: string } | undefined, user: { __typename: 'User', id: number, displayName: string, role: Types.UserRole }, subject:
            | { __typename: 'Assertion', id: number, name: string, link: string }
            | { __typename: 'Comment', deleted: boolean, deletedAt?: any | undefined, id: number, name: string, link: string, commentable:
                | { __typename: 'Assertion', id: number, name: string, link: string }
                | { __typename: 'EvidenceItem', id: number, name: string, link: string }
                | { __typename: 'Factor', id: number, name: string, link: string }
                | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Feature', id: number, name: string, link: string }
                | { __typename: 'Flag', id: number, name: string, link: string }
                | { __typename: 'Fusion', id: number, name: string, link: string }
                | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Gene', id: number, name: string, link: string }
                | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'MolecularProfile', id: number, name: string, link: string }
                | { __typename: 'Region', id: number, name: string, link: string }
                | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Revision', id: number, name: string, link: string }
                | { __typename: 'Source', id: number, name: string, link: string }
                | { __typename: 'SourcePopover', id: number, name: string, link: string }
                | { __typename: 'Variant', id: number, name: string, link: string }
                | { __typename: 'VariantGroup', id: number, name: string, link: string }
               }
            | { __typename: 'EvidenceItem', id: number, name: string, link: string }
            | { __typename: 'ExonCoordinate', id: number, name: string, link: string }
            | { __typename: 'Factor', id: number, name: string, link: string }
            | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Feature', id: number, name: string, link: string }
            | { __typename: 'Flag', id: number, name: string, link: string }
            | { __typename: 'Fusion', id: number, name: string, link: string }
            | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Gene', id: number, name: string, link: string }
            | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'MolecularProfile', id: number, name: string, link: string }
            | { __typename: 'Region', id: number, name: string, link: string }
            | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Revision', id: number, name: string, link: string }
            | { __typename: 'RevisionSet', id: number, name: string, link: string }
            | { __typename: 'Source', id: number, name: string, link: string }
            | { __typename: 'SourcePopover', id: number, name: string, link: string }
            | { __typename: 'SourceSuggestion', id: number, name: string, link: string }
            | { __typename: 'Variant', id: number, name: string, link: string }
            | { __typename: 'VariantCoordinate', id: number, name: string, link: string }
            | { __typename: 'VariantGroup', id: number, name: string, link: string }
           }
        | { __typename: 'CreateComplexMolecularProfileActivity', id: number, verbiage: string, createdAt: any, organization?: { __typename: 'Organization', id: number, name: string } | undefined, user: { __typename: 'User', id: number, displayName: string, role: Types.UserRole }, subject:
            | { __typename: 'Assertion', id: number, name: string, link: string }
            | { __typename: 'Comment', deleted: boolean, deletedAt?: any | undefined, id: number, name: string, link: string, commentable:
                | { __typename: 'Assertion', id: number, name: string, link: string }
                | { __typename: 'EvidenceItem', id: number, name: string, link: string }
                | { __typename: 'Factor', id: number, name: string, link: string }
                | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Feature', id: number, name: string, link: string }
                | { __typename: 'Flag', id: number, name: string, link: string }
                | { __typename: 'Fusion', id: number, name: string, link: string }
                | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Gene', id: number, name: string, link: string }
                | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'MolecularProfile', id: number, name: string, link: string }
                | { __typename: 'Region', id: number, name: string, link: string }
                | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Revision', id: number, name: string, link: string }
                | { __typename: 'Source', id: number, name: string, link: string }
                | { __typename: 'SourcePopover', id: number, name: string, link: string }
                | { __typename: 'Variant', id: number, name: string, link: string }
                | { __typename: 'VariantGroup', id: number, name: string, link: string }
               }
            | { __typename: 'EvidenceItem', id: number, name: string, link: string }
            | { __typename: 'ExonCoordinate', id: number, name: string, link: string }
            | { __typename: 'Factor', id: number, name: string, link: string }
            | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Feature', id: number, name: string, link: string }
            | { __typename: 'Flag', id: number, name: string, link: string }
            | { __typename: 'Fusion', id: number, name: string, link: string }
            | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Gene', id: number, name: string, link: string }
            | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'MolecularProfile', id: number, name: string, link: string }
            | { __typename: 'Region', id: number, name: string, link: string }
            | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Revision', id: number, name: string, link: string }
            | { __typename: 'RevisionSet', id: number, name: string, link: string }
            | { __typename: 'Source', id: number, name: string, link: string }
            | { __typename: 'SourcePopover', id: number, name: string, link: string }
            | { __typename: 'SourceSuggestion', id: number, name: string, link: string }
            | { __typename: 'Variant', id: number, name: string, link: string }
            | { __typename: 'VariantCoordinate', id: number, name: string, link: string }
            | { __typename: 'VariantGroup', id: number, name: string, link: string }
           }
        | { __typename: 'CreateFeatureActivity', id: number, verbiage: string, createdAt: any, organization?: { __typename: 'Organization', id: number, name: string } | undefined, user: { __typename: 'User', id: number, displayName: string, role: Types.UserRole }, subject:
            | { __typename: 'Assertion', id: number, name: string, link: string }
            | { __typename: 'Comment', deleted: boolean, deletedAt?: any | undefined, id: number, name: string, link: string, commentable:
                | { __typename: 'Assertion', id: number, name: string, link: string }
                | { __typename: 'EvidenceItem', id: number, name: string, link: string }
                | { __typename: 'Factor', id: number, name: string, link: string }
                | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Feature', id: number, name: string, link: string }
                | { __typename: 'Flag', id: number, name: string, link: string }
                | { __typename: 'Fusion', id: number, name: string, link: string }
                | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Gene', id: number, name: string, link: string }
                | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'MolecularProfile', id: number, name: string, link: string }
                | { __typename: 'Region', id: number, name: string, link: string }
                | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Revision', id: number, name: string, link: string }
                | { __typename: 'Source', id: number, name: string, link: string }
                | { __typename: 'SourcePopover', id: number, name: string, link: string }
                | { __typename: 'Variant', id: number, name: string, link: string }
                | { __typename: 'VariantGroup', id: number, name: string, link: string }
               }
            | { __typename: 'EvidenceItem', id: number, name: string, link: string }
            | { __typename: 'ExonCoordinate', id: number, name: string, link: string }
            | { __typename: 'Factor', id: number, name: string, link: string }
            | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Feature', id: number, name: string, link: string }
            | { __typename: 'Flag', id: number, name: string, link: string }
            | { __typename: 'Fusion', id: number, name: string, link: string }
            | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Gene', id: number, name: string, link: string }
            | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'MolecularProfile', id: number, name: string, link: string }
            | { __typename: 'Region', id: number, name: string, link: string }
            | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Revision', id: number, name: string, link: string }
            | { __typename: 'RevisionSet', id: number, name: string, link: string }
            | { __typename: 'Source', id: number, name: string, link: string }
            | { __typename: 'SourcePopover', id: number, name: string, link: string }
            | { __typename: 'SourceSuggestion', id: number, name: string, link: string }
            | { __typename: 'Variant', id: number, name: string, link: string }
            | { __typename: 'VariantCoordinate', id: number, name: string, link: string }
            | { __typename: 'VariantGroup', id: number, name: string, link: string }
           }
        | { __typename: 'CreateVariantActivity', id: number, verbiage: string, createdAt: any, organization?: { __typename: 'Organization', id: number, name: string } | undefined, user: { __typename: 'User', id: number, displayName: string, role: Types.UserRole }, subject:
            | { __typename: 'Assertion', id: number, name: string, link: string }
            | { __typename: 'Comment', deleted: boolean, deletedAt?: any | undefined, id: number, name: string, link: string, commentable:
                | { __typename: 'Assertion', id: number, name: string, link: string }
                | { __typename: 'EvidenceItem', id: number, name: string, link: string }
                | { __typename: 'Factor', id: number, name: string, link: string }
                | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Feature', id: number, name: string, link: string }
                | { __typename: 'Flag', id: number, name: string, link: string }
                | { __typename: 'Fusion', id: number, name: string, link: string }
                | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Gene', id: number, name: string, link: string }
                | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'MolecularProfile', id: number, name: string, link: string }
                | { __typename: 'Region', id: number, name: string, link: string }
                | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Revision', id: number, name: string, link: string }
                | { __typename: 'Source', id: number, name: string, link: string }
                | { __typename: 'SourcePopover', id: number, name: string, link: string }
                | { __typename: 'Variant', id: number, name: string, link: string }
                | { __typename: 'VariantGroup', id: number, name: string, link: string }
               }
            | { __typename: 'EvidenceItem', id: number, name: string, link: string }
            | { __typename: 'ExonCoordinate', id: number, name: string, link: string }
            | { __typename: 'Factor', id: number, name: string, link: string }
            | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Feature', id: number, name: string, link: string }
            | { __typename: 'Flag', id: number, name: string, link: string }
            | { __typename: 'Fusion', id: number, name: string, link: string }
            | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Gene', id: number, name: string, link: string }
            | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'MolecularProfile', id: number, name: string, link: string }
            | { __typename: 'Region', id: number, name: string, link: string }
            | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Revision', id: number, name: string, link: string }
            | { __typename: 'RevisionSet', id: number, name: string, link: string }
            | { __typename: 'Source', id: number, name: string, link: string }
            | { __typename: 'SourcePopover', id: number, name: string, link: string }
            | { __typename: 'SourceSuggestion', id: number, name: string, link: string }
            | { __typename: 'Variant', id: number, name: string, link: string }
            | { __typename: 'VariantCoordinate', id: number, name: string, link: string }
            | { __typename: 'VariantGroup', id: number, name: string, link: string }
           }
        | { __typename: 'DeleteCommentActivity', id: number, verbiage: string, createdAt: any, comment: { __typename: 'Comment', id: number, name: string, link: string }, organization?: { __typename: 'Organization', id: number, name: string } | undefined, user: { __typename: 'User', id: number, displayName: string, role: Types.UserRole }, subject:
            | { __typename: 'Assertion', id: number, name: string, link: string }
            | { __typename: 'Comment', deleted: boolean, deletedAt?: any | undefined, id: number, name: string, link: string, commentable:
                | { __typename: 'Assertion', id: number, name: string, link: string }
                | { __typename: 'EvidenceItem', id: number, name: string, link: string }
                | { __typename: 'Factor', id: number, name: string, link: string }
                | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Feature', id: number, name: string, link: string }
                | { __typename: 'Flag', id: number, name: string, link: string }
                | { __typename: 'Fusion', id: number, name: string, link: string }
                | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Gene', id: number, name: string, link: string }
                | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'MolecularProfile', id: number, name: string, link: string }
                | { __typename: 'Region', id: number, name: string, link: string }
                | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Revision', id: number, name: string, link: string }
                | { __typename: 'Source', id: number, name: string, link: string }
                | { __typename: 'SourcePopover', id: number, name: string, link: string }
                | { __typename: 'Variant', id: number, name: string, link: string }
                | { __typename: 'VariantGroup', id: number, name: string, link: string }
               }
            | { __typename: 'EvidenceItem', id: number, name: string, link: string }
            | { __typename: 'ExonCoordinate', id: number, name: string, link: string }
            | { __typename: 'Factor', id: number, name: string, link: string }
            | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Feature', id: number, name: string, link: string }
            | { __typename: 'Flag', id: number, name: string, link: string }
            | { __typename: 'Fusion', id: number, name: string, link: string }
            | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Gene', id: number, name: string, link: string }
            | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'MolecularProfile', id: number, name: string, link: string }
            | { __typename: 'Region', id: number, name: string, link: string }
            | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Revision', id: number, name: string, link: string }
            | { __typename: 'RevisionSet', id: number, name: string, link: string }
            | { __typename: 'Source', id: number, name: string, link: string }
            | { __typename: 'SourcePopover', id: number, name: string, link: string }
            | { __typename: 'SourceSuggestion', id: number, name: string, link: string }
            | { __typename: 'Variant', id: number, name: string, link: string }
            | { __typename: 'VariantCoordinate', id: number, name: string, link: string }
            | { __typename: 'VariantGroup', id: number, name: string, link: string }
           }
        | { __typename: 'DeprecateComplexMolecularProfileActivity', id: number, verbiage: string, createdAt: any, organization?: { __typename: 'Organization', id: number, name: string } | undefined, user: { __typename: 'User', id: number, displayName: string, role: Types.UserRole }, subject:
            | { __typename: 'Assertion', id: number, name: string, link: string }
            | { __typename: 'Comment', deleted: boolean, deletedAt?: any | undefined, id: number, name: string, link: string, commentable:
                | { __typename: 'Assertion', id: number, name: string, link: string }
                | { __typename: 'EvidenceItem', id: number, name: string, link: string }
                | { __typename: 'Factor', id: number, name: string, link: string }
                | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Feature', id: number, name: string, link: string }
                | { __typename: 'Flag', id: number, name: string, link: string }
                | { __typename: 'Fusion', id: number, name: string, link: string }
                | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Gene', id: number, name: string, link: string }
                | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'MolecularProfile', id: number, name: string, link: string }
                | { __typename: 'Region', id: number, name: string, link: string }
                | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Revision', id: number, name: string, link: string }
                | { __typename: 'Source', id: number, name: string, link: string }
                | { __typename: 'SourcePopover', id: number, name: string, link: string }
                | { __typename: 'Variant', id: number, name: string, link: string }
                | { __typename: 'VariantGroup', id: number, name: string, link: string }
               }
            | { __typename: 'EvidenceItem', id: number, name: string, link: string }
            | { __typename: 'ExonCoordinate', id: number, name: string, link: string }
            | { __typename: 'Factor', id: number, name: string, link: string }
            | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Feature', id: number, name: string, link: string }
            | { __typename: 'Flag', id: number, name: string, link: string }
            | { __typename: 'Fusion', id: number, name: string, link: string }
            | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Gene', id: number, name: string, link: string }
            | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'MolecularProfile', id: number, name: string, link: string }
            | { __typename: 'Region', id: number, name: string, link: string }
            | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Revision', id: number, name: string, link: string }
            | { __typename: 'RevisionSet', id: number, name: string, link: string }
            | { __typename: 'Source', id: number, name: string, link: string }
            | { __typename: 'SourcePopover', id: number, name: string, link: string }
            | { __typename: 'SourceSuggestion', id: number, name: string, link: string }
            | { __typename: 'Variant', id: number, name: string, link: string }
            | { __typename: 'VariantCoordinate', id: number, name: string, link: string }
            | { __typename: 'VariantGroup', id: number, name: string, link: string }
           }
        | { __typename: 'DeprecateFeatureActivity', id: number, verbiage: string, createdAt: any, organization?: { __typename: 'Organization', id: number, name: string } | undefined, user: { __typename: 'User', id: number, displayName: string, role: Types.UserRole }, subject:
            | { __typename: 'Assertion', id: number, name: string, link: string }
            | { __typename: 'Comment', deleted: boolean, deletedAt?: any | undefined, id: number, name: string, link: string, commentable:
                | { __typename: 'Assertion', id: number, name: string, link: string }
                | { __typename: 'EvidenceItem', id: number, name: string, link: string }
                | { __typename: 'Factor', id: number, name: string, link: string }
                | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Feature', id: number, name: string, link: string }
                | { __typename: 'Flag', id: number, name: string, link: string }
                | { __typename: 'Fusion', id: number, name: string, link: string }
                | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Gene', id: number, name: string, link: string }
                | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'MolecularProfile', id: number, name: string, link: string }
                | { __typename: 'Region', id: number, name: string, link: string }
                | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Revision', id: number, name: string, link: string }
                | { __typename: 'Source', id: number, name: string, link: string }
                | { __typename: 'SourcePopover', id: number, name: string, link: string }
                | { __typename: 'Variant', id: number, name: string, link: string }
                | { __typename: 'VariantGroup', id: number, name: string, link: string }
               }
            | { __typename: 'EvidenceItem', id: number, name: string, link: string }
            | { __typename: 'ExonCoordinate', id: number, name: string, link: string }
            | { __typename: 'Factor', id: number, name: string, link: string }
            | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Feature', id: number, name: string, link: string }
            | { __typename: 'Flag', id: number, name: string, link: string }
            | { __typename: 'Fusion', id: number, name: string, link: string }
            | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Gene', id: number, name: string, link: string }
            | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'MolecularProfile', id: number, name: string, link: string }
            | { __typename: 'Region', id: number, name: string, link: string }
            | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Revision', id: number, name: string, link: string }
            | { __typename: 'RevisionSet', id: number, name: string, link: string }
            | { __typename: 'Source', id: number, name: string, link: string }
            | { __typename: 'SourcePopover', id: number, name: string, link: string }
            | { __typename: 'SourceSuggestion', id: number, name: string, link: string }
            | { __typename: 'Variant', id: number, name: string, link: string }
            | { __typename: 'VariantCoordinate', id: number, name: string, link: string }
            | { __typename: 'VariantGroup', id: number, name: string, link: string }
           }
        | { __typename: 'DeprecateVariantActivity', id: number, verbiage: string, createdAt: any, organization?: { __typename: 'Organization', id: number, name: string } | undefined, user: { __typename: 'User', id: number, displayName: string, role: Types.UserRole }, subject:
            | { __typename: 'Assertion', id: number, name: string, link: string }
            | { __typename: 'Comment', deleted: boolean, deletedAt?: any | undefined, id: number, name: string, link: string, commentable:
                | { __typename: 'Assertion', id: number, name: string, link: string }
                | { __typename: 'EvidenceItem', id: number, name: string, link: string }
                | { __typename: 'Factor', id: number, name: string, link: string }
                | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Feature', id: number, name: string, link: string }
                | { __typename: 'Flag', id: number, name: string, link: string }
                | { __typename: 'Fusion', id: number, name: string, link: string }
                | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Gene', id: number, name: string, link: string }
                | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'MolecularProfile', id: number, name: string, link: string }
                | { __typename: 'Region', id: number, name: string, link: string }
                | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Revision', id: number, name: string, link: string }
                | { __typename: 'Source', id: number, name: string, link: string }
                | { __typename: 'SourcePopover', id: number, name: string, link: string }
                | { __typename: 'Variant', id: number, name: string, link: string }
                | { __typename: 'VariantGroup', id: number, name: string, link: string }
               }
            | { __typename: 'EvidenceItem', id: number, name: string, link: string }
            | { __typename: 'ExonCoordinate', id: number, name: string, link: string }
            | { __typename: 'Factor', id: number, name: string, link: string }
            | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Feature', id: number, name: string, link: string }
            | { __typename: 'Flag', id: number, name: string, link: string }
            | { __typename: 'Fusion', id: number, name: string, link: string }
            | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Gene', id: number, name: string, link: string }
            | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'MolecularProfile', id: number, name: string, link: string }
            | { __typename: 'Region', id: number, name: string, link: string }
            | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Revision', id: number, name: string, link: string }
            | { __typename: 'RevisionSet', id: number, name: string, link: string }
            | { __typename: 'Source', id: number, name: string, link: string }
            | { __typename: 'SourcePopover', id: number, name: string, link: string }
            | { __typename: 'SourceSuggestion', id: number, name: string, link: string }
            | { __typename: 'Variant', id: number, name: string, link: string }
            | { __typename: 'VariantCoordinate', id: number, name: string, link: string }
            | { __typename: 'VariantGroup', id: number, name: string, link: string }
           }
        | { __typename: 'FlagEntityActivity', id: number, verbiage: string, createdAt: any, organization?: { __typename: 'Organization', id: number, name: string } | undefined, user: { __typename: 'User', id: number, displayName: string, role: Types.UserRole }, subject:
            | { __typename: 'Assertion', id: number, name: string, link: string }
            | { __typename: 'Comment', deleted: boolean, deletedAt?: any | undefined, id: number, name: string, link: string, commentable:
                | { __typename: 'Assertion', id: number, name: string, link: string }
                | { __typename: 'EvidenceItem', id: number, name: string, link: string }
                | { __typename: 'Factor', id: number, name: string, link: string }
                | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Feature', id: number, name: string, link: string }
                | { __typename: 'Flag', id: number, name: string, link: string }
                | { __typename: 'Fusion', id: number, name: string, link: string }
                | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Gene', id: number, name: string, link: string }
                | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'MolecularProfile', id: number, name: string, link: string }
                | { __typename: 'Region', id: number, name: string, link: string }
                | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Revision', id: number, name: string, link: string }
                | { __typename: 'Source', id: number, name: string, link: string }
                | { __typename: 'SourcePopover', id: number, name: string, link: string }
                | { __typename: 'Variant', id: number, name: string, link: string }
                | { __typename: 'VariantGroup', id: number, name: string, link: string }
               }
            | { __typename: 'EvidenceItem', id: number, name: string, link: string }
            | { __typename: 'ExonCoordinate', id: number, name: string, link: string }
            | { __typename: 'Factor', id: number, name: string, link: string }
            | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Feature', id: number, name: string, link: string }
            | { __typename: 'Flag', id: number, name: string, link: string }
            | { __typename: 'Fusion', id: number, name: string, link: string }
            | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Gene', id: number, name: string, link: string }
            | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'MolecularProfile', id: number, name: string, link: string }
            | { __typename: 'Region', id: number, name: string, link: string }
            | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Revision', id: number, name: string, link: string }
            | { __typename: 'RevisionSet', id: number, name: string, link: string }
            | { __typename: 'Source', id: number, name: string, link: string }
            | { __typename: 'SourcePopover', id: number, name: string, link: string }
            | { __typename: 'SourceSuggestion', id: number, name: string, link: string }
            | { __typename: 'Variant', id: number, name: string, link: string }
            | { __typename: 'VariantCoordinate', id: number, name: string, link: string }
            | { __typename: 'VariantGroup', id: number, name: string, link: string }
           }
        | { __typename: 'ModerateAssertionActivity', id: number, verbiage: string, createdAt: any, organization?: { __typename: 'Organization', id: number, name: string } | undefined, user: { __typename: 'User', id: number, displayName: string, role: Types.UserRole }, subject:
            | { __typename: 'Assertion', id: number, name: string, link: string }
            | { __typename: 'Comment', deleted: boolean, deletedAt?: any | undefined, id: number, name: string, link: string, commentable:
                | { __typename: 'Assertion', id: number, name: string, link: string }
                | { __typename: 'EvidenceItem', id: number, name: string, link: string }
                | { __typename: 'Factor', id: number, name: string, link: string }
                | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Feature', id: number, name: string, link: string }
                | { __typename: 'Flag', id: number, name: string, link: string }
                | { __typename: 'Fusion', id: number, name: string, link: string }
                | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Gene', id: number, name: string, link: string }
                | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'MolecularProfile', id: number, name: string, link: string }
                | { __typename: 'Region', id: number, name: string, link: string }
                | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Revision', id: number, name: string, link: string }
                | { __typename: 'Source', id: number, name: string, link: string }
                | { __typename: 'SourcePopover', id: number, name: string, link: string }
                | { __typename: 'Variant', id: number, name: string, link: string }
                | { __typename: 'VariantGroup', id: number, name: string, link: string }
               }
            | { __typename: 'EvidenceItem', id: number, name: string, link: string }
            | { __typename: 'ExonCoordinate', id: number, name: string, link: string }
            | { __typename: 'Factor', id: number, name: string, link: string }
            | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Feature', id: number, name: string, link: string }
            | { __typename: 'Flag', id: number, name: string, link: string }
            | { __typename: 'Fusion', id: number, name: string, link: string }
            | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Gene', id: number, name: string, link: string }
            | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'MolecularProfile', id: number, name: string, link: string }
            | { __typename: 'Region', id: number, name: string, link: string }
            | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Revision', id: number, name: string, link: string }
            | { __typename: 'RevisionSet', id: number, name: string, link: string }
            | { __typename: 'Source', id: number, name: string, link: string }
            | { __typename: 'SourcePopover', id: number, name: string, link: string }
            | { __typename: 'SourceSuggestion', id: number, name: string, link: string }
            | { __typename: 'Variant', id: number, name: string, link: string }
            | { __typename: 'VariantCoordinate', id: number, name: string, link: string }
            | { __typename: 'VariantGroup', id: number, name: string, link: string }
           }
        | { __typename: 'ModerateEvidenceItemActivity', id: number, verbiage: string, createdAt: any, organization?: { __typename: 'Organization', id: number, name: string } | undefined, user: { __typename: 'User', id: number, displayName: string, role: Types.UserRole }, subject:
            | { __typename: 'Assertion', id: number, name: string, link: string }
            | { __typename: 'Comment', deleted: boolean, deletedAt?: any | undefined, id: number, name: string, link: string, commentable:
                | { __typename: 'Assertion', id: number, name: string, link: string }
                | { __typename: 'EvidenceItem', id: number, name: string, link: string }
                | { __typename: 'Factor', id: number, name: string, link: string }
                | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Feature', id: number, name: string, link: string }
                | { __typename: 'Flag', id: number, name: string, link: string }
                | { __typename: 'Fusion', id: number, name: string, link: string }
                | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Gene', id: number, name: string, link: string }
                | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'MolecularProfile', id: number, name: string, link: string }
                | { __typename: 'Region', id: number, name: string, link: string }
                | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Revision', id: number, name: string, link: string }
                | { __typename: 'Source', id: number, name: string, link: string }
                | { __typename: 'SourcePopover', id: number, name: string, link: string }
                | { __typename: 'Variant', id: number, name: string, link: string }
                | { __typename: 'VariantGroup', id: number, name: string, link: string }
               }
            | { __typename: 'EvidenceItem', id: number, name: string, link: string }
            | { __typename: 'ExonCoordinate', id: number, name: string, link: string }
            | { __typename: 'Factor', id: number, name: string, link: string }
            | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Feature', id: number, name: string, link: string }
            | { __typename: 'Flag', id: number, name: string, link: string }
            | { __typename: 'Fusion', id: number, name: string, link: string }
            | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Gene', id: number, name: string, link: string }
            | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'MolecularProfile', id: number, name: string, link: string }
            | { __typename: 'Region', id: number, name: string, link: string }
            | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Revision', id: number, name: string, link: string }
            | { __typename: 'RevisionSet', id: number, name: string, link: string }
            | { __typename: 'Source', id: number, name: string, link: string }
            | { __typename: 'SourcePopover', id: number, name: string, link: string }
            | { __typename: 'SourceSuggestion', id: number, name: string, link: string }
            | { __typename: 'Variant', id: number, name: string, link: string }
            | { __typename: 'VariantCoordinate', id: number, name: string, link: string }
            | { __typename: 'VariantGroup', id: number, name: string, link: string }
           }
        | { __typename: 'RejectRevisionsActivity', id: number, verbiage: string, createdAt: any, organization?: { __typename: 'Organization', id: number, name: string } | undefined, user: { __typename: 'User', id: number, displayName: string, role: Types.UserRole }, subject:
            | { __typename: 'Assertion', id: number, name: string, link: string }
            | { __typename: 'Comment', deleted: boolean, deletedAt?: any | undefined, id: number, name: string, link: string, commentable:
                | { __typename: 'Assertion', id: number, name: string, link: string }
                | { __typename: 'EvidenceItem', id: number, name: string, link: string }
                | { __typename: 'Factor', id: number, name: string, link: string }
                | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Feature', id: number, name: string, link: string }
                | { __typename: 'Flag', id: number, name: string, link: string }
                | { __typename: 'Fusion', id: number, name: string, link: string }
                | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Gene', id: number, name: string, link: string }
                | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'MolecularProfile', id: number, name: string, link: string }
                | { __typename: 'Region', id: number, name: string, link: string }
                | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Revision', id: number, name: string, link: string }
                | { __typename: 'Source', id: number, name: string, link: string }
                | { __typename: 'SourcePopover', id: number, name: string, link: string }
                | { __typename: 'Variant', id: number, name: string, link: string }
                | { __typename: 'VariantGroup', id: number, name: string, link: string }
               }
            | { __typename: 'EvidenceItem', id: number, name: string, link: string }
            | { __typename: 'ExonCoordinate', id: number, name: string, link: string }
            | { __typename: 'Factor', id: number, name: string, link: string }
            | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Feature', id: number, name: string, link: string }
            | { __typename: 'Flag', id: number, name: string, link: string }
            | { __typename: 'Fusion', id: number, name: string, link: string }
            | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Gene', id: number, name: string, link: string }
            | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'MolecularProfile', id: number, name: string, link: string }
            | { __typename: 'Region', id: number, name: string, link: string }
            | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Revision', id: number, name: string, link: string }
            | { __typename: 'RevisionSet', id: number, name: string, link: string }
            | { __typename: 'Source', id: number, name: string, link: string }
            | { __typename: 'SourcePopover', id: number, name: string, link: string }
            | { __typename: 'SourceSuggestion', id: number, name: string, link: string }
            | { __typename: 'Variant', id: number, name: string, link: string }
            | { __typename: 'VariantCoordinate', id: number, name: string, link: string }
            | { __typename: 'VariantGroup', id: number, name: string, link: string }
           }
        | { __typename: 'ResolveFlagActivity', id: number, verbiage: string, createdAt: any, organization?: { __typename: 'Organization', id: number, name: string } | undefined, user: { __typename: 'User', id: number, displayName: string, role: Types.UserRole }, subject:
            | { __typename: 'Assertion', id: number, name: string, link: string }
            | { __typename: 'Comment', deleted: boolean, deletedAt?: any | undefined, id: number, name: string, link: string, commentable:
                | { __typename: 'Assertion', id: number, name: string, link: string }
                | { __typename: 'EvidenceItem', id: number, name: string, link: string }
                | { __typename: 'Factor', id: number, name: string, link: string }
                | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Feature', id: number, name: string, link: string }
                | { __typename: 'Flag', id: number, name: string, link: string }
                | { __typename: 'Fusion', id: number, name: string, link: string }
                | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Gene', id: number, name: string, link: string }
                | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'MolecularProfile', id: number, name: string, link: string }
                | { __typename: 'Region', id: number, name: string, link: string }
                | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Revision', id: number, name: string, link: string }
                | { __typename: 'Source', id: number, name: string, link: string }
                | { __typename: 'SourcePopover', id: number, name: string, link: string }
                | { __typename: 'Variant', id: number, name: string, link: string }
                | { __typename: 'VariantGroup', id: number, name: string, link: string }
               }
            | { __typename: 'EvidenceItem', id: number, name: string, link: string }
            | { __typename: 'ExonCoordinate', id: number, name: string, link: string }
            | { __typename: 'Factor', id: number, name: string, link: string }
            | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Feature', id: number, name: string, link: string }
            | { __typename: 'Flag', id: number, name: string, link: string }
            | { __typename: 'Fusion', id: number, name: string, link: string }
            | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Gene', id: number, name: string, link: string }
            | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'MolecularProfile', id: number, name: string, link: string }
            | { __typename: 'Region', id: number, name: string, link: string }
            | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Revision', id: number, name: string, link: string }
            | { __typename: 'RevisionSet', id: number, name: string, link: string }
            | { __typename: 'Source', id: number, name: string, link: string }
            | { __typename: 'SourcePopover', id: number, name: string, link: string }
            | { __typename: 'SourceSuggestion', id: number, name: string, link: string }
            | { __typename: 'Variant', id: number, name: string, link: string }
            | { __typename: 'VariantCoordinate', id: number, name: string, link: string }
            | { __typename: 'VariantGroup', id: number, name: string, link: string }
           }
        | { __typename: 'RevokeApprovalActivity', id: number, verbiage: string, createdAt: any, organization?: { __typename: 'Organization', id: number, name: string } | undefined, user: { __typename: 'User', id: number, displayName: string, role: Types.UserRole }, subject:
            | { __typename: 'Assertion', id: number, name: string, link: string }
            | { __typename: 'Comment', deleted: boolean, deletedAt?: any | undefined, id: number, name: string, link: string, commentable:
                | { __typename: 'Assertion', id: number, name: string, link: string }
                | { __typename: 'EvidenceItem', id: number, name: string, link: string }
                | { __typename: 'Factor', id: number, name: string, link: string }
                | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Feature', id: number, name: string, link: string }
                | { __typename: 'Flag', id: number, name: string, link: string }
                | { __typename: 'Fusion', id: number, name: string, link: string }
                | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Gene', id: number, name: string, link: string }
                | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'MolecularProfile', id: number, name: string, link: string }
                | { __typename: 'Region', id: number, name: string, link: string }
                | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Revision', id: number, name: string, link: string }
                | { __typename: 'Source', id: number, name: string, link: string }
                | { __typename: 'SourcePopover', id: number, name: string, link: string }
                | { __typename: 'Variant', id: number, name: string, link: string }
                | { __typename: 'VariantGroup', id: number, name: string, link: string }
               }
            | { __typename: 'EvidenceItem', id: number, name: string, link: string }
            | { __typename: 'ExonCoordinate', id: number, name: string, link: string }
            | { __typename: 'Factor', id: number, name: string, link: string }
            | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Feature', id: number, name: string, link: string }
            | { __typename: 'Flag', id: number, name: string, link: string }
            | { __typename: 'Fusion', id: number, name: string, link: string }
            | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Gene', id: number, name: string, link: string }
            | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'MolecularProfile', id: number, name: string, link: string }
            | { __typename: 'Region', id: number, name: string, link: string }
            | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Revision', id: number, name: string, link: string }
            | { __typename: 'RevisionSet', id: number, name: string, link: string }
            | { __typename: 'Source', id: number, name: string, link: string }
            | { __typename: 'SourcePopover', id: number, name: string, link: string }
            | { __typename: 'SourceSuggestion', id: number, name: string, link: string }
            | { __typename: 'Variant', id: number, name: string, link: string }
            | { __typename: 'VariantCoordinate', id: number, name: string, link: string }
            | { __typename: 'VariantGroup', id: number, name: string, link: string }
           }
        | { __typename: 'SubmitAssertionActivity', id: number, verbiage: string, createdAt: any, organization?: { __typename: 'Organization', id: number, name: string } | undefined, user: { __typename: 'User', id: number, displayName: string, role: Types.UserRole }, subject:
            | { __typename: 'Assertion', id: number, name: string, link: string }
            | { __typename: 'Comment', deleted: boolean, deletedAt?: any | undefined, id: number, name: string, link: string, commentable:
                | { __typename: 'Assertion', id: number, name: string, link: string }
                | { __typename: 'EvidenceItem', id: number, name: string, link: string }
                | { __typename: 'Factor', id: number, name: string, link: string }
                | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Feature', id: number, name: string, link: string }
                | { __typename: 'Flag', id: number, name: string, link: string }
                | { __typename: 'Fusion', id: number, name: string, link: string }
                | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Gene', id: number, name: string, link: string }
                | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'MolecularProfile', id: number, name: string, link: string }
                | { __typename: 'Region', id: number, name: string, link: string }
                | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Revision', id: number, name: string, link: string }
                | { __typename: 'Source', id: number, name: string, link: string }
                | { __typename: 'SourcePopover', id: number, name: string, link: string }
                | { __typename: 'Variant', id: number, name: string, link: string }
                | { __typename: 'VariantGroup', id: number, name: string, link: string }
               }
            | { __typename: 'EvidenceItem', id: number, name: string, link: string }
            | { __typename: 'ExonCoordinate', id: number, name: string, link: string }
            | { __typename: 'Factor', id: number, name: string, link: string }
            | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Feature', id: number, name: string, link: string }
            | { __typename: 'Flag', id: number, name: string, link: string }
            | { __typename: 'Fusion', id: number, name: string, link: string }
            | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Gene', id: number, name: string, link: string }
            | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'MolecularProfile', id: number, name: string, link: string }
            | { __typename: 'Region', id: number, name: string, link: string }
            | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Revision', id: number, name: string, link: string }
            | { __typename: 'RevisionSet', id: number, name: string, link: string }
            | { __typename: 'Source', id: number, name: string, link: string }
            | { __typename: 'SourcePopover', id: number, name: string, link: string }
            | { __typename: 'SourceSuggestion', id: number, name: string, link: string }
            | { __typename: 'Variant', id: number, name: string, link: string }
            | { __typename: 'VariantCoordinate', id: number, name: string, link: string }
            | { __typename: 'VariantGroup', id: number, name: string, link: string }
           }
        | { __typename: 'SubmitEvidenceItemActivity', id: number, verbiage: string, createdAt: any, organization?: { __typename: 'Organization', id: number, name: string } | undefined, user: { __typename: 'User', id: number, displayName: string, role: Types.UserRole }, subject:
            | { __typename: 'Assertion', id: number, name: string, link: string }
            | { __typename: 'Comment', deleted: boolean, deletedAt?: any | undefined, id: number, name: string, link: string, commentable:
                | { __typename: 'Assertion', id: number, name: string, link: string }
                | { __typename: 'EvidenceItem', id: number, name: string, link: string }
                | { __typename: 'Factor', id: number, name: string, link: string }
                | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Feature', id: number, name: string, link: string }
                | { __typename: 'Flag', id: number, name: string, link: string }
                | { __typename: 'Fusion', id: number, name: string, link: string }
                | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Gene', id: number, name: string, link: string }
                | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'MolecularProfile', id: number, name: string, link: string }
                | { __typename: 'Region', id: number, name: string, link: string }
                | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Revision', id: number, name: string, link: string }
                | { __typename: 'Source', id: number, name: string, link: string }
                | { __typename: 'SourcePopover', id: number, name: string, link: string }
                | { __typename: 'Variant', id: number, name: string, link: string }
                | { __typename: 'VariantGroup', id: number, name: string, link: string }
               }
            | { __typename: 'EvidenceItem', id: number, name: string, link: string }
            | { __typename: 'ExonCoordinate', id: number, name: string, link: string }
            | { __typename: 'Factor', id: number, name: string, link: string }
            | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Feature', id: number, name: string, link: string }
            | { __typename: 'Flag', id: number, name: string, link: string }
            | { __typename: 'Fusion', id: number, name: string, link: string }
            | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Gene', id: number, name: string, link: string }
            | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'MolecularProfile', id: number, name: string, link: string }
            | { __typename: 'Region', id: number, name: string, link: string }
            | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Revision', id: number, name: string, link: string }
            | { __typename: 'RevisionSet', id: number, name: string, link: string }
            | { __typename: 'Source', id: number, name: string, link: string }
            | { __typename: 'SourcePopover', id: number, name: string, link: string }
            | { __typename: 'SourceSuggestion', id: number, name: string, link: string }
            | { __typename: 'Variant', id: number, name: string, link: string }
            | { __typename: 'VariantCoordinate', id: number, name: string, link: string }
            | { __typename: 'VariantGroup', id: number, name: string, link: string }
           }
        | { __typename: 'SuggestRevisionSetActivity', id: number, verbiage: string, createdAt: any, organization?: { __typename: 'Organization', id: number, name: string } | undefined, user: { __typename: 'User', id: number, displayName: string, role: Types.UserRole }, subject:
            | { __typename: 'Assertion', id: number, name: string, link: string }
            | { __typename: 'Comment', deleted: boolean, deletedAt?: any | undefined, id: number, name: string, link: string, commentable:
                | { __typename: 'Assertion', id: number, name: string, link: string }
                | { __typename: 'EvidenceItem', id: number, name: string, link: string }
                | { __typename: 'Factor', id: number, name: string, link: string }
                | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Feature', id: number, name: string, link: string }
                | { __typename: 'Flag', id: number, name: string, link: string }
                | { __typename: 'Fusion', id: number, name: string, link: string }
                | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Gene', id: number, name: string, link: string }
                | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'MolecularProfile', id: number, name: string, link: string }
                | { __typename: 'Region', id: number, name: string, link: string }
                | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Revision', id: number, name: string, link: string }
                | { __typename: 'Source', id: number, name: string, link: string }
                | { __typename: 'SourcePopover', id: number, name: string, link: string }
                | { __typename: 'Variant', id: number, name: string, link: string }
                | { __typename: 'VariantGroup', id: number, name: string, link: string }
               }
            | { __typename: 'EvidenceItem', id: number, name: string, link: string }
            | { __typename: 'ExonCoordinate', id: number, name: string, link: string }
            | { __typename: 'Factor', id: number, name: string, link: string }
            | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Feature', id: number, name: string, link: string }
            | { __typename: 'Flag', id: number, name: string, link: string }
            | { __typename: 'Fusion', id: number, name: string, link: string }
            | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Gene', id: number, name: string, link: string }
            | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'MolecularProfile', id: number, name: string, link: string }
            | { __typename: 'Region', id: number, name: string, link: string }
            | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Revision', id: number, name: string, link: string }
            | { __typename: 'RevisionSet', id: number, name: string, link: string }
            | { __typename: 'Source', id: number, name: string, link: string }
            | { __typename: 'SourcePopover', id: number, name: string, link: string }
            | { __typename: 'SourceSuggestion', id: number, name: string, link: string }
            | { __typename: 'Variant', id: number, name: string, link: string }
            | { __typename: 'VariantCoordinate', id: number, name: string, link: string }
            | { __typename: 'VariantGroup', id: number, name: string, link: string }
           }
        | { __typename: 'SuggestSourceActivity', id: number, verbiage: string, createdAt: any, organization?: { __typename: 'Organization', id: number, name: string } | undefined, user: { __typename: 'User', id: number, displayName: string, role: Types.UserRole }, subject:
            | { __typename: 'Assertion', id: number, name: string, link: string }
            | { __typename: 'Comment', deleted: boolean, deletedAt?: any | undefined, id: number, name: string, link: string, commentable:
                | { __typename: 'Assertion', id: number, name: string, link: string }
                | { __typename: 'EvidenceItem', id: number, name: string, link: string }
                | { __typename: 'Factor', id: number, name: string, link: string }
                | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Feature', id: number, name: string, link: string }
                | { __typename: 'Flag', id: number, name: string, link: string }
                | { __typename: 'Fusion', id: number, name: string, link: string }
                | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Gene', id: number, name: string, link: string }
                | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'MolecularProfile', id: number, name: string, link: string }
                | { __typename: 'Region', id: number, name: string, link: string }
                | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Revision', id: number, name: string, link: string }
                | { __typename: 'Source', id: number, name: string, link: string }
                | { __typename: 'SourcePopover', id: number, name: string, link: string }
                | { __typename: 'Variant', id: number, name: string, link: string }
                | { __typename: 'VariantGroup', id: number, name: string, link: string }
               }
            | { __typename: 'EvidenceItem', id: number, name: string, link: string }
            | { __typename: 'ExonCoordinate', id: number, name: string, link: string }
            | { __typename: 'Factor', id: number, name: string, link: string }
            | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Feature', id: number, name: string, link: string }
            | { __typename: 'Flag', id: number, name: string, link: string }
            | { __typename: 'Fusion', id: number, name: string, link: string }
            | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Gene', id: number, name: string, link: string }
            | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'MolecularProfile', id: number, name: string, link: string }
            | { __typename: 'Region', id: number, name: string, link: string }
            | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Revision', id: number, name: string, link: string }
            | { __typename: 'RevisionSet', id: number, name: string, link: string }
            | { __typename: 'Source', id: number, name: string, link: string }
            | { __typename: 'SourcePopover', id: number, name: string, link: string }
            | { __typename: 'SourceSuggestion', id: number, name: string, link: string }
            | { __typename: 'Variant', id: number, name: string, link: string }
            | { __typename: 'VariantCoordinate', id: number, name: string, link: string }
            | { __typename: 'VariantGroup', id: number, name: string, link: string }
           }
        | { __typename: 'UpdateSourceSuggestionStatusActivity', id: number, verbiage: string, createdAt: any, organization?: { __typename: 'Organization', id: number, name: string } | undefined, user: { __typename: 'User', id: number, displayName: string, role: Types.UserRole }, subject:
            | { __typename: 'Assertion', id: number, name: string, link: string }
            | { __typename: 'Comment', deleted: boolean, deletedAt?: any | undefined, id: number, name: string, link: string, commentable:
                | { __typename: 'Assertion', id: number, name: string, link: string }
                | { __typename: 'EvidenceItem', id: number, name: string, link: string }
                | { __typename: 'Factor', id: number, name: string, link: string }
                | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Feature', id: number, name: string, link: string }
                | { __typename: 'Flag', id: number, name: string, link: string }
                | { __typename: 'Fusion', id: number, name: string, link: string }
                | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Gene', id: number, name: string, link: string }
                | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'MolecularProfile', id: number, name: string, link: string }
                | { __typename: 'Region', id: number, name: string, link: string }
                | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
                | { __typename: 'Revision', id: number, name: string, link: string }
                | { __typename: 'Source', id: number, name: string, link: string }
                | { __typename: 'SourcePopover', id: number, name: string, link: string }
                | { __typename: 'Variant', id: number, name: string, link: string }
                | { __typename: 'VariantGroup', id: number, name: string, link: string }
               }
            | { __typename: 'EvidenceItem', id: number, name: string, link: string }
            | { __typename: 'ExonCoordinate', id: number, name: string, link: string }
            | { __typename: 'Factor', id: number, name: string, link: string }
            | { __typename: 'FactorVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Feature', id: number, name: string, link: string }
            | { __typename: 'Flag', id: number, name: string, link: string }
            | { __typename: 'Fusion', id: number, name: string, link: string }
            | { __typename: 'FusionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Gene', id: number, name: string, link: string }
            | { __typename: 'GeneVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'MolecularProfile', id: number, name: string, link: string }
            | { __typename: 'Region', id: number, name: string, link: string }
            | { __typename: 'RegionVariant', id: number, name: string, link: string, feature: { __typename: 'Feature', id: number, name: string, link: string } }
            | { __typename: 'Revision', id: number, name: string, link: string }
            | { __typename: 'RevisionSet', id: number, name: string, link: string }
            | { __typename: 'Source', id: number, name: string, link: string }
            | { __typename: 'SourcePopover', id: number, name: string, link: string }
            | { __typename: 'SourceSuggestion', id: number, name: string, link: string }
            | { __typename: 'Variant', id: number, name: string, link: string }
            | { __typename: 'VariantCoordinate', id: number, name: string, link: string }
            | { __typename: 'VariantGroup', id: number, name: string, link: string }
           }
       | undefined }> } };

export const ActivityStreamDocument = gql`
    query ActivityStream($subject: [SubscribableQueryInput!], $first: Int, $last: Int, $before: String, $after: String, $organizationId: [Int!], $includeSubgroups: Boolean!, $userId: [Int!], $activityType: [ActivityTypeInput!], $subjectType: [ActivitySubjectInput!], $linkedApprovalId: Int, $includeAutomatedEvents: Boolean, $mode: EventFeedMode, $showFilters: Boolean!, $occurredAfter: ISO8601DateTime, $occurredBefore: ISO8601DateTime, $sortBy: DateSort) {
  activities(
    subject: $subject
    first: $first
    last: $last
    before: $before
    after: $after
    userId: $userId
    linkedApprovalId: $linkedApprovalId
    includeAutomatedEvents: $includeAutomatedEvents
    organization: {ids: $organizationId, includeSubgroups: $includeSubgroups}
    activityType: $activityType
    subjectType: $subjectType
    mode: $mode
    occurredAfter: $occurredAfter
    occurredBefore: $occurredBefore
    sortBy: $sortBy
  ) {
    activityTypes @include(if: $showFilters)
    uniqueParticipants @include(if: $showFilters) {
      id
      displayName
      role
    }
    subjectTypes @include(if: $showFilters)
    participatingOrganizations @include(if: $showFilters) {
      id
      name
    }
    pageInfo {
      startCursor
      endCursor
      hasNextPage
      hasPreviousPage
    }
    pageCount
    totalCount
    unfilteredCount
    edges {
      cursor
      node {
        ...ActivityFeedItemBase
      }
    }
  }
}
    ${ActivityFeedItemBaseFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class ActivityStreamGQL extends Apollo.Query<ActivityStreamQuery, ActivityStreamQueryVariables> {
    document = ActivityStreamDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
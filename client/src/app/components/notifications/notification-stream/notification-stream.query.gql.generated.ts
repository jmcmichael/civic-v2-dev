/* eslint-disable */
import * as Types from '../../../generated/civic.apollo.types';

import { gql } from 'apollo-angular';
import { EventTimelineNodeFragmentDoc } from '../../events/event-timeline/event-timeline.fragments.gql.generated';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type NotificationStreamQueryVariables = Types.Exact<{
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  notificationReason?: Types.InputMaybe<Types.NotificationReason>;
  subscriptionId?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  originatingObject?: Types.InputMaybe<Types.SubscribableInput>;
  eventType?: Types.InputMaybe<Types.EventAction>;
  originatingUserId?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  organizationId?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  includeRead?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
}>;


export type NotificationStreamQuery = { __typename: 'Query', notifications: { __typename: 'NotificationConnection', totalCount: number, unreadCount: number, eventTypes: Array<Types.EventAction>, pageInfo: { __typename: 'PageInfo', startCursor?: string | undefined, endCursor?: string | undefined, hasNextPage: boolean, hasPreviousPage: boolean }, notificationSubjects: Array<{ __typename: 'EventSubjectWithCount', occuranceCount: number, subject?:
        | { __typename: 'Assertion', id: number, name: string }
        | { __typename: 'Comment', id: number, name: string }
        | { __typename: 'EvidenceItem', id: number, name: string }
        | { __typename: 'ExonCoordinate', id: number, name: string }
        | { __typename: 'Factor', id: number, name: string }
        | { __typename: 'FactorVariant', id: number, name: string }
        | { __typename: 'Feature', id: number, name: string }
        | { __typename: 'Flag', id: number, name: string }
        | { __typename: 'Fusion', id: number, name: string }
        | { __typename: 'FusionVariant', id: number, name: string }
        | { __typename: 'Gene', id: number, name: string }
        | { __typename: 'GeneVariant', id: number, name: string }
        | { __typename: 'MolecularProfile', id: number, name: string }
        | { __typename: 'Region', id: number, name: string }
        | { __typename: 'RegionVariant', id: number, name: string }
        | { __typename: 'Revision', id: number, name: string }
        | { __typename: 'RevisionSet', id: number, name: string }
        | { __typename: 'Source', id: number, name: string }
        | { __typename: 'SourcePopover', id: number, name: string }
        | { __typename: 'SourceSuggestion', id: number, name: string }
        | { __typename: 'Variant', id: number, name: string }
        | { __typename: 'VariantCoordinate', id: number, name: string }
        | { __typename: 'VariantGroup', id: number, name: string }
       | undefined }>, originatingUsers: Array<{ __typename: 'User', id: number, displayName: string }>, organizations: Array<{ __typename: 'Organization', id: number, name: string }>, edges: Array<{ __typename: 'NotificationEdge', cursor: string, node?: { __typename: 'Notification', id: number, type: Types.NotificationReason, seen: boolean, event: { __typename: 'Event', id: number, action: Types.EventAction, createdAt: any, organization?: { __typename: 'Organization', id: number, name: string } | undefined, originatingUser: { __typename: 'User', id: number, username: string, displayName: string, role: Types.UserRole }, subject?:
            | { __typename: 'Assertion', status: Types.EvidenceStatus, flagged: boolean, name: string, id: number, link: string }
            | { __typename: 'Comment', name: string, id: number, link: string }
            | { __typename: 'EvidenceItem', status: Types.EvidenceStatus, flagged: boolean, name: string, id: number, link: string }
            | { __typename: 'ExonCoordinate', name: string, id: number, link: string }
            | { __typename: 'Factor', name: string, id: number, link: string }
            | { __typename: 'FactorVariant', deprecated: boolean, flagged: boolean, name: string, id: number, link: string, feature: { __typename: 'Feature', id: number, link: string, name: string, deprecated: boolean, flagged: boolean } }
            | { __typename: 'Feature', deprecated: boolean, flagged: boolean, id: number, link: string, name: string }
            | { __typename: 'Flag', name: string, id: number, link: string }
            | { __typename: 'Fusion', name: string, id: number, link: string }
            | { __typename: 'FusionVariant', deprecated: boolean, flagged: boolean, name: string, id: number, link: string, feature: { __typename: 'Feature', id: number, link: string, name: string, deprecated: boolean, flagged: boolean } }
            | { __typename: 'Gene', name: string, id: number, link: string }
            | { __typename: 'GeneVariant', deprecated: boolean, flagged: boolean, name: string, id: number, link: string, feature: { __typename: 'Feature', id: number, link: string, name: string, deprecated: boolean, flagged: boolean } }
            | { __typename: 'MolecularProfile', deprecated: boolean, flagged: boolean, name: string, id: number, link: string }
            | { __typename: 'Region', name: string, id: number, link: string }
            | { __typename: 'RegionVariant', deprecated: boolean, flagged: boolean, name: string, id: number, link: string, feature: { __typename: 'Feature', id: number, link: string, name: string, deprecated: boolean, flagged: boolean } }
            | { __typename: 'Revision', revisionSetId: number, name: string, id: number, link: string }
            | { __typename: 'RevisionSet', name: string, id: number, link: string }
            | { __typename: 'Source', citation?: string | undefined, sourceType: Types.SourceSource, deprecated: boolean, name: string, id: number, link: string }
            | { __typename: 'SourcePopover', name: string, id: number, link: string }
            | { __typename: 'SourceSuggestion', name: string, id: number, link: string }
            | { __typename: 'Variant', deprecated: boolean, flagged: boolean, name: string, id: number, link: string, feature: { __typename: 'Feature', id: number, link: string, name: string, deprecated: boolean, flagged: boolean } }
            | { __typename: 'VariantCoordinate', name: string, id: number, link: string }
            | { __typename: 'VariantGroup', flagged: boolean, name: string, id: number, link: string }
           | undefined, originatingObject?:
            | { __typename: 'Assertion', id: number, name: string, link: string }
            | { __typename: 'Comment', id: number, name: string, link: string }
            | { __typename: 'EvidenceItem', id: number, name: string, link: string }
            | { __typename: 'Factor', id: number, name: string, link: string }
            | { __typename: 'FactorVariant', id: number, name: string, link: string }
            | { __typename: 'Feature', id: number, name: string, link: string }
            | { __typename: 'Flag', id: number, name: string, link: string }
            | { __typename: 'Fusion', id: number, name: string, link: string }
            | { __typename: 'FusionVariant', id: number, name: string, link: string }
            | { __typename: 'Gene', id: number, name: string, link: string }
            | { __typename: 'GeneVariant', id: number, name: string, link: string }
            | { __typename: 'MolecularProfile', id: number, name: string, link: string }
            | { __typename: 'Region', id: number, name: string, link: string }
            | { __typename: 'RegionVariant', id: number, name: string, link: string }
            | { __typename: 'Revision', id: number, revisionSetId: number, name: string, link: string }
            | { __typename: 'SourceSuggestion', id: number, name: string, link: string }
            | { __typename: 'Variant', id: number, name: string, link: string }
           | undefined }, subscription?: { __typename: 'Subscription', id: number, subscribable:
            | { __typename: 'Assertion', id: number, name: string }
            | { __typename: 'Comment', id: number, name: string }
            | { __typename: 'EvidenceItem', id: number, name: string }
            | { __typename: 'ExonCoordinate', id: number, name: string }
            | { __typename: 'Factor', id: number, name: string }
            | { __typename: 'FactorVariant', id: number, name: string }
            | { __typename: 'Feature', id: number, name: string }
            | { __typename: 'Flag', id: number, name: string }
            | { __typename: 'Fusion', id: number, name: string }
            | { __typename: 'FusionVariant', id: number, name: string }
            | { __typename: 'Gene', id: number, name: string }
            | { __typename: 'GeneVariant', id: number, name: string }
            | { __typename: 'MolecularProfile', id: number, name: string }
            | { __typename: 'Region', id: number, name: string }
            | { __typename: 'RegionVariant', id: number, name: string }
            | { __typename: 'Revision', id: number, name: string }
            | { __typename: 'RevisionSet', id: number, name: string }
            | { __typename: 'Source', id: number, name: string }
            | { __typename: 'SourcePopover', id: number, name: string }
            | { __typename: 'SourceSuggestion', id: number, name: string }
            | { __typename: 'Variant', id: number, name: string }
            | { __typename: 'VariantCoordinate', id: number, name: string }
            | { __typename: 'VariantGroup', id: number, name: string }
           } | undefined } | undefined }> } };

export type NotificationStreamItemFragment = { __typename: 'Notification', id: number, type: Types.NotificationReason, seen: boolean, event: { __typename: 'Event', id: number, action: Types.EventAction, createdAt: any, organization?: { __typename: 'Organization', id: number, name: string } | undefined, originatingUser: { __typename: 'User', id: number, username: string, displayName: string, role: Types.UserRole }, subject?:
      | { __typename: 'Assertion', status: Types.EvidenceStatus, flagged: boolean, name: string, id: number, link: string }
      | { __typename: 'Comment', name: string, id: number, link: string }
      | { __typename: 'EvidenceItem', status: Types.EvidenceStatus, flagged: boolean, name: string, id: number, link: string }
      | { __typename: 'ExonCoordinate', name: string, id: number, link: string }
      | { __typename: 'Factor', name: string, id: number, link: string }
      | { __typename: 'FactorVariant', deprecated: boolean, flagged: boolean, name: string, id: number, link: string, feature: { __typename: 'Feature', id: number, link: string, name: string, deprecated: boolean, flagged: boolean } }
      | { __typename: 'Feature', deprecated: boolean, flagged: boolean, id: number, link: string, name: string }
      | { __typename: 'Flag', name: string, id: number, link: string }
      | { __typename: 'Fusion', name: string, id: number, link: string }
      | { __typename: 'FusionVariant', deprecated: boolean, flagged: boolean, name: string, id: number, link: string, feature: { __typename: 'Feature', id: number, link: string, name: string, deprecated: boolean, flagged: boolean } }
      | { __typename: 'Gene', name: string, id: number, link: string }
      | { __typename: 'GeneVariant', deprecated: boolean, flagged: boolean, name: string, id: number, link: string, feature: { __typename: 'Feature', id: number, link: string, name: string, deprecated: boolean, flagged: boolean } }
      | { __typename: 'MolecularProfile', deprecated: boolean, flagged: boolean, name: string, id: number, link: string }
      | { __typename: 'Region', name: string, id: number, link: string }
      | { __typename: 'RegionVariant', deprecated: boolean, flagged: boolean, name: string, id: number, link: string, feature: { __typename: 'Feature', id: number, link: string, name: string, deprecated: boolean, flagged: boolean } }
      | { __typename: 'Revision', revisionSetId: number, name: string, id: number, link: string }
      | { __typename: 'RevisionSet', name: string, id: number, link: string }
      | { __typename: 'Source', citation?: string | undefined, sourceType: Types.SourceSource, deprecated: boolean, name: string, id: number, link: string }
      | { __typename: 'SourcePopover', name: string, id: number, link: string }
      | { __typename: 'SourceSuggestion', name: string, id: number, link: string }
      | { __typename: 'Variant', deprecated: boolean, flagged: boolean, name: string, id: number, link: string, feature: { __typename: 'Feature', id: number, link: string, name: string, deprecated: boolean, flagged: boolean } }
      | { __typename: 'VariantCoordinate', name: string, id: number, link: string }
      | { __typename: 'VariantGroup', flagged: boolean, name: string, id: number, link: string }
     | undefined, originatingObject?:
      | { __typename: 'Assertion', id: number, name: string, link: string }
      | { __typename: 'Comment', id: number, name: string, link: string }
      | { __typename: 'EvidenceItem', id: number, name: string, link: string }
      | { __typename: 'Factor', id: number, name: string, link: string }
      | { __typename: 'FactorVariant', id: number, name: string, link: string }
      | { __typename: 'Feature', id: number, name: string, link: string }
      | { __typename: 'Flag', id: number, name: string, link: string }
      | { __typename: 'Fusion', id: number, name: string, link: string }
      | { __typename: 'FusionVariant', id: number, name: string, link: string }
      | { __typename: 'Gene', id: number, name: string, link: string }
      | { __typename: 'GeneVariant', id: number, name: string, link: string }
      | { __typename: 'MolecularProfile', id: number, name: string, link: string }
      | { __typename: 'Region', id: number, name: string, link: string }
      | { __typename: 'RegionVariant', id: number, name: string, link: string }
      | { __typename: 'Revision', id: number, revisionSetId: number, name: string, link: string }
      | { __typename: 'SourceSuggestion', id: number, name: string, link: string }
      | { __typename: 'Variant', id: number, name: string, link: string }
     | undefined }, subscription?: { __typename: 'Subscription', id: number, subscribable:
      | { __typename: 'Assertion', id: number, name: string }
      | { __typename: 'Comment', id: number, name: string }
      | { __typename: 'EvidenceItem', id: number, name: string }
      | { __typename: 'ExonCoordinate', id: number, name: string }
      | { __typename: 'Factor', id: number, name: string }
      | { __typename: 'FactorVariant', id: number, name: string }
      | { __typename: 'Feature', id: number, name: string }
      | { __typename: 'Flag', id: number, name: string }
      | { __typename: 'Fusion', id: number, name: string }
      | { __typename: 'FusionVariant', id: number, name: string }
      | { __typename: 'Gene', id: number, name: string }
      | { __typename: 'GeneVariant', id: number, name: string }
      | { __typename: 'MolecularProfile', id: number, name: string }
      | { __typename: 'Region', id: number, name: string }
      | { __typename: 'RegionVariant', id: number, name: string }
      | { __typename: 'Revision', id: number, name: string }
      | { __typename: 'RevisionSet', id: number, name: string }
      | { __typename: 'Source', id: number, name: string }
      | { __typename: 'SourcePopover', id: number, name: string }
      | { __typename: 'SourceSuggestion', id: number, name: string }
      | { __typename: 'Variant', id: number, name: string }
      | { __typename: 'VariantCoordinate', id: number, name: string }
      | { __typename: 'VariantGroup', id: number, name: string }
     } | undefined };

export const NotificationStreamItemFragmentDoc = gql`
    fragment notificationStreamItem on Notification {
  id
  type
  seen
  event {
    ...eventTimelineNode
  }
  subscription {
    id
    subscribable {
      id
      name
      __typename
    }
  }
}
    ${EventTimelineNodeFragmentDoc}`;
export const NotificationStreamDocument = gql`
    query NotificationStream($first: Int, $last: Int, $before: String, $after: String, $notificationReason: NotificationReason, $subscriptionId: Int, $originatingObject: SubscribableInput, $eventType: EventAction, $originatingUserId: Int, $organizationId: Int, $includeRead: Boolean) {
  notifications(
    first: $first
    last: $last
    before: $before
    after: $after
    notificationReason: $notificationReason
    subscriptionId: $subscriptionId
    originatingObject: $originatingObject
    eventType: $eventType
    originatingUserId: $originatingUserId
    organizationId: $organizationId
    includeRead: $includeRead
  ) {
    totalCount
    unreadCount
    pageInfo {
      startCursor
      endCursor
      hasNextPage
      hasPreviousPage
    }
    notificationSubjects {
      subject {
        id
        __typename
        name
      }
      occuranceCount
    }
    originatingUsers {
      id
      displayName
    }
    organizations {
      id
      name
    }
    eventTypes
    edges {
      cursor
      node {
        ...notificationStreamItem
      }
    }
  }
}
    ${NotificationStreamItemFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class NotificationStreamGQL extends Apollo.Query<NotificationStreamQuery, NotificationStreamQueryVariables> {
    document = NotificationStreamDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
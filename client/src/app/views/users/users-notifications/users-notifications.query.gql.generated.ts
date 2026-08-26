/* eslint-disable */
import * as Types from '../../../generated/civic.apollo.types';

import { gql } from 'apollo-angular';
import { EventTimelineNodeFragmentDoc } from '../../../components/events/event-timeline/event-timeline.fragments.gql.generated';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type UserNotificationsQueryVariables = Types.Exact<{
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


export type UserNotificationsQuery = { __typename: 'Query', notifications: { __typename: 'NotificationConnection', eventTypes: Array<Types.EventAction>, pageInfo: { __typename: 'PageInfo', startCursor?: string | undefined, endCursor?: string | undefined, hasNextPage: boolean, hasPreviousPage: boolean }, notificationSubjects: Array<{ __typename: 'EventSubjectWithCount', occuranceCount: number, subject?:
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
       | undefined }>, originatingUsers: Array<{ __typename: 'User', id: number, displayName: string }>, organizations: Array<{ __typename: 'Organization', id: number, name: string }>, edges: Array<{ __typename: 'NotificationEdge', node?: { __typename: 'Notification', id: number, type: Types.NotificationReason, seen: boolean, event: { __typename: 'Event', id: number, action: Types.EventAction, createdAt: any, organization?: { __typename: 'Organization', id: number, name: string } | undefined, originatingUser: { __typename: 'User', id: number, username: string, displayName: string, role: Types.UserRole }, subject?:
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

export type NotificationOrganizationFragment = { __typename: 'Organization', id: number, name: string };

export type NotificationOriginatingUsersFragment = { __typename: 'User', id: number, displayName: string };

export type NotificationFeedSubjectsFragment = { __typename: 'EventSubjectWithCount', occuranceCount: number, subject?:
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
   | undefined };

export type NotificationNodeFragment = { __typename: 'Notification', id: number, type: Types.NotificationReason, seen: boolean, event: { __typename: 'Event', id: number, action: Types.EventAction, createdAt: any, organization?: { __typename: 'Organization', id: number, name: string } | undefined, originatingUser: { __typename: 'User', id: number, username: string, displayName: string, role: Types.UserRole }, subject?:
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

export const NotificationOrganizationFragmentDoc = gql`
    fragment notificationOrganization on Organization {
  id
  name
}
    `;
export const NotificationOriginatingUsersFragmentDoc = gql`
    fragment notificationOriginatingUsers on User {
  id
  displayName
}
    `;
export const NotificationFeedSubjectsFragmentDoc = gql`
    fragment notificationFeedSubjects on EventSubjectWithCount {
  subject {
    id
    __typename
    name
  }
  occuranceCount
}
    `;
export const NotificationNodeFragmentDoc = gql`
    fragment notificationNode on Notification {
  id
  type
  event {
    ...eventTimelineNode
  }
  seen
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
export const UserNotificationsDocument = gql`
    query UserNotifications($first: Int, $last: Int, $before: String, $after: String, $notificationReason: NotificationReason, $subscriptionId: Int, $originatingObject: SubscribableInput, $eventType: EventAction, $originatingUserId: Int, $organizationId: Int, $includeRead: Boolean) {
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
    pageInfo {
      startCursor
      endCursor
      hasNextPage
      hasPreviousPage
    }
    notificationSubjects {
      ...notificationFeedSubjects
    }
    originatingUsers {
      ...notificationOriginatingUsers
    }
    organizations {
      ...notificationOrganization
    }
    eventTypes
    edges {
      node {
        ...notificationNode
      }
    }
  }
}
    ${NotificationFeedSubjectsFragmentDoc}
${NotificationOriginatingUsersFragmentDoc}
${NotificationOrganizationFragmentDoc}
${NotificationNodeFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class UserNotificationsGQL extends Apollo.Query<UserNotificationsQuery, UserNotificationsQueryVariables> {
    document = UserNotificationsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
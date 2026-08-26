/* eslint-disable */
import * as Types from '../../generated/civic.apollo.types';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type UpdateNotificationStatusMutationVariables = Types.Exact<{
  input: Types.UpdateNotificationStatusInput;
}>;


export type UpdateNotificationStatusMutation = { __typename: 'Mutation', updateNotificationStatus?: { __typename: 'UpdateNotificationStatusPayload', notifications: Array<{ __typename: 'Notification', id: number, seen: boolean }> } | undefined };

export type UnsubscribeMutationVariables = Types.Exact<{
  input: Types.UnsubscribeInput;
}>;


export type UnsubscribeMutation = { __typename: 'Mutation', unsubscribe?: { __typename: 'UnsubscribePayload', unsubscribedEntities: Array<{ __typename: 'Subscribable', id: number, entityType: Types.SubscribableEntities }> } | undefined };

export type SubscribeMutationVariables = Types.Exact<{
  input: Types.SubscribeInput;
}>;


export type SubscribeMutation = { __typename: 'Mutation', subscribe?: { __typename: 'SubscribePayload', subscriptions: Array<{ __typename: 'Subscription', id: number }> } | undefined };

export type SubscribableFragment = { __typename: 'Subscribable', id: number, entityType: Types.SubscribableEntities };

export type UpdateAllNotificationStatusMutationVariables = Types.Exact<{
  input: Types.UpdateNotificationStatusInput;
}>;


export type UpdateAllNotificationStatusMutation = { __typename: 'Mutation', updateNotificationStatus?: { __typename: 'UpdateNotificationStatusPayload', updatedCount: number } | undefined };

export const SubscribableFragmentDoc = gql`
    fragment subscribable on Subscribable {
  id
  entityType
  __typename
}
    `;
export const UpdateNotificationStatusDocument = gql`
    mutation UpdateNotificationStatus($input: UpdateNotificationStatusInput!) {
  updateNotificationStatus(input: $input) {
    notifications {
      id
      seen
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class UpdateNotificationStatusGQL extends Apollo.Mutation<UpdateNotificationStatusMutation, UpdateNotificationStatusMutationVariables> {
    document = UpdateNotificationStatusDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const UnsubscribeDocument = gql`
    mutation Unsubscribe($input: UnsubscribeInput!) {
  unsubscribe(input: $input) {
    unsubscribedEntities {
      ...subscribable
    }
  }
}
    ${SubscribableFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class UnsubscribeGQL extends Apollo.Mutation<UnsubscribeMutation, UnsubscribeMutationVariables> {
    document = UnsubscribeDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const SubscribeDocument = gql`
    mutation Subscribe($input: SubscribeInput!) {
  subscribe(input: $input) {
    subscriptions {
      id
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class SubscribeGQL extends Apollo.Mutation<SubscribeMutation, SubscribeMutationVariables> {
    document = SubscribeDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const UpdateAllNotificationStatusDocument = gql`
    mutation UpdateAllNotificationStatus($input: UpdateNotificationStatusInput!) {
  updateNotificationStatus(input: $input) {
    updatedCount
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class UpdateAllNotificationStatusGQL extends Apollo.Mutation<UpdateAllNotificationStatusMutation, UpdateAllNotificationStatusMutationVariables> {
    document = UpdateAllNotificationStatusDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
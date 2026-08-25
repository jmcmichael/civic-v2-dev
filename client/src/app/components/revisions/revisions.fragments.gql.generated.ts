/* eslint-disable */
import * as Types from '../../generated/civic.apollo.types';

import { gql } from 'apollo-angular';
export type RevisionLinkoutDataFragment = { __typename: 'LinkoutData', name: string, diffValue:
    | { __typename: 'ObjectFieldDiff', currentObjects: Array<{ __typename: 'ModeratedObjectField', id: number, displayName?: string | undefined, displayType?: string | undefined, entityType: string, link?: string | undefined, deleted: boolean, deprecated?: boolean | undefined, flagged?: boolean | undefined, feature?: { __typename: 'LinkableFeature', link: string, id: number, name: string, deprecated: boolean, flagged: boolean } | undefined }>, addedObjects: Array<{ __typename: 'ModeratedObjectField', id: number, displayName?: string | undefined, displayType?: string | undefined, entityType: string, link?: string | undefined, deleted: boolean, deprecated?: boolean | undefined, flagged?: boolean | undefined, feature?: { __typename: 'LinkableFeature', link: string, id: number, name: string, deprecated: boolean, flagged: boolean } | undefined }>, removedObjects: Array<{ __typename: 'ModeratedObjectField', id: number, displayName?: string | undefined, displayType?: string | undefined, entityType: string, link?: string | undefined, deleted: boolean, deprecated?: boolean | undefined, flagged?: boolean | undefined, feature?: { __typename: 'LinkableFeature', link: string, id: number, name: string, deprecated: boolean, flagged: boolean } | undefined }>, keptObjects: Array<{ __typename: 'ModeratedObjectField', id: number, displayName?: string | undefined, displayType?: string | undefined, entityType: string, link?: string | undefined, deleted: boolean, deprecated?: boolean | undefined, flagged?: boolean | undefined, feature?: { __typename: 'LinkableFeature', link: string, id: number, name: string, deprecated: boolean, flagged: boolean } | undefined }>, suggestedObjects: Array<{ __typename: 'ModeratedObjectField', id: number, displayName?: string | undefined, displayType?: string | undefined, entityType: string, link?: string | undefined, deleted: boolean, deprecated?: boolean | undefined, flagged?: boolean | undefined, feature?: { __typename: 'LinkableFeature', link: string, id: number, name: string, deprecated: boolean, flagged: boolean } | undefined }> }
    | { __typename: 'ScalarFieldDiff', left: string, right: string }
   };

export const RevisionLinkoutDataFragmentDoc = gql`
    fragment revisionLinkoutData on LinkoutData {
  name
  diffValue {
    ... on ObjectFieldDiff {
      currentObjects {
        id
        displayName
        displayType
        entityType
        link
        deleted
        deprecated
        flagged
        feature {
          link
          id
          name
          deprecated
          flagged
        }
      }
      addedObjects {
        id
        displayName
        displayType
        entityType
        link
        deleted
        deprecated
        flagged
        feature {
          link
          id
          name
          deprecated
          flagged
        }
      }
      removedObjects {
        id
        displayName
        displayType
        entityType
        link
        deleted
        deprecated
        flagged
        feature {
          link
          id
          name
          deprecated
          flagged
        }
      }
      keptObjects {
        id
        displayName
        displayType
        entityType
        link
        deleted
        deprecated
        flagged
        feature {
          link
          id
          name
          deprecated
          flagged
        }
      }
      suggestedObjects {
        id
        displayName
        displayType
        entityType
        link
        deleted
        deprecated
        flagged
        feature {
          link
          id
          name
          deprecated
          flagged
        }
      }
    }
    ... on ScalarFieldDiff {
      left
      right
    }
  }
}
    `;
/* eslint-disable */
import * as Types from '../../generated/civic.apollo.types';

import { gql } from 'apollo-angular';
export type RevisionLinkoutDataFragment = { __typename: 'LinkoutData', name: string, diffValue:
    | { __typename: 'ObjectFieldDiff', currentObjects: Array<{ __typename: 'ModeratedObjectField', id: number, displayName?: string | undefined, displayType?: string | undefined, entityType: string, link?: string | undefined, deleted: boolean, deprecated?: boolean | undefined, flagged?: boolean | undefined, feature?: { __typename: 'LinkableFeature', link: string, id: number, name: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }>, addedObjects: Array<{ __typename: 'ModeratedObjectField', id: number, displayName?: string | undefined, displayType?: string | undefined, entityType: string, link?: string | undefined, deleted: boolean, deprecated?: boolean | undefined, flagged?: boolean | undefined, feature?: { __typename: 'LinkableFeature', link: string, id: number, name: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }>, removedObjects: Array<{ __typename: 'ModeratedObjectField', id: number, displayName?: string | undefined, displayType?: string | undefined, entityType: string, link?: string | undefined, deleted: boolean, deprecated?: boolean | undefined, flagged?: boolean | undefined, feature?: { __typename: 'LinkableFeature', link: string, id: number, name: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }>, keptObjects: Array<{ __typename: 'ModeratedObjectField', id: number, displayName?: string | undefined, displayType?: string | undefined, entityType: string, link?: string | undefined, deleted: boolean, deprecated?: boolean | undefined, flagged?: boolean | undefined, feature?: { __typename: 'LinkableFeature', link: string, id: number, name: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }>, suggestedObjects: Array<{ __typename: 'ModeratedObjectField', id: number, displayName?: string | undefined, displayType?: string | undefined, entityType: string, link?: string | undefined, deleted: boolean, deprecated?: boolean | undefined, flagged?: boolean | undefined, feature?: { __typename: 'LinkableFeature', link: string, id: number, name: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }> }
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
          featureType
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
          featureType
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
          featureType
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
          featureType
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
          featureType
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
/* eslint-disable */
import * as Types from '../../../../generated/civic.apollo.types';

import { gql } from 'apollo-angular';
import { ParsedCommentFragmentFragmentDoc } from '../../../../components/comments/comment-list/comment-list.query.gql.generated';
import { MolecularProfileParsedNameFragmentDoc } from '../../../molecular-profiles/molecular-profiles-detail/molecular-profiles-summary/molecular-profiles-summary.query.gql.generated';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type EvidenceSummaryQueryVariables = Types.Exact<{
  evidenceId: Types.Scalars['Int']['input'];
}>;


export type EvidenceSummaryQuery = { __typename: 'Query', evidenceItem?: { __typename: 'EvidenceItem', id: number, name: string, description: string, descriptionReplaceEidWithSource: string, descriptionWithNames: string, descriptionWithNamesReplaceEidWithSource: string, status: Types.EvidenceStatus, evidenceLevel: Types.EvidenceLevel, evidenceType: Types.EvidenceType, evidenceDirection: Types.EvidenceDirection, significance: Types.EvidenceSignificance, variantOrigin: Types.VariantOrigin, therapyInteractionType?: Types.TherapyInteraction | undefined, evidenceRating?: number | undefined, descriptionWithTags: Array<
      | { __typename: 'CommentTagSegment', entityId: number, displayName: string, tagType: Types.TaggableEntity, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
      | { __typename: 'CommentTagSegmentDeprecated', entityId: number, displayName: string, tagType: Types.TaggableEntity, deprecated: boolean, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
      | { __typename: 'CommentTagSegmentFlagged', entityId: number, displayName: string, tagType: Types.TaggableEntity, flagged: boolean, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
      | { __typename: 'CommentTagSegmentFlaggedAndDeprecated', entityId: number, displayName: string, tagType: Types.TaggableEntity, flagged: boolean, deprecated: boolean, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
      | { __typename: 'CommentTagSegmentFlaggedAndWithStatus', entityId: number, displayName: string, tagType: Types.TaggableEntity, status: Types.EvidenceStatus, flagged: boolean, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
      | { __typename: 'CommentTextSegment', text: string }
      | { __typename: 'User', id: number, username: string, displayName: string, name?: string | undefined, role: Types.UserRole, profileImagePath?: string | undefined, organizations: Array<{ __typename: 'Organization', id: number, name: string }> }
    >, descriptionWithTagsReplaceEidWithSource: Array<
      | { __typename: 'CommentTagSegment', entityId: number, displayName: string, tagType: Types.TaggableEntity, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
      | { __typename: 'CommentTagSegmentDeprecated', entityId: number, displayName: string, tagType: Types.TaggableEntity, deprecated: boolean, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
      | { __typename: 'CommentTagSegmentFlagged', entityId: number, displayName: string, tagType: Types.TaggableEntity, flagged: boolean, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
      | { __typename: 'CommentTagSegmentFlaggedAndDeprecated', entityId: number, displayName: string, tagType: Types.TaggableEntity, flagged: boolean, deprecated: boolean, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
      | { __typename: 'CommentTagSegmentFlaggedAndWithStatus', entityId: number, displayName: string, tagType: Types.TaggableEntity, status: Types.EvidenceStatus, flagged: boolean, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
      | { __typename: 'CommentTextSegment', text: string }
      | { __typename: 'User', id: number, username: string, displayName: string, name?: string | undefined, role: Types.UserRole, profileImagePath?: string | undefined, organizations: Array<{ __typename: 'Organization', id: number, name: string }> }
    >, therapies: Array<{ __typename: 'Therapy', id: number, name: string, link: string, deprecated: boolean }>, disease?: { __typename: 'Disease', id: number, name: string, link: string, deprecated: boolean } | undefined, phenotypes: Array<{ __typename: 'Phenotype', id: number, name: string, link: string }>, source: { __typename: 'Source', id: number, citation?: string | undefined, citationId: string, sourceType: Types.SourceSource, displayType: string, displayName: string, sourceUrl?: string | undefined, ascoAbstractId?: string | undefined, link: string, retractionNature?: string | undefined, deprecated: boolean, isPreprint: boolean, clinicalTrials?: Array<{ __typename: 'ClinicalTrial', nctId: string, id: number, link: string }> | undefined }, molecularProfile: { __typename: 'MolecularProfile', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, parsedName: Array<
        | { __typename: 'Feature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean }
        | { __typename: 'MolecularProfileTextSegment', text: string }
        | { __typename: 'Variant', id: number, name: string, link: string, deprecated: boolean, flagged: boolean }
      > }, flags: { __typename: 'FlagConnection', totalCount: number }, revisions: { __typename: 'RevisionConnection', totalCount: number }, comments: { __typename: 'CommentConnection', totalCount: number }, submissionActivity: { __typename: 'SubmitEvidenceItemActivity', createdAt: any, parsedNote: Array<
        | { __typename: 'CommentTagSegment', entityId: number, displayName: string, tagType: Types.TaggableEntity, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
        | { __typename: 'CommentTagSegmentDeprecated', entityId: number, displayName: string, tagType: Types.TaggableEntity, deprecated: boolean, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
        | { __typename: 'CommentTagSegmentFlagged', entityId: number, displayName: string, tagType: Types.TaggableEntity, flagged: boolean, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
        | { __typename: 'CommentTagSegmentFlaggedAndDeprecated', entityId: number, displayName: string, tagType: Types.TaggableEntity, flagged: boolean, deprecated: boolean, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
        | { __typename: 'CommentTagSegmentFlaggedAndWithStatus', entityId: number, displayName: string, tagType: Types.TaggableEntity, status: Types.EvidenceStatus, flagged: boolean, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
        | { __typename: 'CommentTextSegment', text: string }
        | { __typename: 'User', id: number, username: string, displayName: string, name?: string | undefined, role: Types.UserRole, profileImagePath?: string | undefined, organizations: Array<{ __typename: 'Organization', id: number, name: string }> }
      >, user: { __typename: 'User', displayName: string, id: number, role: Types.UserRole } }, acceptanceEvent?: { __typename: 'Event', createdAt: any, originatingUser: { __typename: 'User', id: number, displayName: string, role: Types.UserRole } } | undefined, submissionEvent: { __typename: 'Event', createdAt: any, originatingUser: { __typename: 'User', id: number, displayName: string, role: Types.UserRole } }, rejectionEvent?: { __typename: 'Event', createdAt: any, originatingUser: { __typename: 'User', id: number, displayName: string, role: Types.UserRole } } | undefined } | undefined };

export type EvidenceSummaryFieldsFragment = { __typename: 'EvidenceItem', id: number, name: string, description: string, descriptionReplaceEidWithSource: string, descriptionWithNames: string, descriptionWithNamesReplaceEidWithSource: string, status: Types.EvidenceStatus, evidenceLevel: Types.EvidenceLevel, evidenceType: Types.EvidenceType, evidenceDirection: Types.EvidenceDirection, significance: Types.EvidenceSignificance, variantOrigin: Types.VariantOrigin, therapyInteractionType?: Types.TherapyInteraction | undefined, evidenceRating?: number | undefined, descriptionWithTags: Array<
    | { __typename: 'CommentTagSegment', entityId: number, displayName: string, tagType: Types.TaggableEntity, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
    | { __typename: 'CommentTagSegmentDeprecated', entityId: number, displayName: string, tagType: Types.TaggableEntity, deprecated: boolean, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
    | { __typename: 'CommentTagSegmentFlagged', entityId: number, displayName: string, tagType: Types.TaggableEntity, flagged: boolean, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
    | { __typename: 'CommentTagSegmentFlaggedAndDeprecated', entityId: number, displayName: string, tagType: Types.TaggableEntity, flagged: boolean, deprecated: boolean, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
    | { __typename: 'CommentTagSegmentFlaggedAndWithStatus', entityId: number, displayName: string, tagType: Types.TaggableEntity, status: Types.EvidenceStatus, flagged: boolean, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
    | { __typename: 'CommentTextSegment', text: string }
    | { __typename: 'User', id: number, username: string, displayName: string, name?: string | undefined, role: Types.UserRole, profileImagePath?: string | undefined, organizations: Array<{ __typename: 'Organization', id: number, name: string }> }
  >, descriptionWithTagsReplaceEidWithSource: Array<
    | { __typename: 'CommentTagSegment', entityId: number, displayName: string, tagType: Types.TaggableEntity, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
    | { __typename: 'CommentTagSegmentDeprecated', entityId: number, displayName: string, tagType: Types.TaggableEntity, deprecated: boolean, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
    | { __typename: 'CommentTagSegmentFlagged', entityId: number, displayName: string, tagType: Types.TaggableEntity, flagged: boolean, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
    | { __typename: 'CommentTagSegmentFlaggedAndDeprecated', entityId: number, displayName: string, tagType: Types.TaggableEntity, flagged: boolean, deprecated: boolean, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
    | { __typename: 'CommentTagSegmentFlaggedAndWithStatus', entityId: number, displayName: string, tagType: Types.TaggableEntity, status: Types.EvidenceStatus, flagged: boolean, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
    | { __typename: 'CommentTextSegment', text: string }
    | { __typename: 'User', id: number, username: string, displayName: string, name?: string | undefined, role: Types.UserRole, profileImagePath?: string | undefined, organizations: Array<{ __typename: 'Organization', id: number, name: string }> }
  >, therapies: Array<{ __typename: 'Therapy', id: number, name: string, link: string, deprecated: boolean }>, disease?: { __typename: 'Disease', id: number, name: string, link: string, deprecated: boolean } | undefined, phenotypes: Array<{ __typename: 'Phenotype', id: number, name: string, link: string }>, source: { __typename: 'Source', id: number, citation?: string | undefined, citationId: string, sourceType: Types.SourceSource, displayType: string, displayName: string, sourceUrl?: string | undefined, ascoAbstractId?: string | undefined, link: string, retractionNature?: string | undefined, deprecated: boolean, isPreprint: boolean, clinicalTrials?: Array<{ __typename: 'ClinicalTrial', nctId: string, id: number, link: string }> | undefined }, molecularProfile: { __typename: 'MolecularProfile', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, parsedName: Array<
      | { __typename: 'Feature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean }
      | { __typename: 'MolecularProfileTextSegment', text: string }
      | { __typename: 'Variant', id: number, name: string, link: string, deprecated: boolean, flagged: boolean }
    > }, flags: { __typename: 'FlagConnection', totalCount: number }, revisions: { __typename: 'RevisionConnection', totalCount: number }, comments: { __typename: 'CommentConnection', totalCount: number }, submissionActivity: { __typename: 'SubmitEvidenceItemActivity', createdAt: any, parsedNote: Array<
      | { __typename: 'CommentTagSegment', entityId: number, displayName: string, tagType: Types.TaggableEntity, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
      | { __typename: 'CommentTagSegmentDeprecated', entityId: number, displayName: string, tagType: Types.TaggableEntity, deprecated: boolean, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
      | { __typename: 'CommentTagSegmentFlagged', entityId: number, displayName: string, tagType: Types.TaggableEntity, flagged: boolean, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
      | { __typename: 'CommentTagSegmentFlaggedAndDeprecated', entityId: number, displayName: string, tagType: Types.TaggableEntity, flagged: boolean, deprecated: boolean, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
      | { __typename: 'CommentTagSegmentFlaggedAndWithStatus', entityId: number, displayName: string, tagType: Types.TaggableEntity, status: Types.EvidenceStatus, flagged: boolean, link: string, revisionSetId?: number | undefined, feature?: { __typename: 'LinkableFeature', id: number, name: string, link: string, deprecated: boolean, flagged: boolean, featureType: Types.FeatureInstanceTypes } | undefined }
      | { __typename: 'CommentTextSegment', text: string }
      | { __typename: 'User', id: number, username: string, displayName: string, name?: string | undefined, role: Types.UserRole, profileImagePath?: string | undefined, organizations: Array<{ __typename: 'Organization', id: number, name: string }> }
    >, user: { __typename: 'User', displayName: string, id: number, role: Types.UserRole } }, acceptanceEvent?: { __typename: 'Event', createdAt: any, originatingUser: { __typename: 'User', id: number, displayName: string, role: Types.UserRole } } | undefined, submissionEvent: { __typename: 'Event', createdAt: any, originatingUser: { __typename: 'User', id: number, displayName: string, role: Types.UserRole } }, rejectionEvent?: { __typename: 'Event', createdAt: any, originatingUser: { __typename: 'User', id: number, displayName: string, role: Types.UserRole } } | undefined };

export const EvidenceSummaryFieldsFragmentDoc = gql`
    fragment EvidenceSummaryFields on EvidenceItem {
  id
  name
  description
  descriptionReplaceEidWithSource
  descriptionWithTags {
    ...parsedCommentFragment
  }
  descriptionWithNames
  descriptionWithTagsReplaceEidWithSource {
    ...parsedCommentFragment
  }
  descriptionWithNamesReplaceEidWithSource
  status
  evidenceLevel
  evidenceType
  evidenceDirection
  significance
  variantOrigin
  therapies {
    id
    name
    link
    deprecated
  }
  therapyInteractionType
  disease {
    id
    name
    link
    deprecated
  }
  phenotypes {
    id
    name
    link
  }
  source {
    id
    citation
    citationId
    sourceType
    displayType
    displayName
    sourceUrl
    ascoAbstractId
    link
    clinicalTrials {
      nctId
      id
      link
    }
    retractionNature
    deprecated
    isPreprint
  }
  evidenceRating
  molecularProfile {
    id
    name
    link
    parsedName {
      ...MolecularProfileParsedName
    }
    deprecated
    flagged
  }
  flags(state: OPEN) {
    totalCount
  }
  revisions(status: NEW) {
    totalCount
  }
  comments {
    totalCount
  }
  submissionActivity {
    createdAt
    parsedNote {
      ...parsedCommentFragment
    }
    user {
      displayName
      id
      role
    }
  }
  acceptanceEvent {
    createdAt
    originatingUser {
      id
      displayName
      role
    }
  }
  submissionEvent {
    createdAt
    originatingUser {
      id
      displayName
      role
    }
  }
  rejectionEvent {
    createdAt
    originatingUser {
      id
      displayName
      role
    }
  }
}
    ${ParsedCommentFragmentFragmentDoc}
${MolecularProfileParsedNameFragmentDoc}`;
export const EvidenceSummaryDocument = gql`
    query EvidenceSummary($evidenceId: Int!) {
  evidenceItem(id: $evidenceId) {
    ...EvidenceSummaryFields
  }
}
    ${EvidenceSummaryFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class EvidenceSummaryGQL extends Apollo.Query<EvidenceSummaryQuery, EvidenceSummaryQueryVariables> {
    document = EvidenceSummaryDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
import { Type } from '@angular/core'

/**
 * One activity kind's detail rendering: how to load its component, and the
 * input name the loaded component takes its activity through.
 *
 * `load` is a dynamic `import()` thunk, so each kind's detail component —
 * and everything only it imports — stays in its own lazy chunk, fetched the
 * first time an item of that kind expands. Nothing in this module may
 * import a detail component statically: a single static import would pull
 * that component into every consumer of this registry.
 */
export interface CvcActivityDetailEntry {
  load: () => Promise<Type<unknown>>
  /** the loaded component's activity input name (its public alias) */
  input: string
}

/**
 * Activity kinds that render as a plain single-line item: no detail region,
 * no expand toggle.
 */
export const SIMPLE_ACTIVITY_TYPES: ReadonlySet<string> = new Set([
  'CreateComplexMolecularProfileActivity',
  'CreateVariantActivity',
  'CreateFeatureActivity',
  'DeleteCommentActivity',
  'ApproveAssertionActivity',
])

/**
 * Detail renderers by activity `__typename`. A typename absent here (and
 * not in `SIMPLE_ACTIVITY_TYPES`) renders its summary line unexpandable —
 * the safe default for activity types added to the schema before a renderer
 * exists for them.
 */
export const ACTIVITY_DETAIL_REGISTRY: Record<string, CvcActivityDetailEntry> =
  {
    AcceptRevisionsActivity: {
      load: () =>
        import(
          '../activity-feed/feed-item-details/accept-revisions/accept-revisions-activity.component'
        ).then((m) => m.CvcAcceptRevisionsActivity),
      input: 'cvcAcceptRevisionActivity',
    },
    CommentActivity: {
      load: () =>
        import(
          '../activity-feed/feed-item-details/comment/comment-activity.component'
        ).then((m) => m.CvcCommentActivity),
      input: 'cvcCommentActivity',
    },
    FlagEntityActivity: {
      load: () =>
        import(
          '../activity-feed/feed-item-details/flag-entity/flag-entity-activity.component'
        ).then((m) => m.CvcFlagEntityActivity),
      input: 'cvcFlagEntityActivity',
    },
    ModerateAssertionActivity: {
      load: () =>
        import(
          '../activity-feed/feed-item-details/moderate-assertion/moderate-assertion-activity.component'
        ).then((m) => m.CvcModerateAssertionActivity),
      input: 'cvcModerateAssertionActivity',
    },
    ModerateEvidenceItemActivity: {
      load: () =>
        import(
          '../activity-feed/feed-item-details/moderate-evidence/moderate-evidence-activity.component'
        ).then((m) => m.CvcModerateEvidenceActivity),
      input: 'cvcModerateEvidenceActivity',
    },
    RejectRevisionsActivity: {
      load: () =>
        import(
          '../activity-feed/feed-item-details/reject-revisions/reject-revisions-activity.component'
        ).then((m) => m.CvcRejectRevisionsActivity),
      input: 'cvcRejectRevisionsActivity',
    },
    ResolveFlagActivity: {
      load: () =>
        import(
          '../activity-feed/feed-item-details/resolve-flag/resolve-flag-activity.component'
        ).then((m) => m.CvcResolveFlagActivity),
      input: 'cvcResolveFlagActivity',
    },
    SubmitAssertionActivity: {
      load: () =>
        import(
          '../activity-feed/feed-item-details/submit-assertion/submit-assertion-activity.component'
        ).then((m) => m.CvcSubmitAssertionActivity),
      input: 'cvcSubmitAssertionActivity',
    },
    SubmitEvidenceItemActivity: {
      load: () =>
        import(
          '../activity-feed/feed-item-details/submit-evidence/submit-evidence-activity.component'
        ).then((m) => m.CvcSubmitEvidenceActivity),
      input: 'cvcSubmitEvidenceActivity',
    },
    SuggestRevisionSetActivity: {
      load: () =>
        import(
          '../activity-feed/feed-item-details/suggest-revisions/suggest-revisions-activity.component'
        ).then((m) => m.CvcSuggestRevisionsActivity),
      input: 'cvcSuggestRevisionSetActivity',
    },
    SuggestSourceActivity: {
      load: () =>
        import(
          '../activity-feed/feed-item-details/suggest-source/suggest-source-activity.component'
        ).then((m) => m.CvcSuggestSourceActivity),
      input: 'cvcSuggestSourceActivity',
    },
    UpdateSourceSuggestionStatusActivity: {
      load: () =>
        import(
          '../activity-feed/feed-item-details/update-source-suggestion/update-source-suggestion-activity.component'
        ).then((m) => m.CvcUpdateSourceSuggestionActivity),
      input: 'cvcUpdateSourceSuggestionStatusActivity',
    },
    DeprecateComplexMolecularProfileActivity: {
      load: () =>
        import(
          '../activity-feed/feed-item-details/deprecate-molecular-profile/deprecate-mp-activity.component'
        ).then((m) => m.CvcDeprecateMpActivity),
      input: 'cvcDeprecateMpActivity',
    },
    DeprecateVariantActivity: {
      load: () =>
        import(
          '../activity-feed/feed-item-details/deprecate-variant/deprecate-variant-activity.component'
        ).then((m) => m.CvcDeprecateVariantActivity),
      input: 'cvcDeprecateVariantActivity',
    },
    DeprecateFeatureActivity: {
      load: () =>
        import(
          '../activity-feed/feed-item-details/deprecate-feature/deprecate-feature-activity.component'
        ).then((m) => m.CvcDeprecateFeatureActivity),
      input: 'cvcDeprecateFeatureActivity',
    },
    RevokeApprovalActivity: {
      load: () =>
        import(
          '../activity-feed/feed-item-details/revoke-approval/revoke-approval-activity.component'
        ).then((m) => m.CvcRevokeApprovalActivity),
      input: 'cvcRevokeApprovalActivity',
    },
  }

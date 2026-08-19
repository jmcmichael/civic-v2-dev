import { Type } from '@angular/core'
import { Query } from 'apollo-angular'

/** what one kind's `load()` resolves: its renderer, and the query feeding it */
export interface CvcActivityDetailModule {
  component: Type<unknown>
  /**
   * The kind's own per-id detail query, injected by the detail host.
   *
   * The result type is `any` because it genuinely differs per kind — each
   * query returns its own generated shape — and `Query` is invariant in it,
   * so `unknown` would reject every real service. The host does not read the
   * shape; it forwards the activity to the kind's component, whose input is
   * typed by the same generated fragment the query selects.
   */
  query: Type<Query<any, { id: number }>>
}

/**
 * One activity kind's detail rendering: how to load its renderer and query,
 * and the input name the loaded component takes its activity through.
 *
 * `load` is a dynamic `import()` thunk, so each kind's detail component, its
 * query document and everything only they import stay in a lazy chunk of
 * their own, fetched the first time an item of that kind expands. Nothing in
 * this module may import either statically: a static import of a component
 * pulls it into every consumer of this registry, and a static import of a
 * query document pulls its fragment too — which is what one shared composite
 * document used to do for all sixteen kinds at once.
 */
export interface CvcActivityDetailEntry {
  load: () => Promise<CvcActivityDetailModule>
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
        Promise.all([
          import('./detail/kinds/accept-revisions/accept-revisions-activity.component'),
          import('./detail/kinds/accept-revisions/accept-revisions-activity.query.gql.generated'),
        ]).then(([component, query]) => ({
          component: component.CvcAcceptRevisionsActivity,
          query: query.AcceptRevisionsActivityDetailGQL,
        })),
      input: 'cvcAcceptRevisionActivity',
    },
    CommentActivity: {
      load: () =>
        Promise.all([
          import('./detail/kinds/comment/comment-activity.component'),
          import('./detail/kinds/comment/comment-activity.query.gql.generated'),
        ]).then(([component, query]) => ({
          component: component.CvcCommentActivity,
          query: query.CommentActivityDetailGQL,
        })),
      input: 'cvcCommentActivity',
    },
    FlagEntityActivity: {
      load: () =>
        Promise.all([
          import('./detail/kinds/flag-entity/flag-entity-activity.component'),
          import('./detail/kinds/flag-entity/flag-entity-activity.query.gql.generated'),
        ]).then(([component, query]) => ({
          component: component.CvcFlagEntityActivity,
          query: query.FlagEntityActivityDetailGQL,
        })),
      input: 'cvcFlagEntityActivity',
    },
    ModerateAssertionActivity: {
      load: () =>
        Promise.all([
          import('./detail/kinds/moderate-assertion/moderate-assertion-activity.component'),
          import('./detail/kinds/moderate-assertion/moderate-assertion-activity.query.gql.generated'),
        ]).then(([component, query]) => ({
          component: component.CvcModerateAssertionActivity,
          query: query.ModerateAssertionActivityDetailGQL,
        })),
      input: 'cvcModerateAssertionActivity',
    },
    ModerateEvidenceItemActivity: {
      load: () =>
        Promise.all([
          import('./detail/kinds/moderate-evidence/moderate-evidence-activity.component'),
          import('./detail/kinds/moderate-evidence/moderate-evidence-activity.query.gql.generated'),
        ]).then(([component, query]) => ({
          component: component.CvcModerateEvidenceActivity,
          query: query.ModerateEvidenceItemActivityDetailGQL,
        })),
      input: 'cvcModerateEvidenceActivity',
    },
    RejectRevisionsActivity: {
      load: () =>
        Promise.all([
          import('./detail/kinds/reject-revisions/reject-revisions-activity.component'),
          import('./detail/kinds/reject-revisions/reject-revisions-activity.query.gql.generated'),
        ]).then(([component, query]) => ({
          component: component.CvcRejectRevisionsActivity,
          query: query.RejectRevisionsActivityDetailGQL,
        })),
      input: 'cvcRejectRevisionsActivity',
    },
    ResolveFlagActivity: {
      load: () =>
        Promise.all([
          import('./detail/kinds/resolve-flag/resolve-flag-activity.component'),
          import('./detail/kinds/resolve-flag/resolve-flag-activity.query.gql.generated'),
        ]).then(([component, query]) => ({
          component: component.CvcResolveFlagActivity,
          query: query.ResolveFlagActivityDetailGQL,
        })),
      input: 'cvcResolveFlagActivity',
    },
    SubmitAssertionActivity: {
      load: () =>
        Promise.all([
          import('./detail/kinds/submit-assertion/submit-assertion-activity.component'),
          import('./detail/kinds/submit-assertion/submit-assertion-activity.query.gql.generated'),
        ]).then(([component, query]) => ({
          component: component.CvcSubmitAssertionActivity,
          query: query.SubmitAssertionActivityDetailGQL,
        })),
      input: 'cvcSubmitAssertionActivity',
    },
    SubmitEvidenceItemActivity: {
      load: () =>
        Promise.all([
          import('./detail/kinds/submit-evidence/submit-evidence-activity.component'),
          import('./detail/kinds/submit-evidence/submit-evidence-activity.query.gql.generated'),
        ]).then(([component, query]) => ({
          component: component.CvcSubmitEvidenceActivity,
          query: query.SubmitEvidenceItemActivityDetailGQL,
        })),
      input: 'cvcSubmitEvidenceActivity',
    },
    SuggestRevisionSetActivity: {
      load: () =>
        Promise.all([
          import('./detail/kinds/suggest-revisions/suggest-revisions-activity.component'),
          import('./detail/kinds/suggest-revisions/suggest-revisions-activity.query.gql.generated'),
        ]).then(([component, query]) => ({
          component: component.CvcSuggestRevisionsActivity,
          query: query.SuggestRevisionSetActivityDetailGQL,
        })),
      input: 'cvcSuggestRevisionSetActivity',
    },
    SuggestSourceActivity: {
      load: () =>
        Promise.all([
          import('./detail/kinds/suggest-source/suggest-source-activity.component'),
          import('./detail/kinds/suggest-source/suggest-source-activity.query.gql.generated'),
        ]).then(([component, query]) => ({
          component: component.CvcSuggestSourceActivity,
          query: query.SuggestSourceActivityDetailGQL,
        })),
      input: 'cvcSuggestSourceActivity',
    },
    UpdateSourceSuggestionStatusActivity: {
      load: () =>
        Promise.all([
          import('./detail/kinds/update-source-suggestion/update-source-suggestion-activity.component'),
          import('./detail/kinds/update-source-suggestion/update-source-suggestion-activity.query.gql.generated'),
        ]).then(([component, query]) => ({
          component: component.CvcUpdateSourceSuggestionActivity,
          query: query.UpdateSourceSuggestionStatusActivityDetailGQL,
        })),
      input: 'cvcUpdateSourceSuggestionStatusActivity',
    },
    DeprecateComplexMolecularProfileActivity: {
      load: () =>
        Promise.all([
          import('./detail/kinds/deprecate-molecular-profile/deprecate-mp-activity.component'),
          import('./detail/kinds/deprecate-molecular-profile/deprecate-mp-activity.query.gql.generated'),
        ]).then(([component, query]) => ({
          component: component.CvcDeprecateMpActivity,
          query: query.DeprecateComplexMolecularProfileActivityDetailGQL,
        })),
      input: 'cvcDeprecateMpActivity',
    },
    DeprecateVariantActivity: {
      load: () =>
        Promise.all([
          import('./detail/kinds/deprecate-variant/deprecate-variant-activity.component'),
          import('./detail/kinds/deprecate-variant/deprecate-variant-activity.query.gql.generated'),
        ]).then(([component, query]) => ({
          component: component.CvcDeprecateVariantActivity,
          query: query.DeprecateVariantActivityDetailGQL,
        })),
      input: 'cvcDeprecateVariantActivity',
    },
    DeprecateFeatureActivity: {
      load: () =>
        Promise.all([
          import('./detail/kinds/deprecate-feature/deprecate-feature-activity.component'),
          import('./detail/kinds/deprecate-feature/deprecate-feature-activity.query.gql.generated'),
        ]).then(([component, query]) => ({
          component: component.CvcDeprecateFeatureActivity,
          query: query.DeprecateFeatureActivityDetailGQL,
        })),
      input: 'cvcDeprecateFeatureActivity',
    },
    RevokeApprovalActivity: {
      load: () =>
        Promise.all([
          import('./detail/kinds/revoke-approval/revoke-approval-activity.component'),
          import('./detail/kinds/revoke-approval/revoke-approval-activity.query.gql.generated'),
        ]).then(([component, query]) => ({
          component: component.CvcRevokeApprovalActivity,
          query: query.RevokeApprovalActivityDetailGQL,
        })),
      input: 'cvcRevokeApprovalActivity',
    },
  }

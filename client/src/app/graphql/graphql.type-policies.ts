import { relayStylePagination } from '@apollo/client/utilities'
import { StrictTypedTypePolicies } from '@app/generated/civic.apollo-helpers'
import { CvcAdvancedSearchResultPolicy } from '@app/graphql/policies/advanced-search-result.policy'

/** the only arguments that move through a result set rather than defining it */
const PAGINATION_ARGS = new Set(['first', 'last', 'before', 'after'])

/**
 * Relay pagination keyed on every argument that shapes the result set.
 *
 * The rule is simple enough to derive rather than enumerate: a cursor moves
 * through a list, so it must not partition the cache; everything else — every
 * filter, every sort — selects a *different* list and must. The hand-written
 * `keyArgs` arrays below state that rule one field at a time, and they have
 * drifted badly: audited against the generated `Query*Args` types, 25 of 26
 * lists are incomplete (95 arguments missing, `sortBy` on fourteen fields) and
 * 18 name arguments that no longer exist at all — `geneSymbol`, `entrezSymbol`
 * and `geneName` predate the rename to `feature*`, and `revisionsetId` is a
 * casing typo. A list cannot fail loudly: an omitted argument silently shares
 * one cache entry between result sets that differ, and a misspelled one keys on
 * nothing.
 *
 * Under-keying does not break pagination within a single table — `fetchMore`
 * carries the current filters and sort along with the cursor, and
 * `relayStylePagination` only appends when `after` is present, so page two
 * continues the same sorted set. What it breaks is two consumers of one field
 * holding different result sets: whichever refetches last overwrites the other,
 * and revisiting a table paints the previous consumer's rows until its own
 * query lands.
 *
 * Applied per field as each table is refactored onto `cvc-entity-table`, so the
 * change always arrives with something that exercises it, rather than as one
 * sweeping edit nobody can review.
 */
// the return type is derived rather than restated: relayStylePagination
// returns a FieldPolicy over a relay connection, not over an array
function paginatedByAllArgs(): ReturnType<typeof relayStylePagination> {
  return relayStylePagination((args) => {
    if (!args) return false
    // null and undefined are dropped so an explicitly-null argument and an
    // omitted one share a key, as they share a result set
    const keys = Object.keys(args).filter(
      (name) => !PAGINATION_ARGS.has(name) && args[name] != null
    )
    // sorted so the key does not depend on the order a document happens to
    // declare its arguments in
    return keys.length > 0 ? keys.sort() : false
  })
}

export const CvcTypePolicies: StrictTypedTypePolicies = {
  Gene: {
    fields: {
      comments: relayStylePagination(),
      revisions: relayStylePagination(),
      events: relayStylePagination(),
      variants: relayStylePagination(),
    },
  },
  Query: {
    fields: {
      activities: relayStylePagination([
        'subject',
        'organizationId',
        'userId',
        'activityType',
        'subjectType',
        'linkedApprovalId',
      ]),
      // the features browse table's field; see paginatedByAllArgs above
      // (the previous list was also missing ids, featureFullName, and
      // used a stale `name` instead of the query's real `featureName`)
      browseFeatures: paginatedByAllArgs(),
      // the variant manager's field; see paginatedByAllArgs above
      browseVariants: paginatedByAllArgs(),
      // the molecular profiles browse table's field; see paginatedByAllArgs
      // above (the previous list was also missing ids, molecularProfileName,
      // featureName, and sortBy; named a nonexistent `entrezSymbol` arg
      // -- predates the rename to `featureName` -- and `molecularProfileScore`,
      // which is a sort column, not a filter argument at all)
      browseMolecularProfiles: paginatedByAllArgs(),
      // the variant groups browse table's field; see paginatedByAllArgs
      // above (the previous list named nonexistent `geneNames`/`variantId`
      // args while omitting the real `featureNames` and `sortBy`)
      browseVariantGroups: paginatedByAllArgs(),
      // the sources browse table's field; see paginatedByAllArgs above
      // (the previous list was also missing sortBy, and named a
      // nonexistent `id` arg while omitting the real `ids`)
      browseSources: paginatedByAllArgs(),
      // the source-suggestions browse table's field; the previous
      // hand-maintained list omitted sortBy, so differently-sorted result
      // sets shared one cache entry
      sourceSuggestions: paginatedByAllArgs(),
      // the therapies browse table's field; see paginatedByAllArgs above
      // (the previous list was also missing ids)
      browseTherapies: paginatedByAllArgs(),
      events: relayStylePagination([
        'subject',
        'organizationId',
        'originatingUserId',
        'eventType',
      ]),
      variants: relayStylePagination(['featureId', 'name']),
      newsItems: relayStylePagination(),
      molecularProfiles: relayStylePagination([
        'featureId',
        'name',
        'evidenceStatusFilter',
      ]),
      // the comments browse table's field; see paginatedByAllArgs above
      // (the previous list was missing ids, and possibly others -- this
      // field is also queried, with different args, elsewhere)
      comments: paginatedByAllArgs(),
      // the evidence manager's field; see paginatedByAllArgs above
      evidenceItems: paginatedByAllArgs(),
      assertions: relayStylePagination([
        'diseaseName',
        'therapyName',
        'id',
        'name',
        'summary',
        'assertionDirection',
        'significance',
        'assertionType',
        'variantId',
        'molecularProfileId',
        'ampLevel',
        'geneName',
        'variantName',
        'evidenceId',
        'organizationId',
        'userId',
        'phenotypeId',
        'diseaseId',
        'therapyId',
        'status',
      ]),
      organizations: relayStylePagination(['name', 'id']),
      // the organizations browse table's field; see paginatedByAllArgs
      // above. Had NO field policy at all -- Apollo's default merge
      // strategy applies to a relay connection field, which does not
      // append fetchMore pages the way relayStylePagination's merge does
      browseOrganizations: paginatedByAllArgs(),
      flags: relayStylePagination([
        'flaggable',
        'flaggingUserId',
        'resolvingUserId',
        'state',
      ]),
      // the phenotypes browse table's field; see paginatedByAllArgs above
      browsePhenotypes: paginatedByAllArgs(),
      // the variant types browse table's field; see paginatedByAllArgs above
      // (the previous list named a nonexistent `id` arg while omitting the
      // real `ids` -- a pre-existing bug, fixed with this table's migration)
      variantTypes: paginatedByAllArgs(),
      // the diseases browse table's field; see paginatedByAllArgs above
      // (the previous list was also missing ids)
      browseDiseases: paginatedByAllArgs(),
      therapies: relayStylePagination(['ncitId', 'name', 'id']),
      // the clinical trials browse table's field; see paginatedByAllArgs
      // above (the previous list was also missing sortBy)
      clinicalTrials: paginatedByAllArgs(),
      notifications: relayStylePagination([
        'notificationReason',
        'subscriptionId',
        'originatingObject',
        'eventType',
        'originatingUserId',
        'organizationId',
        'includeRead',
      ]),
      revisions: relayStylePagination([
        'subject',
        'status',
        'originatingUserId',
        'fieldName',
        'revisionsetId',
      ]),
      // the users browse table's field; see paginatedByAllArgs above (the
      // previous list was also missing ids)
      browseUsers: paginatedByAllArgs(),
      users: relayStylePagination(['userName', 'orgName', 'userRole']),
      // the revisions browse table's field; the previous hand-maintained
      // list omitted ids (search-result scoping) and sortBy, and named the
      // now-removed singular id
      revisionSets: paginatedByAllArgs(),
    },
  },
  AdvancedSearchResult: CvcAdvancedSearchResultPolicy as any,
}

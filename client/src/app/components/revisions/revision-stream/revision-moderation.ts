import { Maybe } from '@app/generated/civic.apollo.types'

/**
 * The moderation gating rules of the legacy revision list, extracted as
 * pure functions so the revision-stream facade can declare them and the
 * characterization suite can pin them. Sources are the legacy template's
 * inline conditions (revision-list.component.html); each function notes
 * its origin lines as of the extraction commit.
 */

/** How one revision's selection checkbox presents. */
export type RevisionSelectionState =
  | { kind: 'hidden' }
  | { kind: 'disabled'; tooltip: string }
  | { kind: 'enabled'; tooltip: string }

export const SELECTION_TOOLTIPS = {
  signedOut: 'Must be signed in to manage revisions.',
  curatorNotOwn: 'Curators may only reject their own revisions.',
  enabled: 'Select Revision for Acceptance/Rejection',
} as const

/**
 * Selection gating (template lines 474–504): the checkbox exists only
 * for NEW revisions; signed-out viewers and curators looking at someone
 * else's revision get it disabled, each with its own reason.
 *
 * `viewerId != revisorId` is deliberately loose — the legacy template
 * compares with `!=` across possibly mixed id representations.
 */
export function revisionSelectionState(args: {
  status: string
  signedIn: boolean
  isCurator: boolean
  viewerId: Maybe<number>
  revisorId: Maybe<number>
}): RevisionSelectionState {
  if (args.status !== 'NEW') return { kind: 'hidden' }
  if (!args.signedIn) {
    return { kind: 'disabled', tooltip: SELECTION_TOOLTIPS.signedOut }
  }
  // eslint-disable-next-line eqeqeq
  if (args.isCurator && args.viewerId != args.revisorId) {
    return { kind: 'disabled', tooltip: SELECTION_TOOLTIPS.curatorNotOwn }
  }
  return { kind: 'enabled', tooltip: SELECTION_TOOLTIPS.enabled }
}

/** Review-selected button (template line 558): needs a selection and a session. */
export function reviewEnabled(selectedCount: number, signedIn: boolean): boolean {
  return selectedCount > 0 && signedIn
}

/**
 * Reject (template lines 606–609): requires a comment of at least 10
 * characters.
 */
export function rejectEnabled(comment: Maybe<string>): boolean {
  return comment != null && comment.length >= 10
}

/**
 * Accept (template lines 627–634): requires zero validation errors, and
 * the comment must be absent, empty, or at least 10 characters — a
 * 1–9 character comment blocks acceptance.
 */
export function acceptEnabled(
  totalErrorCount: number,
  comment: Maybe<string>
): boolean {
  return (
    totalErrorCount === 0 &&
    (comment == null || comment === '' || comment.length >= 10)
  )
}

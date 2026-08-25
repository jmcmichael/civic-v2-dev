import { describe, expect, it } from 'vitest'
import {
  SELECTION_TOOLTIPS,
  acceptEnabled,
  rejectEnabled,
  reviewEnabled,
  revisionSelectionState,
} from './revision-moderation'

/**
 * Characterization of the legacy moderation gating, transcribed from
 * revision-list.component.html (selection: lines 474–504; review: 558;
 * reject: 606–609; accept: 627–634). The revision-stream facade must
 * reproduce every row of these tables.
 */

const base = {
  status: 'NEW',
  signedIn: true,
  isCurator: false,
  viewerId: 1,
  revisorId: 2,
}

describe('revisionSelectionState', () => {
  it('hides the checkbox for every non-NEW status', () => {
    for (const status of ['ACCEPTED', 'REJECTED', 'SUPERSEDED']) {
      expect(revisionSelectionState({ ...base, status })).toEqual({
        kind: 'hidden',
      })
    }
  })

  it('disables with the signed-out reason before any other rule', () => {
    expect(
      revisionSelectionState({ ...base, signedIn: false, isCurator: true })
    ).toEqual({ kind: 'disabled', tooltip: SELECTION_TOOLTIPS.signedOut })
  })

  it("disables a curator on someone else's revision", () => {
    expect(
      revisionSelectionState({ ...base, isCurator: true })
    ).toEqual({ kind: 'disabled', tooltip: SELECTION_TOOLTIPS.curatorNotOwn })
  })

  it('enables a curator on their own revision', () => {
    expect(
      revisionSelectionState({ ...base, isCurator: true, revisorId: 1 })
    ).toEqual({ kind: 'enabled', tooltip: SELECTION_TOOLTIPS.enabled })
  })

  it('enables a signed-in non-curator regardless of authorship', () => {
    expect(revisionSelectionState(base)).toEqual({
      kind: 'enabled',
      tooltip: SELECTION_TOOLTIPS.enabled,
    })
  })
})

describe('reviewEnabled', () => {
  it.each([
    [0, true, false],
    [1, false, false],
    [1, true, true],
  ])('%i selected, signedIn %s → %s', (count, signedIn, expected) => {
    expect(reviewEnabled(count, signedIn)).toBe(expected)
  })
})

describe('rejectEnabled — comment of at least 10 characters', () => {
  it.each([
    [undefined, false],
    ['', false],
    ['too short', false], // 9 chars
    ['just right', true], // 10 chars
  ])('%j → %s', (comment, expected) => {
    expect(rejectEnabled(comment)).toBe(expected)
  })
})

describe('acceptEnabled — clean validation, absent/empty/full comment', () => {
  it.each([
    [0, undefined, true],
    [0, '', true],
    [0, 'short one', false], // 1–9 chars blocks acceptance
    [0, 'ten chars!', true],
    [1, undefined, false], // any validation error blocks
  ])('errors %i, comment %j → %s', (errors, comment, expected) => {
    expect(acceptEnabled(errors, comment)).toBe(expected)
  })
})

import { ModeratedEntities, RevisionStatus } from '@app/generated/civic.apollo.types'
import { BehaviorSubject, NEVER } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RevisionsListAndFilterComponent } from './revisions-list-and-filter.component'

/**
 * Wire-level characterization of the legacy revisions facade, written
 * before its port onto the streams library. These specs pin what the
 * component SENDS — watch variables, refetch payloads, fetchMore pages,
 * refetchQueries fan-out — not what it renders. They are the parity
 * oracle for `cvc-revision-stream`: the port must produce the same
 * operations for the same interactions, except where a spec below
 * carries a `defect:` or `decision:` note.
 *
 * Class-level on purpose: variable production lives entirely in the
 * component class against `RevisionsGQL`/`QueryRef`, so faking those two
 * seams captures the whole wire contract with no template, zone, or
 * module involvement.
 */

const subject = { id: 42, entityType: ModeratedEntities.Variant }

function build(queryParams: Record<string, unknown> = {}) {
  const queryRef = {
    refetch: vi.fn(),
    fetchMore: vi.fn(),
    valueChanges: NEVER,
  }
  const gql = { watch: vi.fn(() => queryRef) }
  const params$ = new BehaviorSubject({})
  const queryParams$ = new BehaviorSubject(queryParams)
  const route = { params: params$, queryParams: queryParams$ }
  const doc = (name: string) => ({ document: name })

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const component = new RevisionsListAndFilterComponent(
    gql as any,
    route as any,
    doc('VariantDetail') as any,
    doc('VariantSummary') as any,
    doc('VariantGroupDetail') as any,
    doc('VariantGroupsSummary') as any,
    doc('AssertionDetail') as any,
    doc('AssertionSummary') as any,
    doc('FeatureDetail') as any,
    doc('FeaturesSummary') as any,
    doc('EvidenceDetail') as any,
    doc('EvidenceSummary') as any,
    doc('MolecularProfileDetail') as any,
    doc('MolecularProfileSummary') as any
  )
  /* eslint-enable @typescript-eslint/no-explicit-any */
  component.moderated = subject
  return { component, gql, queryRef, params$, queryParams$ }
}

describe('revisions facade wire contract (characterization)', () => {
  let ctx: ReturnType<typeof build>
  beforeEach(() => {
    ctx = build()
    ctx.component.ngOnInit()
  })

  it('opens with first:10, the subject, and status NEW', () => {
    expect(ctx.gql.watch).toHaveBeenCalledTimes(1)
    expect(ctx.gql.watch).toHaveBeenCalledWith({
      variables: {
        first: 10,
        subject,
        status: RevisionStatus.New,
      },
    })
  })

  it('deep-link ?revisionSetId opens set-filtered with status CLEARED', () => {
    // decision D2 context: this is the deep-link half of the group-filter
    // asymmetry — status is cleared here but retained by Show Group below.
    const deep = build({ revisionSetId: '123' })
    deep.component.ngOnInit()
    expect(deep.gql.watch).toHaveBeenCalledWith({
      variables: {
        first: 10,
        subject,
        status: undefined,
        revisionSetId: 123,
      },
    })
    expect(deep.component.filteredSet).toBe(123)
    expect(deep.component.preselectedRevisionStatus).toBeUndefined()
  })

  it.each([
    [
      'field name',
      (c: RevisionsListAndFilterComponent) =>
        c.onFieldNameSelected({ id: 0, name: 'variant_id', displayName: 'Variant' }),
      { fieldName: 'variant_id' },
    ],
    [
      'revisor',
      (c: RevisionsListAndFilterComponent) =>
        c.onRevisorSelected({ id: 7, username: 'x', profileImagePath: undefined }),
      { originatingUserId: 7 },
    ],
    [
      'resolver',
      (c: RevisionsListAndFilterComponent) =>
        c.onResolverSelected({ id: 9, username: 'y', profileImagePath: undefined }),
      { resolvingUserId: 9 },
    ],
  ] as const)('%s filter refetches subject + its one variable', (_, act, vars) => {
    act(ctx.component)
    expect(ctx.queryRef.refetch).toHaveBeenCalledWith({ subject, ...vars })
  })

  it('status filter sends the enum value; deselect sends undefined', () => {
    ctx.component.onStatusSelected({
      id: 1,
      displayName: 'Accepted',
      value: RevisionStatus.Accepted,
    })
    expect(ctx.queryRef.refetch).toHaveBeenLastCalledWith({
      subject,
      status: RevisionStatus.Accepted,
    })
    ctx.component.onStatusSelected(undefined)
    expect(ctx.queryRef.refetch).toHaveBeenLastCalledWith({
      subject,
      status: undefined,
    })
  })

  it('Show Group refetches the set WITHOUT touching status', () => {
    // decision D2 context: the refetch payload omits `status`, and Apollo
    // merges partial refetch variables — so status:NEW silently persists
    // here, unlike the deep-link path. Characterized, not endorsed.
    ctx.component.onRevisionSetSelected(55)
    expect(ctx.queryRef.refetch).toHaveBeenCalledWith({
      subject,
      revisionSetId: 55,
    })
    expect(ctx.component.filteredSet).toBe(55)
  })

  it('clearing the group tag refetches revisionSetId: undefined', () => {
    ctx.component.onRevisionSetSelected(55)
    ctx.component.onSetFilterClearClicked()
    expect(ctx.queryRef.refetch).toHaveBeenLastCalledWith({
      subject,
      revisionSetId: undefined,
    })
    expect(ctx.component.filteredSet).toBeUndefined()
  })

  it('refresh() refetches with no variable changes', () => {
    ctx.component.refresh()
    expect(ctx.queryRef.refetch).toHaveBeenCalledWith()
  })

  it('loadMore pages by cursor at the same page size', () => {
    ctx.component.loadMore('cursor-abc')
    expect(ctx.queryRef.fetchMore).toHaveBeenCalledWith({
      variables: { first: 10, after: 'cursor-abc' },
    })
  })

  it('builds Detail+Summary refetchQueries for its entity type', () => {
    expect(ctx.component.refetchQueries).toEqual([
      { query: 'VariantDetail', variables: { variantId: 42 } },
      { query: 'VariantSummary', variables: { variantId: 42 } },
    ])
  })

  it('defect: coordinate entity types build NO refetchQueries', () => {
    // D3: accepting a revision on the variant coordinate tabs refreshes
    // nothing outside the list. The port closes this; this spec documents
    // today's behavior and must be REVERSED then.
    const coords = build()
    coords.component.moderated = {
      id: 42,
      entityType: ModeratedEntities.VariantCoordinates,
    }
    coords.component.ngOnInit()
    expect(coords.component.refetchQueries).toEqual([])
  })

  it('defect: every queryParams emission builds a new watch, undisposed', () => {
    // The nested-subscription leak the port retires: a second queryParams
    // emission creates a second QueryRef; the first is never cleaned up.
    ctx.queryParams$.next({})
    expect(ctx.gql.watch).toHaveBeenCalledTimes(2)
  })
})

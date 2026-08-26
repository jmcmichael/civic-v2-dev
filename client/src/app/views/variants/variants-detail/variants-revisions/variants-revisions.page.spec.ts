import { BehaviorSubject, Subject } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { VariantsRevisionsPage } from './variants-revisions.page'

/**
 * The variant revisions tabs as data: badge math, coordinate tab
 * construction, and each tab's post-moderation fan-out. The fan-out
 * assertions reverse the legacy suite's `defect:` specs — coordinate
 * moderation now refetches the variant page documents and the badge
 * counts instead of nothing (D3).
 */

interface FakeResult {
  data: unknown
  loading: boolean
  /** onlyCompleteData() filters on this */
  dataState: 'complete'
}

function build() {
  const values$ = new Subject<FakeResult>()
  const gql = {
    watch: vi.fn(() => ({ valueChanges: values$ })),
    document: 'BadgeDoc',
  }
  const detailGql = { document: 'VariantDetailDoc' }
  const summaryGql = { document: 'VariantSummaryDoc' }
  const route = { params: new BehaviorSubject({ variantId: '12' }) }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const page = new VariantsRevisionsPage(
    gql as any,
    detailGql as any,
    summaryGql as any,
    route as any
  )
  /* eslint-enable @typescript-eslint/no-explicit-any */
  page.ngOnInit()
  return { page, gql, values$ }
}

function emit(values$: Subject<FakeResult>, variant: unknown) {
  values$.next({ data: { variant }, loading: false, dataState: 'complete' })
}

describe('VariantsRevisionsPage tabs', () => {
  let ctx: ReturnType<typeof build>
  beforeEach(() => {
    ctx = build()
  })

  it('watches the badge counts instead of a one-shot no-cache fetch', () => {
    // watched + cached is what lets the moderation refetch update badges
    expect(ctx.gql.watch).toHaveBeenCalledWith({ variables: { variantId: 12 } })
  })

  it('builds gene-variant tabs with badge math and coordinate fan-out', () => {
    emit(ctx.values$, {
      __typename: 'GeneVariant',
      openRevisionCount: 7,
      coordinates: { openRevisionCount: 3, id: 500 },
    })

    const tabs = ctx.page.tabs()
    expect(tabs.map((tab) => tab.name)).toEqual([
      'Variant Fields',
      'Variant Coordinates',
    ])
    expect(tabs[0].openCount).toBe(4)
    expect(tabs[1].openCount).toBe(3)
    expect(tabs[1].moderated).toEqual({
      id: 500,
      entityType: 'VARIANT_COORDINATES',
    })

    // every tab refreshes the badges; coordinate tabs add the page docs
    expect(
      tabs[0].moderationRefetch.map((d) => (d as { query: unknown }).query)
    ).toEqual(['BadgeDoc'])
    expect(
      tabs[1].moderationRefetch.map((d) => (d as { query: unknown }).query)
    ).toEqual(['VariantDetailDoc', 'VariantSummaryDoc', 'BadgeDoc'])
  })

  it('builds fusion-variant tabs for both exon coordinate sets', () => {
    emit(ctx.values$, {
      __typename: 'FusionVariant',
      openRevisionCount: 9,
      fivePrimeEndExonCoordinates: { openRevisionCount: 2, id: 600 },
      threePrimeStartExonCoordinates: { openRevisionCount: 3, id: 601 },
    })

    const tabs = ctx.page.tabs()
    expect(tabs.map((tab) => tab.openCount)).toEqual([4, 2, 3])
    expect(tabs[1].moderated.entityType).toBe('EXON_COORDINATES')
    expect(tabs[2].moderated.id).toBe(601)
    for (const tab of tabs.slice(1)) {
      expect(
        tab.moderationRefetch.map((d) => (d as { query: unknown }).query)
      ).toEqual(['VariantDetailDoc', 'VariantSummaryDoc', 'BadgeDoc'])
    }
  })

  it('rebuilds tabs idempotently when the badge query refetches', () => {
    const variant = {
      __typename: 'GeneVariant',
      openRevisionCount: 7,
      coordinates: { openRevisionCount: 3, id: 500 },
    }
    emit(ctx.values$, variant)
    emit(ctx.values$, { ...variant, openRevisionCount: 6, coordinates: { openRevisionCount: 2, id: 500 } })

    const tabs = ctx.page.tabs()
    expect(tabs).toHaveLength(2)
    expect(tabs[0].openCount).toBe(4)
    expect(tabs[1].openCount).toBe(2)
  })
})

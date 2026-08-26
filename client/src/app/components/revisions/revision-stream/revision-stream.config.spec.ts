import {
  ModeratedEntities,
  RevisionStatus,
} from '@app/generated/civic.apollo.types'
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus'
import { describe, expect, it } from 'vitest'
import { REVISION_DIFF_REGISTRY } from './revision-diff.registry'
import { SELECTION_TOOLTIPS } from './revision-moderation'
import {
  REVISION_STREAM_PAGE_SIZE,
  RevisionStreamViewer,
  revisionStreamConfig,
} from './revision-stream.config'
import { RevisionStreamGQL } from './revision-stream.query.gql.generated'
import {
  RevisionStreamConnection,
  RevisionStreamNode,
} from './revision-stream.types'

// a stand-in service; nothing here executes a query
const gql = { watch: () => ({}) } as unknown as RevisionStreamGQL
const subject = { id: 1, entityType: ModeratedEntities.EvidenceItem }

function makeSpec(viewer: Partial<RevisionStreamViewer> = {}) {
  return revisionStreamConfig({
    query: gql,
    scope: { subject },
    viewer: { signedIn: true, isCurator: false, id: 99, ...viewer },
  })
}

function revision(
  over: Partial<{ status: RevisionStatus; revisorId: number }> = {}
): RevisionStreamNode {
  return {
    id: 7,
    fieldName: 'description',
    status: over.status ?? RevisionStatus.New,
    creationActivity: { user: { id: over.revisorId ?? 12 } },
  } as unknown as RevisionStreamNode
}

describe('revisionStreamConfig', () => {
  it('assembles a Load More stream at the legacy page size', () => {
    const spec = makeSpec()

    expect(spec.pagination).toBe('button')
    expect(spec.pageSize).toBe(REVISION_STREAM_PAGE_SIZE)
    expect(spec.title).toBe('Revisions')
  })

  it('identifies items by id and discriminates by fieldName', () => {
    const spec = makeSpec()
    const node = revision()

    expect(spec.item.id(node)).toBe(7)
    expect(spec.item.kind(node)).toBe('description')
    expect(spec.item.summary).toBeInstanceOf(PolymorpheusComponent)
    expect(spec.item.extra).toBeInstanceOf(PolymorpheusComponent)
    expect(spec.item.footer).toBeInstanceOf(PolymorpheusComponent)
  })

  it('gates selection three ways: hidden, disabled with reason, enabled', () => {
    const editor = makeSpec()
    const signedOut = makeSpec({ signedIn: false, id: undefined })
    const curator = makeSpec({ isCurator: true, id: 99 })
    const node = revision({ revisorId: 12 })

    // resolved revisions never offer the checkbox
    const resolved = revision({ status: RevisionStatus.Accepted })
    expect(editor.item.selectionVisible?.(resolved)).toBe(false)
    expect(editor.item.selectTooltip?.(resolved)).toBeUndefined()

    expect(signedOut.item.selectionVisible?.(node)).toBe(true)
    expect(signedOut.item.selectable?.(node)).toBe(false)
    expect(signedOut.item.selectTooltip?.(node)).toBe(
      SELECTION_TOOLTIPS.signedOut
    )

    // curators may only act on their own revisions
    expect(curator.item.selectable?.(node)).toBe(false)
    expect(curator.item.selectTooltip?.(node)).toBe(
      SELECTION_TOOLTIPS.curatorNotOwn
    )
    const own = revision({ revisorId: 99 })
    expect(curator.item.selectable?.(own)).toBe(true)

    expect(editor.item.selectable?.(node)).toBe(true)
    expect(editor.item.selectTooltip?.(node)).toBe(SELECTION_TOOLTIPS.enabled)
  })

  it('maps the connection counts, unfiltered included', () => {
    const spec = makeSpec()
    const connection = {
      totalCount: 6,
      unfilteredCountForSubject: 40,
      edges: [{}, {}],
    } as RevisionStreamConnection

    expect(spec.counts?.(connection)).toEqual({
      total: 6,
      unfiltered: 40,
      rows: 2,
    })
  })
})

describe('REVISION_DIFF_REGISTRY', () => {
  it('carries every association field the legacy template switched on', () => {
    // 21 cases: the legacy 21-case fieldName switch, as data
    expect(Object.keys(REVISION_DIFF_REGISTRY)).toHaveLength(21)
    expect(REVISION_DIFF_REGISTRY['drug_ids']).toEqual({
      label: 'Therapies',
      tag: 'therapy',
    })
    // the partner-feature tag reads its id off the nested feature
    expect(REVISION_DIFF_REGISTRY['known_partner_gene_ids'].tag).toBe(
      'partnerFeature'
    )
  })
})

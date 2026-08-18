import { TestBed } from '@angular/core/testing'
import { DateSortColumns } from '@app/generated/civic.apollo.types'
import { provideMockApollo } from '@app/testing/apollo-test.providers'
import {
  describeEntityTableContract,
  specCell,
  specColumn,
} from '@app/testing/entity-table.harness'
import { beforeEach, describe, expect, it } from 'vitest'
import { commentsTableConfig } from './comments-table.config'
import {
  CommentBrowseFieldsFragment,
  CommentsBrowseGQL,
} from './comments-table.query.gql.generated'

/**
 * The parity net ported from the (now-deleted) legacy
 * `comments-table.characterization.spec.ts`: the shared contract plus the
 * invariants the compiler cannot see — the opening default sort and the
 * `ids` scope passthrough. No filter-routing test: the legacy table has
 * no filters at all.
 */

const ROW: CommentBrowseFieldsFragment = {
  __typename: 'Comment',
  id: 4,
  name: 'Comment 4',
  link: '/comments/4',
  comment: 'This looks right to me.',
  createdAt: '2026-08-01T00:00:00Z',
  commenter: {
    __typename: 'User',
    id: 9,
    displayName: 'jdoe',
    role: 'EDITOR' as never,
  },
  commentable: {
    __typename: 'EvidenceItem',
    id: 812,
    name: 'EID812',
    link: '/evidence/812',
  },
}

const SECOND_ROW: CommentBrowseFieldsFragment = {
  ...ROW,
  id: 7,
  name: 'Comment 7',
  link: '/comments/7',
}

describe('commentsTableConfig', () => {
  describeEntityTableContract({
    spec: () =>
      commentsTableConfig(TestBed.inject(CommentsBrowseGQL), 'Comments'),
    operationName: 'CommentsBrowse',
    rows: [ROW, SECOND_ROW],
    connection: (rows, pageInfo) => ({
      comments: {
        __typename: 'CommentConnection',
        edges: rows.map((node) => ({ cursor: `c${node.id}`, node })),
        pageInfo,
        totalCount: 4102,
      },
    }),
    // none of Comment, the commentable union or User are taggable typenames
    seeded: [],
  })

  let spec: ReturnType<typeof commentsTableConfig>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockApollo(() => {
          throw new Error('no network expected')
        }),
      ],
    })
    spec = commentsTableConfig(TestBed.inject(CommentsBrowseGQL), 'Comments')
  })

  const column = (key: string) => specColumn(spec, key)

  it('has no filters at all, matching the legacy table', () => {
    expect(spec.columns.some((c) => c.filter)).toBe(false)
  })

  it('offers a sorter only on Created', () => {
    expect(
      spec.columns.filter((c) => c.sort).map((c) => c.sort!.column)
    ).toEqual([DateSortColumns.Created])
  })

  it('opens sorted by created, as the legacy table always has', () => {
    expect(column('createdAt').sort?.default).toBe('descend')
  })

  describe('host scope', () => {
    it('passes the embed-site ids scope through', () => {
      const scoped = commentsTableConfig(
        TestBed.inject(CommentsBrowseGQL),
        undefined,
        { ids: [1, 2] }
      )
      expect(scoped.scope).toMatchObject({ ids: [1, 2] })
    })
  })

  describe('cell accessors', () => {
    it('renders Comment, Subject and Commenter as custom cells (none is a taggable typename)', () => {
      expect(column('comment').cell.kind).toBe('custom')
      expect(column('subject').cell.kind).toBe('custom')
      expect(column('commenter').cell.kind).toBe('custom')
    })

    it('renders the comment body as plain text', () => {
      expect(specCell(spec, 'commentText', 'text').text(ROW)).toBe(
        'This looks right to me.'
      )
    })

    it('formats the created timestamp with the timeAgo formatter', () => {
      const text = specCell(spec, 'createdAt', 'text')
      expect(text.text(ROW)).toMatch(/ago$|^[A-Z][a-z]{2} \d/)
    })
  })
})

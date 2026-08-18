import { TestBed } from '@angular/core/testing'
import {
  SourceSource,
  SourcesSortColumns,
} from '@app/generated/civic.apollo.types'
import { SORT_DESCEND_FIRST } from '@app/tables'
import { readCachedEntity, writeCachedEntity } from '@app/tags'
import { provideMockApollo } from '@app/testing/apollo-test.providers'
import {
  describeEntityTableContract,
  specCell,
  specColumn,
} from '@app/testing/entity-table.harness'
import { Apollo } from 'apollo-angular'
import { OperationDefinitionNode, visit } from 'graphql'
import { beforeEach, describe, expect, it } from 'vitest'
import { sourcesTableConfig } from './sources-table.config'
import {
  BrowseSourceRowFieldsFragment,
  BrowseSourcesDocument,
  BrowseSourcesGQL,
} from './sources-table.query.gql.generated'

/**
 * The parity net ported from the (now-deleted) legacy
 * `sources-table.characterization.spec.ts`: the shared contract plus the
 * invariants the compiler cannot see — filter -> variable routing
 * (including the declared∧used document walk), sortable columns, the
 * opening default sort, and the `ids`/`clinicalTrialId` host scope
 * passthrough.
 *
 * Deliberately NOT ported: the legacy `clinicalTrialId` bug — `ngOnChanges`
 * never noticed a `clinicalTrialId` change, and `refresh()`'s payload never
 * included it either, so a rebound `[clinicalTrialId]` (e.g. route reuse
 * between two clinical trials) was silently ignored forever. The facade's
 * `computed` spec always reflects both current scope signals, so `host
 * scope` below asserts the fix instead — same treatment as users-table's
 * `ids` bug.
 */

const ROW: BrowseSourceRowFieldsFragment = {
  __typename: 'BrowseSource',
  id: 42,
  name: 'BRAF V600E mutation status predicts sensitivity...',
  authors: ['Long GV', 'Stroyakovskiy D', 'Gogas H'],
  citationId: 21639808,
  evidenceItemCount: 12,
  sourceSuggestionCount: 1,
  journal: 'N Engl J Med',
  publicationYear: 2011,
  sourceType: SourceSource.Pubmed,
  citation: 'Long GV, et al. N Engl J Med. 2011.',
  displayType: 'PubMed',
  link: '/sources/42',
  openAccess: false,
  deprecated: false,
}

const SECOND_ROW: BrowseSourceRowFieldsFragment = {
  ...ROW,
  id: 43,
  citationId: 21639809,
  name: 'A second source',
}

/** the variables the operation declares, e.g. `$name` */
function declaredVariables(): Set<string> {
  const operation = BrowseSourcesDocument.definitions.find(
    (d): d is OperationDefinitionNode => d.kind === 'OperationDefinition'
  )
  return new Set(
    (operation?.variableDefinitions ?? []).map((v) => v.variable.name.value)
  )
}

/** the variables the operation actually passes to a field or input object */
function usedVariables(): Set<string> {
  const used = new Set<string>()
  visit(BrowseSourcesDocument, {
    Argument: (node) => {
      visit(node.value, { Variable: (v) => void used.add(v.name.value) })
    },
  })
  return used
}

describe('sourcesTableConfig', () => {
  describeEntityTableContract({
    spec: () => sourcesTableConfig(TestBed.inject(BrowseSourcesGQL), 'Sources'),
    operationName: 'BrowseSources',
    rows: [ROW, SECOND_ROW],
    connection: (rows, pageInfo) => ({
      browseSources: {
        __typename: 'BrowseSourceConnection',
        edges: rows.map((node) => ({ cursor: `c${node.id}`, node })),
        pageInfo,
        totalCount: 3122,
        filteredCount: 3122,
        pageCount: 90,
        lastUpdated: '2026-08-17T00:00:00Z',
      },
    }),
    // the source is projected out of the row itself, addressed as Source
    seeded: [['Source', 42]],
  })

  let apollo: Apollo
  let spec: ReturnType<typeof sourcesTableConfig>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockApollo(() => {
          throw new Error('no network expected')
        }),
      ],
    })
    apollo = TestBed.inject(Apollo)
    spec = sourcesTableConfig(TestBed.inject(BrowseSourcesGQL), 'Sources')
  })

  const column = (key: string) => specColumn(spec, key)

  it('routes every filter to a variable the query declares AND uses', () => {
    const declared = declaredVariables()
    const used = usedVariables()
    for (const col of spec.columns) {
      if (!col.filter) continue
      expect(declared.has(col.filter.var), `declared: ${col.filter.var}`).toBe(
        true
      )
      expect(used.has(col.filter.var), `used: ${col.filter.var}`).toBe(true)
    }
  })

  it('maps each filter to its own variable', () => {
    expect(
      spec.columns.filter((c) => c.filter).map((c) => [c.key, c.filter!.var])
    ).toEqual([
      ['name', 'name'],
      ['authors', 'author'],
      ['sourceType', 'sourceType'],
      ['citationId', 'citationId'],
      ['publicationYear', 'year'],
      ['journal', 'journal'],
      ['openAccess', 'openAccess'],
    ])
  })

  it('cycles its count columns descend-first, as the legacy table did', () => {
    for (const key of ['evidenceItemCount', 'sourceSuggestionCount']) {
      expect(column(key).sort?.directions).toEqual(SORT_DESCEND_FIRST)
    }
  })

  it('discloses the full source name in a hover tooltip, as legacy did', () => {
    expect(column('name').cell).toMatchObject({
      kind: 'text',
      tooltip: true,
    })
  })

  it('prefixes its count headers with entity icons, as the legacy table did', () => {
    expect(
      spec.columns.filter((c) => c.labelIcon).map((c) => [c.key, c.labelIcon])
    ).toEqual([
      ['evidenceItemCount', 'civic-evidence'],
      ['sourceSuggestionCount', 'civic-queue'],
    ])
  })

  it('discloses its clip-prone text columns in hover tooltips', () => {
    expect(column('journal').cell).toMatchObject({
      kind: 'text',
      tooltip: true,
    })
  })

  it('offers a sorter only where the legacy table did', () => {
    expect(
      spec.columns.filter((c) => c.sort).map((c) => c.sort!.column)
    ).toEqual([
      SourcesSortColumns.Name,
      SourcesSortColumns.Authors,
      SourcesSortColumns.SourceType,
      SourcesSortColumns.CitationId,
      SourcesSortColumns.Year,
      SourcesSortColumns.Journal,
      SourcesSortColumns.EvidenceCount,
      SourcesSortColumns.SuggestionCount,
    ])
    expect(column('citation').sort).toBeUndefined()
    expect(column('openAccess').sort).toBeUndefined()
  })

  it('opens sorted by evidence count, as the legacy table always has', () => {
    expect(column('evidenceItemCount').sort?.default).toBe('descend')
  })

  describe('host scope', () => {
    it('passes the embed-site ids and clinicalTrialId scope through', () => {
      const scoped = sourcesTableConfig(
        TestBed.inject(BrowseSourcesGQL),
        undefined,
        { ids: [1, 2], clinicalTrialId: 7 }
      )
      expect(scoped.scope).toMatchObject({ ids: [1, 2], clinicalTrialId: 7 })
    })
  })

  describe('cell accessors', () => {
    it('addresses the source by cache identity alone', () => {
      const entityTag = specCell(spec, 'citation', 'entity-tag')
      expect(entityTag.ref(ROW)).toEqual({ __typename: 'Source', id: 42 })
    })

    it('renders Name as highlightable plain text, separate from Citation', () => {
      const text = specCell(spec, 'name', 'text')
      expect(text.text(ROW)).toBe(ROW.name)
      expect(text.highlight).toBe(true)
    })

    it('renders Authors as a custom cell (a pileup, not comma-joined text)', () => {
      expect(column('authors').cell.kind).toBe('custom')
    })

    it("renders Type as the row's own displayType", () => {
      expect(specCell(spec, 'sourceType', 'text').text(ROW)).toBe('PubMed')
    })

    it('renders ID and Year as plain text with numeric filters', () => {
      expect(specCell(spec, 'citationId', 'text').text(ROW)).toBe(21639808)
      expect(specCell(spec, 'publicationYear', 'text').text(ROW)).toBe(2011)
      expect(column('citationId').filter?.kind).toBe('numeric')
      expect(column('publicationYear').filter?.kind).toBe('numeric')
    })

    it('renders Journal as plain text', () => {
      expect(specCell(spec, 'journal', 'text').text(ROW)).toBe('N Engl J Med')
    })

    it('renders Open Access as a custom cell with a parsed text filter', () => {
      expect(column('openAccess').cell.kind).toBe('custom')
      const filter = column('openAccess').filter
      expect(filter?.kind).toBe('text')
      const transform = (filter as { transform?: (v: unknown) => unknown })
        .transform!
      expect(transform('Open')).toBe(true)
      expect(transform('closed')).toBe(false)
      expect(transform('y')).toBe(true)
      expect(transform('n')).toBe(false)
      expect(transform('')).toBeUndefined()
      expect(transform('nonsense')).toBeUndefined()
    })

    it('renders the counts as count-tag cells', () => {
      expect(specCell(spec, 'evidenceItemCount', 'count-tag').count(ROW)).toBe(
        12
      )
      expect(
        specCell(spec, 'sourceSuggestionCount', 'count-tag').count(ROW)
      ).toBe(1)
    })
  })

  describe('cache seeds', () => {
    it('projects a source that satisfies LinkableSource', () => {
      const seedOf = (column('citation').cell as any).seed
      writeCachedEntity(apollo, 'Source', seedOf(ROW))

      expect(readCachedEntity(apollo, 'Source', 42)).toMatchObject({
        name: ROW.name,
        link: '/sources/42',
        citation: ROW.citation,
        sourceType: SourceSource.Pubmed,
      })
    })
  })
})

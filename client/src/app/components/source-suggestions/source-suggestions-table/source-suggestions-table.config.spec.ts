import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { DownloadOutline } from '@ant-design/icons-angular/icons'
import {
  SortDirection,
  SourceSource,
  SourceSuggestionsSortColumns,
  SourceSuggestionStatus,
  UserRole,
} from '@app/generated/civic.apollo.types'
import { SORT_DESCEND_FIRST } from '@app/tables'
import {
  MockGraphqlOperation,
  provideMockApollo,
} from '@app/testing/apollo-test.providers'
import {
  describeEntityTableContract,
  settleTable,
  specColumn,
  TABLE_ICONS,
} from '@app/testing/entity-table.harness'
import { OperationDefinitionNode, visit } from 'graphql'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { beforeEach, describe, expect, it } from 'vitest'
import { CvcSourceSuggestionsTableComponent } from './source-suggestions-table.component'
import { sourceSuggestionsTableConfig } from './source-suggestions-table.config'
import {
  BrowseSourceSuggestionRowFieldsFragment,
  BrowseSourceSuggestionsDocument,
  BrowseSourceSuggestionsGQL,
} from './source-suggestions-table.query.gql.generated'

/**
 * The shared contract plus the invariants ported from the legacy table's
 * characterization spec (`source-suggestions-table.component.spec.ts`,
 * deleted with the legacy component): filter→variable routing with the
 * declared∧used walk, the sortable columns, the CreatedAt-descend default
 * sort, and — on the mounted facade — the NEW default status filter arriving
 * via settings, and the [sourceId]/[submitterId] scope surviving filter
 * changes (the legacy clobber bug, fixed by construction).
 */

// `reason` and `lastStatusUpdateActivity` are explicit nulls (not undefined):
// the document selects them, and a missing field aborts the cache write,
// which re-fires the watch query and breaks the wire assertions
const ROW = {
  __typename: 'SourceSuggestion',
  id: 55,
  status: SourceSuggestionStatus.New,
  reason: null,
  createdAt: '2026-01-05T12:00:00Z',
  molecularProfile: {
    __typename: 'MolecularProfile',
    id: 12,
    name: 'BRAF V600E',
    link: '/molecular-profiles/12',
    flagged: false,
    deprecated: false,
  },
  disease: {
    __typename: 'Disease',
    id: 7,
    name: 'Melanoma',
    link: '/diseases/7',
    deprecated: false,
  },
  source: {
    __typename: 'Source',
    id: 3,
    name: 'Chakravarty et al., 2017',
    link: '/sources/3',
    citation: 'Chakravarty et al., 2017',
    citationId: '28138153',
    sourceType: SourceSource.Pubmed,
    sourceUrl: 'https://pubmed.example/28138153',
    displayType: 'PubMed',
    displayName: 'Chakravarty et al., 2017',
    deprecated: false,
  },
  user: {
    __typename: 'User',
    id: 9,
    displayName: 'jdoe',
    role: UserRole.Curator,
  },
  therapies: [],
  therapyInteractionType: null,
  creationActivity: { __typename: 'SuggestSourceActivity', parsedNote: [] },
  lastStatusUpdateActivity: null,
} as unknown as BrowseSourceSuggestionRowFieldsFragment

const SECOND_ROW: BrowseSourceSuggestionRowFieldsFragment = {
  ...ROW,
  id: 99,
  status: SourceSuggestionStatus.Curated,
}

const CONNECTION = (rows: BrowseSourceSuggestionRowFieldsFragment[]) => ({
  sourceSuggestions: {
    __typename: 'SourceSuggestionConnection',
    edges: rows.map((node) => ({ cursor: `c${node.id}`, node })),
    pageInfo: {
      __typename: 'PageInfo',
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: 'ca',
      endCursor: 'cb',
    },
    totalCount: 120,
    filteredCount: 120,
    pageCount: 4,
  },
})

function declaredVariables(): Set<string> {
  const operation = BrowseSourceSuggestionsDocument.definitions.find(
    (d): d is OperationDefinitionNode => d.kind === 'OperationDefinition'
  )
  return new Set(
    (operation?.variableDefinitions ?? []).map((v) => v.variable.name.value)
  )
}

function usedVariables(): Set<string> {
  const used = new Set<string>()
  visit(BrowseSourceSuggestionsDocument, {
    Argument: (node) => {
      visit(node.value, { Variable: (v) => void used.add(v.name.value) })
    },
  })
  return used
}

describe('sourceSuggestionsTableConfig', () => {
  describeEntityTableContract({
    spec: () =>
      sourceSuggestionsTableConfig(
        TestBed.inject(BrowseSourceSuggestionsGQL),
        'Suggestions'
      ),
    operationName: 'BrowseSourceSuggestions',
    rows: [ROW, SECOND_ROW],
    connection: (rows, pageInfo) => ({
      sourceSuggestions: {
        __typename: 'SourceSuggestionConnection',
        edges: rows.map((node) => ({ cursor: `c${node.id}`, node })),
        pageInfo,
        totalCount: 120,
        // the document selects these too; omitting a selected field aborts
        // the cache write and re-fires the query
        filteredCount: 120,
        pageCount: 4,
      },
    }),
    seeded: [],
  })

  let spec: ReturnType<typeof sourceSuggestionsTableConfig>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockApollo(() => {
          throw new Error('no network expected')
        }),
      ],
    })
    spec = sourceSuggestionsTableConfig(
      TestBed.inject(BrowseSourceSuggestionsGQL),
      'Suggestions'
    )
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
      ['status', 'status'],
      ['citation', 'citation'],
      ['submitter', 'submitter'],
      ['sourceType', 'sourceType'],
      ['citationId', 'citationId'],
      ['molecularProfile', 'molecularProfileName'],
      ['disease', 'diseaseName'],
      ['therapies', 'therapyName'],
    ])
  })

  it('offers a sorter on every sortable column', () => {
    expect(
      spec.columns.filter((c) => c.sort).map((c) => c.sort!.column)
    ).toEqual([
      SourceSuggestionsSortColumns.Citation,
      SourceSuggestionsSortColumns.Submitter,
      SourceSuggestionsSortColumns.SourceType,
      SourceSuggestionsSortColumns.CitationId,
      SourceSuggestionsSortColumns.DiseaseName,
      SourceSuggestionsSortColumns.CreatedAt,
    ])
  })

  it('opens sorted by Submitted, newest first, descend-first cycling', () => {
    const sort = column('createdAt').sort
    expect(sort?.default).toBe('descend')
    expect(sort?.directions).toEqual(SORT_DESCEND_FIRST)
  })

  it('offers every source type — legacy omitted ASH and the preprint servers', () => {
    const filter = column('sourceType').filter
    if (filter?.kind !== 'enum') throw new Error('expected enum filter')
    expect(filter.options.map((o) => o.value)).toEqual([
      SourceSource.Pubmed,
      SourceSource.Asco,
      SourceSource.Ash,
      SourceSource.Biorxiv,
      SourceSource.Medrxiv,
    ])
  })

  it('hides the submitter filter on submitter-scoped embeds', () => {
    expect(column('submitter').filter).toBeDefined()

    const scoped = sourceSuggestionsTableConfig(
      TestBed.inject(BrowseSourceSuggestionsGQL),
      undefined,
      { submitterId: 7 },
      { hideSubmitterFilter: true }
    )
    expect(specColumn(scoped, 'submitter').filter).toBeUndefined()
  })
})

describe('cvc-source-suggestions-table facade', () => {
  let recorded: MockGraphqlOperation[]

  async function mount(
    inputs: Record<string, unknown> = {}
  ): Promise<ComponentFixture<CvcSourceSuggestionsTableComponent>> {
    recorded = []
    await TestBed.configureTestingModule({
      imports: [
        CvcSourceSuggestionsTableComponent,
        NzIconModule.forRoot([...TABLE_ICONS, DownloadOutline]),
      ],
      providers: [
        provideMockApollo(() => CONNECTION([ROW, SECOND_ROW]), recorded),
        // the downloader baked into the facade's toolbar injects the router
        provideRouter([]),
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(CvcSourceSuggestionsTableComponent)
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value)
    }
    fixture.detectChanges()
    return fixture
  }

  const requests = () =>
    recorded
      .filter((op) => op.operationName === 'BrowseSourceSuggestions')
      .map((op) => op.variables)

  it('opens filtered to NEW, sorted CreatedAt descending', async () => {
    const fixture = await mount()
    await settleTable(fixture)

    expect(requests().at(-1)).toMatchObject({
      first: 35,
      status: SourceSuggestionStatus.New,
      sortBy: {
        column: SourceSuggestionsSortColumns.CreatedAt,
        direction: SortDirection.Desc,
      },
    })
  })

  it('keeps the [sourceId] scope through filter changes — the legacy bug, fixed', async () => {
    const fixture = await mount({ sourceId: 42, submitterId: 7 })
    await settleTable(fixture)
    expect(requests().at(-1)).toMatchObject({ sourceId: 42, submitterId: 7 })

    const table = fixture.debugElement.children[0].componentInstance
    table.onFilterChange(
      table.columns().find((c: { key: string }) => c.key === 'disease'),
      'melanoma'
    )
    await settleTable(fixture)

    expect(requests().at(-1)).toMatchObject({
      sourceId: 42,
      submitterId: 7,
      diseaseName: 'melanoma',
    })
  })
})

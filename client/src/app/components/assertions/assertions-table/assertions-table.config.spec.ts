import { ActivatedRoute, convertToParamMap } from '@angular/router'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { DownloadOutline } from '@ant-design/icons-angular/icons'
import { SORT_DESCEND_FIRST } from '@app/tables'
import {
  AmpLevel,
  AssertionDirection,
  AssertionSignificance,
  AssertionSortColumns,
  AssertionType,
  EvidenceStatus,
  EvidenceStatusFilter,
  EvidenceType,
  TherapyInteraction,
} from '@app/generated/civic.apollo.types'
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
import { NzIconModule } from 'ng-zorro-antd/icon'
import { OperationDefinitionNode, visit } from 'graphql'
import { of } from 'rxjs'
import { beforeEach, describe, expect, it } from 'vitest'
import { CvcAssertionsTableComponent } from './assertions-table.component'
import { assertionsTableConfig } from './assertions-table.config'
import {
  AssertionBrowseFieldsFragment,
  AssertionsBrowseDocument,
  AssertionsBrowseGQL,
} from './assertions-table.query.gql.generated'

/**
 * The shared contract plus the invariants ported from the legacy table's
 * characterization spec (`assertions-table.component.spec.ts`, deleted with
 * the legacy component this facade replaces): filter→variable routing with
 * the declared∧used document walk, the AID prefix parse, the sortable
 * columns, the scope defaults, the grouped significance options, and — on
 * the mounted facade — the query-param prefilters and the scope menu's
 * status/subgroups wiring, including the two legacy bugs the facade fixes
 * (the radio ignoring `[status]`, and filter changes reverting the host's
 * scope).
 */

const ROW: AssertionBrowseFieldsFragment = {
  __typename: 'Assertion',
  id: 12,
  name: 'AID12',
  link: '/assertions/12',
  status: EvidenceStatus.Accepted,
  flagged: false,
  therapyInteractionType: TherapyInteraction.Substitutes,
  summary: 'A summary.',
  assertionType: AssertionType.Predictive,
  assertionDirection: AssertionDirection.Supports,
  significance: AssertionSignificance.Sensitivityresponse,
  ampLevel: AmpLevel.TierILevelA,
  evidenceItemsCount: 8,
  molecularProfile: {
    __typename: 'MolecularProfile',
    id: 12,
    name: 'BRAF V600E',
    link: '/molecular-profiles/12',
    flagged: false,
    deprecated: false,
    parsedName: [],
  },
  disease: {
    __typename: 'Disease',
    id: 7,
    name: 'Melanoma',
    link: '/diseases/7',
    deprecated: false,
  },
  therapies: [
    {
      __typename: 'Therapy',
      id: 3,
      name: 'Vemurafenib',
      link: '/therapies/3',
      deprecated: false,
    },
  ],
}

const SECOND_ROW: AssertionBrowseFieldsFragment = {
  ...ROW,
  id: 99,
  name: 'AID99',
  link: '/assertions/99',
  evidenceItemsCount: 2,
}

const CONNECTION = (rows: AssertionBrowseFieldsFragment[]) => ({
  assertions: {
    __typename: 'AssertionConnection',
    edges: rows.map((node) => ({ cursor: `c${node.id}`, node })),
    pageInfo: {
      __typename: 'PageInfo',
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: 'ca',
      endCursor: 'cb',
    },
    totalCount: 220,
  },
})

/** the variables the operation declares, e.g. `$ampLevel` */
function declaredVariables(): Set<string> {
  const operation = AssertionsBrowseDocument.definitions.find(
    (d): d is OperationDefinitionNode => d.kind === 'OperationDefinition'
  )
  return new Set(
    (operation?.variableDefinitions ?? []).map((v) => v.variable.name.value)
  )
}

/** the variables the operation actually passes to a field or input object */
function usedVariables(): Set<string> {
  const used = new Set<string>()
  visit(AssertionsBrowseDocument, {
    Argument: (node) => {
      visit(node.value, { Variable: (v) => void used.add(v.name.value) })
    },
  })
  return used
}

describe('assertionsTableConfig', () => {
  describeEntityTableContract({
    spec: () =>
      assertionsTableConfig(TestBed.inject(AssertionsBrowseGQL), 'Assertions'),
    operationName: 'AssertionsBrowse',
    rows: [ROW, SECOND_ROW],
    connection: (rows, pageInfo) => ({
      assertions: {
        __typename: 'AssertionConnection',
        edges: rows.map((node) => ({ cursor: `c${node.id}`, node })),
        pageInfo,
        totalCount: 220,
      },
    }),
    // the AID filter normalises before the query sees it
    filterInputs: { id: 'AID123' },
    // assertions returns real Assertions; everything normalises itself
    seeded: [],
  })

  let spec: ReturnType<typeof assertionsTableConfig>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockApollo(() => {
          throw new Error('no network expected')
        }),
      ],
    })
    spec = assertionsTableConfig(
      TestBed.inject(AssertionsBrowseGQL),
      'Assertions'
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
      ['id', 'id'],
      ['molecularProfile', 'molecularProfileName'],
      ['disease', 'diseaseName'],
      ['therapies', 'therapyName'],
      ['summary', 'summary'],
      ['assertionType', 'assertionType'],
      ['assertionDirection', 'assertionDirection'],
      ['significance', 'significance'],
      ['ampLevel', 'ampLevel'],
    ])
  })

  it('offers a sorter on every sortable column', () => {
    expect(
      spec.columns.filter((c) => c.sort).map((c) => c.sort!.column)
    ).toEqual([
      AssertionSortColumns.Id,
      AssertionSortColumns.DiseaseName,
      AssertionSortColumns.Summary,
      AssertionSortColumns.AssertionType,
      AssertionSortColumns.AssertionDirection,
      AssertionSortColumns.Significance,
      AssertionSortColumns.AmpLevel,
      AssertionSortColumns.EvidenceItemsCount,
    ])
  })

  it('cycles the evidence count descend-first, as the legacy table did', () => {
    expect(column('evidenceItemsCount').sort?.directions).toEqual(
      SORT_DESCEND_FIRST
    )
  })

  it('groups the significance options into the five legacy clinical contexts', () => {
    const filter = column('significance').filter
    expect(filter?.kind).toBe('enum')
    if (filter?.kind !== 'enum') return

    const groups = new Map<string, unknown[]>()
    for (const option of filter.options) {
      const list = groups.get(option.group!) ?? []
      list.push(option.value)
      groups.set(option.group!, list)
    }
    expect([...groups.keys()]).toEqual([
      'Predictive',
      'Prognostic',
      'Diagnostic',
      'Predisposing',
      'Oncogenic',
    ])
    // shared values repeat per context, exactly as the legacy select listed
    expect(groups.get('Predictive')).toContain(AssertionSignificance.Na)
    expect(groups.get('Prognostic')).toContain(AssertionSignificance.Na)
    for (const shared of [
      AssertionSignificance.Benign,
      AssertionSignificance.LikelyBenign,
      AssertionSignificance.UncertainSignificance,
    ]) {
      expect(groups.get('Predisposing')).toContain(shared)
      expect(groups.get('Oncogenic')).toContain(shared)
    }
  })

  it('omits FUNCTIONAL from the assertion type options', () => {
    const filter = column('assertionType').filter
    if (filter?.kind !== 'enum') throw new Error('expected enum filter')
    const values = filter.options.map((o) => o.value)
    expect(values).not.toContain(EvidenceType.Functional)
    expect(values).toHaveLength(5)
  })

  it('offers only the five assignable AMP tiers, in legacy order', () => {
    const filter = column('ampLevel').filter
    if (filter?.kind !== 'enum') throw new Error('expected enum filter')
    expect(filter.options.map((o) => o.value)).toEqual([
      AmpLevel.TierILevelA,
      AmpLevel.TierILevelB,
      AmpLevel.TierIiLevelC,
      AmpLevel.TierIiLevelD,
      AmpLevel.TierIii,
    ])
    expect(filter.showIcons).toBe(false)
  })

  it('renders the AMP category as compact label + verbose tooltip', () => {
    const cell = column('ampLevel').cell
    if (cell.kind !== 'text-tag') throw new Error('expected text-tag cell')
    expect(cell.label?.(ROW)).toBe('IA')
    expect(cell.text(ROW)).toBe('Tier I - Level A')
    expect(cell.label?.({ ...ROW, ampLevel: undefined })).toBeUndefined()
  })

  describe('host scope', () => {
    const gql = () => TestBed.inject(AssertionsBrowseGQL)

    it('defaults status to NON_REJECTED, as the legacy table always has', () => {
      expect(spec.scope['status']).toBe(EvidenceStatusFilter.NonRejected)
    })

    it('lets a host status override the default', () => {
      const scoped = assertionsTableConfig(gql(), undefined, {
        status: EvidenceStatusFilter.Submitted,
      })
      expect(scoped.scope['status']).toBe(EvidenceStatusFilter.Submitted)
    })

    it('passes entity-id scope and both organization wrappers through', () => {
      const scoped = assertionsTableConfig(gql(), undefined, {
        diseaseId: 7,
        organization: { ids: [4], includeSubgroups: true },
        approvingOrganizations: { ids: [9], includeSubgroups: true },
      })
      expect(scoped.scope).toMatchObject({
        diseaseId: 7,
        organization: { ids: [4], includeSubgroups: true },
        approvingOrganizations: { ids: [9], includeSubgroups: true },
      })
    })
  })
})

describe('cvc-assertions-table facade', () => {
  let recorded: MockGraphqlOperation[]

  async function mount(options: {
    inputs?: Record<string, unknown>
    queryParams?: Record<string, string>
  }): Promise<ComponentFixture<CvcAssertionsTableComponent>> {
    recorded = []
    const paramMap = convertToParamMap(options.queryParams ?? {})
    await TestBed.configureTestingModule({
      imports: [
        CvcAssertionsTableComponent,
        // the facade's toolbar adds cvc-table-downloader, whose icon the
        // table's own set does not carry
        NzIconModule.forRoot([...TABLE_ICONS, DownloadOutline]),
      ],
      providers: [
        provideMockApollo(() => CONNECTION([ROW, SECOND_ROW]), recorded),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: paramMap },
            queryParamMap: of(paramMap),
          },
        },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(CvcAssertionsTableComponent)
    for (const [key, value] of Object.entries(options.inputs ?? {})) {
      fixture.componentRef.setInput(key, value)
    }
    fixture.detectChanges()
    return fixture
  }

  const requests = () =>
    recorded
      .filter((op) => op.operationName === 'AssertionsBrowse')
      .map((op) => op.variables)

  it('opens with the defaults: first 25, NON_REJECTED, no org wrappers', async () => {
    const fixture = await mount({})
    await settleTable(fixture)

    expect(requests().at(-1)).toMatchObject({
      first: 25,
      status: EvidenceStatusFilter.NonRejected,
    })
    // unscoped hosts send no wrappers (legacy sent both, empty — the
    // resolvers treat empty and absent identically); undefined never
    // reaches the wire, JSON serialization strips it
    expect(requests().at(-1)!['organization']).toBeUndefined()
    expect(requests().at(-1)!['approvingOrganizations']).toBeUndefined()
  })

  it('seeds the scope from [status] — the radio no longer lies about the queue', async () => {
    const fixture = await mount({
      inputs: { status: EvidenceStatusFilter.Submitted },
    })
    await settleTable(fixture)

    expect(requests().at(-1)).toMatchObject({
      status: EvidenceStatusFilter.Submitted,
    })
    // and unlike legacy refresh(), a later filter change cannot revert it:
    // scope lives on the spec, filters in the table's own state
    const table = fixture.debugElement.children[0].componentInstance
    table.onFilterChange(
      table.columns().find((c: { key: string }) => c.key === 'disease'),
      'melanoma'
    )
    await settleTable(fixture)

    expect(requests().at(-1)).toMatchObject({
      status: EvidenceStatusFilter.Submitted,
      diseaseName: 'melanoma',
    })
  })

  it('prefilters from the clinical-significance-counts query params', async () => {
    const fixture = await mount({
      queryParams: {
        assertionType: 'PREDICTIVE',
        assertionDirection: 'SUPPORTS',
        significance: 'RESISTANCE',
        molecularProfileName: 'BRAF V600E',
        diseaseName: 'Melanoma',
      },
    })
    await settleTable(fixture)

    expect(requests().at(-1)).toMatchObject({
      assertionType: EvidenceType.Predictive,
      assertionDirection: 'SUPPORTS',
      significance: AssertionSignificance.Resistance,
      molecularProfileName: 'BRAF V600E',
      diseaseName: 'Melanoma',
    })
  })

  it('wraps the org scope with the ?includeSubgroups= param', async () => {
    const fixture = await mount({
      inputs: { organizationId: 5 },
      queryParams: { includeSubgroups: 'true' },
    })
    await settleTable(fixture)

    expect(requests().at(-1)).toMatchObject({
      organization: { ids: [5], includeSubgroups: true },
    })
    // the approving wrapper only exists when an approving org scopes the
    // table — legacy sent both wrappers always, empty or not
    expect(requests().at(-1)!['approvingOrganizations']).toBeUndefined()
  })
})

import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActivatedRoute, convertToParamMap } from '@angular/router'
import { DownloadOutline } from '@ant-design/icons-angular/icons'
import { SORT_DESCEND_FIRST } from '@app/tables'
import {
  EvidenceDirection,
  EvidenceLevel,
  EvidenceSignificance,
  EvidenceSortColumns,
  EvidenceStatus,
  EvidenceStatusFilter,
  EvidenceType,
  TherapyInteraction,
  VariantOrigin,
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
import { OperationDefinitionNode, visit } from 'graphql'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { of } from 'rxjs'
import { beforeEach, describe, expect, it } from 'vitest'
import { CvcEvidenceTableComponent } from './evidence-table.component'
import { evidenceTableConfig } from './evidence-table.config'
import {
  EvidenceBrowseDocument,
  EvidenceBrowseGQL,
  EvidenceGridFieldsFragment,
} from './evidence-table.query.gql.generated'

/**
 * The browse twin of `evidence-manager.config.spec.ts`: the shared contract
 * plus the invariants the compiler cannot see — filter→variable routing
 * (including the declared∧used document walk that caught the manager's
 * rating bug), sortable columns, the scope defaults, the molecular-profile
 * visibility option, and — on the mounted facade — that the folded INT
 * funnel reaches the wire alongside the therapy-name filter.
 */

const ROW: EvidenceGridFieldsFragment = {
  __typename: 'EvidenceItem',
  id: 812,
  name: 'EID812',
  link: '/evidence/812',
  status: EvidenceStatus.Accepted,
  flagged: false,
  therapyInteractionType: TherapyInteraction.Combination,
  description: 'A description.',
  evidenceType: EvidenceType.Predictive,
  evidenceDirection: EvidenceDirection.Supports,
  evidenceLevel: EvidenceLevel.B,
  evidenceRating: 4,
  significance: EvidenceSignificance.Sensitivityresponse,
  variantOrigin: VariantOrigin.Somatic,
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
  molecularProfile: {
    __typename: 'MolecularProfile',
    id: 12,
    name: 'BRAF V600E',
    link: '/molecular-profiles/12',
    flagged: false,
    deprecated: false,
    parsedName: [],
  },
}

const SECOND_ROW: EvidenceGridFieldsFragment = {
  ...ROW,
  id: 999,
  name: 'EID999',
  link: '/evidence/999',
  evidenceRating: 2,
}

/** the variables the operation declares, e.g. `$evidenceRating` */
function declaredVariables(): Set<string> {
  const operation = EvidenceBrowseDocument.definitions.find(
    (d): d is OperationDefinitionNode => d.kind === 'OperationDefinition'
  )
  return new Set(
    (operation?.variableDefinitions ?? []).map((v) => v.variable.name.value)
  )
}

/** the variables the operation actually passes to a field or input object */
function usedVariables(): Set<string> {
  const used = new Set<string>()
  visit(EvidenceBrowseDocument, {
    Argument: (node) => {
      visit(node.value, { Variable: (v) => void used.add(v.name.value) })
    },
  })
  return used
}

describe('evidenceTableConfig', () => {
  describeEntityTableContract({
    spec: () =>
      evidenceTableConfig(TestBed.inject(EvidenceBrowseGQL), 'Evidence'),
    operationName: 'EvidenceBrowse',
    rows: [ROW, SECOND_ROW],
    connection: (rows, pageInfo) => ({
      evidenceItems: {
        __typename: 'EvidenceItemConnection',
        edges: rows.map((node) => ({ cursor: `c${node.id}`, node })),
        pageInfo,
        totalCount: 11190,
      },
    }),
    // the EID filter normalises before the query sees it
    filterInputs: { id: 'EID123' },
    // evidenceItems returns real EvidenceItems; everything normalises itself
    seeded: [],
  })

  let spec: ReturnType<typeof evidenceTableConfig>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockApollo(() => {
          throw new Error('no network expected')
        }),
      ],
    })
    spec = evidenceTableConfig(TestBed.inject(EvidenceBrowseGQL), 'Evidence')
  })

  const column = (key: string) => specColumn(spec, key)

  it('routes every filter to a variable the query declares AND uses', () => {
    const declared = declaredVariables()
    const used = usedVariables()
    for (const col of spec.columns) {
      for (const filter of [col.filter, col.extraFilter]) {
        if (!filter) continue
        expect(declared.has(filter.var), `declared: ${filter.var}`).toBe(true)
        expect(used.has(filter.var), `used: ${filter.var}`).toBe(true)
      }
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
      ['description', 'description'],
      // the attribute filters are multi-selects on the plural server args
      ['evidenceLevel', 'evidenceLevels'],
      ['evidenceType', 'evidenceTypes'],
      ['evidenceDirection', 'evidenceDirections'],
      ['significance', 'significances'],
      ['variantOrigin', 'variantOrigins'],
      // the browse query's own name for the manager's `rating`
      ['evidenceRating', 'evidenceRatings'],
    ])
  })

  /**
   * The legacy INT column showed an interaction type it could not filter on:
   * EvidenceBrowse declared no therapyInteractionType variable, so the column
   * carried a sorter and nothing else. It is now a funnel beside the
   * Therapies name filter — the query declares the variable, the column is
   * gone, and its sorter went with it. The value itself still renders in
   * evidence popovers.
   */
  it('folds the legacy INT column into a Therapies interaction funnel', () => {
    expect(spec.columns.map((c) => c.key)).not.toContain(
      'therapyInteractionType'
    )
    const extra = column('therapies').extraFilter
    expect(extra?.var).toBe('therapyInteractionType')
    expect(extra?.options.map((o) => o.value)).toEqual(
      Object.values(TherapyInteraction)
    )
  })

  it('cycles the rating column descend-first, as the legacy table did', () => {
    expect(column('evidenceRating').sort?.directions).toEqual(
      SORT_DESCEND_FIRST
    )
  })

  it('offers a sorter on every sortable column', () => {
    expect(
      spec.columns.filter((c) => c.sort).map((c) => c.sort!.column)
    ).toEqual([
      EvidenceSortColumns.Id,
      EvidenceSortColumns.MolecularProfileName,
      EvidenceSortColumns.DiseaseName,
      EvidenceSortColumns.TherapyName,
      EvidenceSortColumns.Description,
      EvidenceSortColumns.EvidenceLevel,
      EvidenceSortColumns.EvidenceType,
      EvidenceSortColumns.EvidenceDirection,
      EvidenceSortColumns.Significance,
      EvidenceSortColumns.VariantOrigin,
      EvidenceSortColumns.EvidenceRating,
    ])
  })

  describe('host scope', () => {
    const gql = () => TestBed.inject(EvidenceBrowseGQL)

    it('defaults status to NON_REJECTED, as the legacy table always has', () => {
      expect(spec.scope['status']).toBe(EvidenceStatusFilter.NonRejected)
    })

    it('lets a host status override the default', () => {
      const scoped = evidenceTableConfig(gql(), undefined, {
        status: EvidenceStatusFilter.Submitted,
      })
      expect(scoped.scope['status']).toBe(EvidenceStatusFilter.Submitted)
    })

    it('passes entity-id scope and the organization filter through', () => {
      const scoped = evidenceTableConfig(gql(), undefined, {
        diseaseId: 7,
        organization: { ids: [4], includeSubgroups: true },
      })
      expect(scoped.scope).toMatchObject({
        diseaseId: 7,
        organization: { ids: [4], includeSubgroups: true },
      })
    })
  })

  it('hides the molecular-profile column on molecular-profile pages', () => {
    expect(column('molecularProfile').hidden).toBe(false)

    const embedded = evidenceTableConfig(
      TestBed.inject(EvidenceBrowseGQL),
      undefined,
      {},
      { displayMolecularProfile: false }
    )
    expect(specColumn(embedded, 'molecularProfile').hidden).toBe(true)
  })
})

/**
 * The facade mounted, so the folded funnel can be proven at the wire rather
 * than in the config: a mounted table is the only place `onExtraFilterChange`
 * and `onRemoveFilter('<key>:extra')` meet the query variables they produce.
 */
describe('cvc-evidence-table facade', () => {
  let recorded: MockGraphqlOperation[]

  async function mount(): Promise<ComponentFixture<CvcEvidenceTableComponent>> {
    recorded = []
    const paramMap = convertToParamMap({})
    await TestBed.configureTestingModule({
      imports: [
        CvcEvidenceTableComponent,
        // the facade's toolbar adds cvc-table-downloader, whose icon the
        // table's own set does not carry
        NzIconModule.forRoot([...TABLE_ICONS, DownloadOutline]),
      ],
      providers: [
        provideMockApollo(
          () => ({
            evidenceItems: {
              __typename: 'EvidenceItemConnection',
              edges: [ROW, SECOND_ROW].map((node) => ({
                cursor: `c${node.id}`,
                node,
              })),
              pageInfo: {
                __typename: 'PageInfo',
                hasNextPage: false,
                hasPreviousPage: false,
                startCursor: 'ca',
                endCursor: 'cb',
              },
              totalCount: 11190,
            },
          }),
          recorded
        ),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: paramMap },
            queryParamMap: of(paramMap),
          },
        },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(CvcEvidenceTableComponent)
    fixture.detectChanges()
    return fixture
  }

  const requests = () =>
    recorded
      .filter((op) => op.operationName === 'EvidenceBrowse')
      .map((op) => op.variables)

  it('sends the Therapies interaction funnel beside the therapy-name filter', async () => {
    const fixture = await mount()
    await settleTable(fixture)

    const table = fixture.debugElement.children[0].componentInstance
    const therapies = table
      .columns()
      .find((c: { key: string }) => c.key === 'therapies')
    table.onFilterChange(therapies, 'trametinib')
    table.onExtraFilterChange(therapies, TherapyInteraction.Combination)
    await settleTable(fixture)

    expect(requests().at(-1)).toMatchObject({
      therapyName: 'trametinib',
      therapyInteractionType: TherapyInteraction.Combination,
    })

    table.onRemoveFilter('therapies:extra')
    await settleTable(fixture)
    const last = requests().at(-1)!
    expect(last['therapyInteractionType']).toBeUndefined()
    expect(last).toMatchObject({ therapyName: 'trametinib' })
  })
})

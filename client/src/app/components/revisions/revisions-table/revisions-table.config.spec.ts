import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { ViewerService } from '@app/core/services/viewer/viewer.service'
import {
  ActivitySubjectInput,
  DateSortColumns,
  RevisionStatus,
  SortDirection,
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
import { of } from 'rxjs'
import { beforeEach, describe, expect, it } from 'vitest'
import { CvcRevisionsTableComponent } from './revisions-table.component'
import { revisionsTableConfig } from './revisions-table.config'
import {
  RevisionsBrowseDocument,
  RevisionsBrowseGQL,
  RevisionSetBrowseFieldsFragment,
} from './revisions-table.query.gql.generated'

/**
 * The shared contract plus the invariants ported from the legacy table's
 * characterization spec (`revisions-table.component.spec.ts`, deleted with
 * the legacy component): filter→variable routing with the declared∧used
 * walk, the ids/status coupling, and — on the mounted facade — the
 * exclude-own-revisions scope with a stubbed signed-in viewer (out of the
 * characterization harness's reach). The Submitted sort is NEW relative to
 * legacy, which had zero sortable columns.
 */

const ROW = {
  __typename: 'RevisionSet',
  id: 42,
  name: 'RS42',
  revisions: [
    {
      __typename: 'Revision',
      id: 420,
      name: 'REV420',
      status: RevisionStatus.New,
      currentValue: 'old',
      suggestedValue: 'new',
      fieldName: 'description',
      fieldDisplayName: 'Description',
      link: '/revisions/420',
      subject: { __typename: 'Variant' },
    },
  ],
  creationActivity: {
    __typename: 'SuggestRevisionSetActivity',
    createdAt: '2026-02-01T12:00:00Z',
    subject: {
      __typename: 'GeneVariant',
      id: 12,
      name: 'V600E',
      link: '/variants/12',
      feature: {
        __typename: 'Feature',
        id: 5,
        name: 'BRAF',
        link: '/features/5',
      },
    },
    user: {
      __typename: 'User',
      id: 9,
      displayName: 'jdoe',
      role: UserRole.Curator,
    },
    parsedNote: [],
    organization: { __typename: 'Organization', id: 2, name: 'WashU' },
  },
} as unknown as RevisionSetBrowseFieldsFragment

const SECOND_ROW = {
  ...ROW,
  id: 43,
  name: 'RS43',
} as RevisionSetBrowseFieldsFragment

const CONNECTION = (rows: RevisionSetBrowseFieldsFragment[]) => ({
  revisionSets: {
    __typename: 'RevisionSetConnection',
    edges: rows.map((node) => ({ cursor: `c${node.id}`, node })),
    pageInfo: {
      __typename: 'PageInfo',
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: 'ca',
      endCursor: 'cb',
    },
    totalCount: 65396,
  },
})

function declaredVariables(): Set<string> {
  const operation = RevisionsBrowseDocument.definitions.find(
    (d): d is OperationDefinitionNode => d.kind === 'OperationDefinition'
  )
  return new Set(
    (operation?.variableDefinitions ?? []).map((v) => v.variable.name.value)
  )
}

function usedVariables(): Set<string> {
  const used = new Set<string>()
  visit(RevisionsBrowseDocument, {
    Argument: (node) => {
      visit(node.value, { Variable: (v) => void used.add(v.name.value) })
    },
  })
  return used
}

describe('revisionsTableConfig', () => {
  describeEntityTableContract({
    spec: () =>
      revisionsTableConfig(TestBed.inject(RevisionsBrowseGQL), 'Revisions'),
    operationName: 'RevisionsBrowse',
    rows: [ROW, SECOND_ROW],
    connection: (rows, pageInfo) => ({
      revisionSets: {
        __typename: 'RevisionSetConnection',
        edges: rows.map((node) => ({ cursor: `c${node.id}`, node })),
        pageInfo,
        totalCount: 65396,
      },
    }),
    seeded: [],
  })

  let spec: ReturnType<typeof revisionsTableConfig>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockApollo(() => {
          throw new Error('no network expected')
        }),
      ],
    })
    spec = revisionsTableConfig(TestBed.inject(RevisionsBrowseGQL), 'Revisions')
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
      ['subject', 'subjectType'],
      ['submitter', 'originatingUserName'],
      ['organization', 'organizationName'],
      ['fields', 'fieldName'],
    ])
  })

  it('offers exactly the six legacy subject types', () => {
    const filter = column('subject').filter
    if (filter?.kind !== 'enum') throw new Error('expected enum filter')
    expect(filter.options.map((o) => o.value)).toEqual([
      ActivitySubjectInput.Assertion,
      ActivitySubjectInput.EvidenceItem,
      ActivitySubjectInput.Feature,
      ActivitySubjectInput.MolecularProfile,
      ActivitySubjectInput.Variant,
      ActivitySubjectInput.VariantGroup,
    ])
  })

  it('adds the Submitted sort legacy lacked: created, newest first', () => {
    const sort = column('createdAt').sort
    expect(sort?.column).toBe(DateSortColumns.Created)
    expect(sort?.default).toBe('descend')
    expect(sort?.directions).toEqual(SORT_DESCEND_FIRST)
  })

  describe('host scope', () => {
    it('defaults to the NEW pending queue', () => {
      expect(spec.scope['status']).toBe(RevisionStatus.New)
    })

    it('an ids scope drops the status filter — search names sets of any status', () => {
      const scoped = revisionsTableConfig(
        TestBed.inject(RevisionsBrowseGQL),
        undefined,
        { ids: [42, 43] }
      )
      expect(scoped.scope['ids']).toEqual([42, 43])
      expect(scoped.scope['status']).toBeUndefined()
    })
  })
})

describe('cvc-revisions-table facade', () => {
  let recorded: MockGraphqlOperation[]

  async function mount(
    inputs: Record<string, unknown> = {}
  ): Promise<ComponentFixture<CvcRevisionsTableComponent>> {
    recorded = []
    await TestBed.configureTestingModule({
      imports: [CvcRevisionsTableComponent, NzIconModule.forRoot(TABLE_ICONS)],
      providers: [
        provideMockApollo(() => CONNECTION([ROW, SECOND_ROW]), recorded),
        provideRouter([]),
        {
          provide: ViewerService,
          useValue: {
            viewer$: of({ signedIn: true, user: { id: 33 } }),
          },
        },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(CvcRevisionsTableComponent)
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value)
    }
    fixture.detectChanges()
    return fixture
  }

  const requests = () =>
    recorded
      .filter((op) => op.operationName === 'RevisionsBrowse')
      .map((op) => op.variables)

  it('opens on the NEW queue with the explicit created-descend sort', async () => {
    const fixture = await mount()
    await settleTable(fixture)

    expect(requests().at(-1)).toMatchObject({
      first: 25,
      status: RevisionStatus.New,
      sortBy: {
        column: DateSortColumns.Created,
        direction: SortDirection.Desc,
      },
    })
  })

  it('exclude-own scopes by the signed-in viewer id', async () => {
    const fixture = await mount()
    await settleTable(fixture)
    expect(requests().at(-1)!['excludeRevisionsFromUserId']).toBeUndefined()

    const facade = fixture.componentInstance as unknown as {
      onExcludeOwnChange(exclude: boolean): void
    }
    facade.onExcludeOwnChange(true)
    await settleTable(fixture)

    expect(requests().at(-1)).toMatchObject({
      excludeRevisionsFromUserId: 33,
      status: RevisionStatus.New,
    })
  })
})

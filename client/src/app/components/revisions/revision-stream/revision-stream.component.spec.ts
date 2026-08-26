import { Component, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { ActivatedRoute, provideRouter } from '@angular/router'
import { InternalRefetchQueryDescriptor } from '@apollo/client'
import {
  ModeratedEntities,
  ModeratedInput,
} from '@app/generated/civic.apollo.types'
import { CvcEntityStreamComponent } from '@app/streams/entity-stream.component'
import {
  MockGraphqlOperation,
  provideMockApollo,
} from '@app/testing/apollo-test.providers'
import { STREAM_ICONS, settleStream } from '@app/testing/entity-stream.harness'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { BehaviorSubject } from 'rxjs'
import { beforeEach, describe, expect, it } from 'vitest'
import { CvcRevisionStream } from './revision-stream.component'
import { RevisionStreamState } from './revision-stream-state'
import { RevisionStreamNode } from './revision-stream.types'

/**
 * The facade's wire behavior and the D-list rulings, driven through a
 * mounted `cvc-revision-stream` against a recording mock link. Successor
 * to the legacy characterization suite's facade-level specs; the two
 * `defect:` specs it carried are reversed here and in the variants page
 * spec.
 */

const subject: ModeratedInput = {
  id: 42,
  entityType: ModeratedEntities.EvidenceItem,
}

function revisionNode(id: number, name: string): Record<string, unknown> {
  return {
    __typename: 'Revision',
    id,
    revisionSetId: 100,
    createdAt: '2026-08-01T00:00:00Z',
    fieldName: name.toLowerCase(),
    currentValue: 'old',
    suggestedValue: 'new',
    status: 'NEW',
    linkoutData: {
      __typename: 'LinkoutData',
      name,
      diffValue: { __typename: 'ScalarFieldDiff', left: 'old', right: 'new' },
    },
    creationActivity: null,
    resolutionActivity: null,
  }
}

function revisionsResponse(): Record<string, unknown> {
  return {
    revisions: {
      __typename: 'RevisionConnection',
      totalCount: 2,
      unfilteredCountForSubject: 5,
      uniqueRevisors: [],
      uniqueResolvers: [],
      revisedFieldNames: [],
      pageInfo: {
        __typename: 'PageInfo',
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: 'a',
        endCursor: 'b',
      },
      edges: [
        { __typename: 'RevisionEdge', cursor: 'a', node: revisionNode(1, 'Description') },
        { __typename: 'RevisionEdge', cursor: 'b', node: revisionNode(2, 'Significance') },
      ],
    },
  }
}

@Component({
  imports: [CvcRevisionStream],
  template: `<cvc-revision-stream
    [cvcModerated]="moderated()"
    [cvcModerationRefetch]="extraRefetch()" />`,
})
class HostComponent {
  readonly moderated = signal<ModeratedInput>(subject)
  readonly extraRefetch = signal<InternalRefetchQueryDescriptor[]>([])
}

describe('CvcRevisionStream (facade wire behavior)', () => {
  let operations: MockGraphqlOperation[]
  let queryParams$: BehaviorSubject<Record<string, unknown>>
  let fixture: ComponentFixture<HostComponent>

  function requests(): Record<string, any>[] {
    return operations
      .filter((op) => op.operationName === 'RevisionStream')
      .map((op) => op.variables)
  }

  async function mount(): Promise<void> {
    TestBed.resetTestingModule()
    await TestBed.configureTestingModule({
      imports: [HostComponent, NzIconModule.forRoot(STREAM_ICONS)],
      providers: [
        provideMockApollo((op) => {
          switch (op.operationName) {
            case 'RevisionStream':
              return revisionsResponse()
            case 'ValidateRevisionsForAcceptance':
              return {
                validateRevisionsForAcceptance: {
                  __typename: 'ValidationErrors',
                  genericErrors: [],
                  validationErrors: [],
                },
              }
            case 'ViewerBase':
              return { viewer: null }
            default:
              return {}
          }
        }, operations),
        provideRouter([]),
        provideNoopAnimations(),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParams$,
            params: new BehaviorSubject({}),
          },
        },
      ],
    }).compileComponents()
    fixture = TestBed.createComponent(HostComponent)
    fixture.detectChanges()
    await settleStream(fixture)
  }

  function facadeState(): RevisionStreamState {
    return fixture.debugElement.children[0].injector.get(RevisionStreamState)
  }

  function stream(): CvcEntityStreamComponent<RevisionStreamNode> {
    return fixture.debugElement.query(
      (el) => el.componentInstance instanceof CvcEntityStreamComponent
    ).componentInstance
  }

  beforeEach(() => {
    operations = []
    queryParams$ = new BehaviorSubject<Record<string, unknown>>({})
  })

  it('opens on the subject with page size 10 and status NEW', async () => {
    await mount()

    const opening = requests()
    expect(opening).toHaveLength(1)
    expect(opening[0]).toMatchObject({ first: 10, subject, status: 'NEW' })
    expect(Object.keys(opening[0])).not.toContain('revisionSetId')
  })

  it('D2: a revisionSetId deep link shows the whole set — status cleared', async () => {
    queryParams$ = new BehaviorSubject<Record<string, unknown>>({
      revisionSetId: '99',
    })
    await mount()

    const opening = requests().at(-1)!
    expect(opening).toMatchObject({ first: 10, subject, revisionSetId: 99 })
    expect(Object.keys(opening)).not.toContain('status')
  })

  it('D2: Show Group sends the same whole-set variables as the deep link', async () => {
    await mount()

    facadeState().selectGroup(100)
    await settleStream(fixture)

    const sent = requests().at(-1)!
    expect(sent).toMatchObject({ first: 10, subject, revisionSetId: 100 })
    // cleared on the refetch path: the key rides along as an explicit
    // undefined (apollo merges partial variables), never as a value
    expect(sent['status']).toBeUndefined()
  })

  it('D1: selection survives paging, clears when a filter changes', async () => {
    await mount()

    stream().selectedIds.set([1])
    await settleStream(fixture)
    expect(facadeState().selectedIds()).toEqual([1])

    // paging is not a filter change
    void stream().query.fetchMore({ first: 10, after: 'b' })
    await settleStream(fixture)
    expect(facadeState().selectedIds()).toEqual([1])

    // engaging the group filter is
    facadeState().selectGroup(100)
    await settleStream(fixture)
    expect(facadeState().selectedIds()).toEqual([])
  })

  it('validates the selected set on every selection change', async () => {
    await mount()

    stream().selectedIds.set([1, 2])
    await settleStream(fixture)

    const validations = operations.filter(
      (op) => op.operationName === 'ValidateRevisionsForAcceptance'
    )
    expect(validations.at(-1)?.variables).toEqual({ ids: [1, 2] })
  })

  it('D3: the moderation fan-out joins the registry entries with host extras', async () => {
    await mount()

    const extra = { query: 'BadgeDoc' } as unknown as InternalRefetchQueryDescriptor
    fixture.componentInstance.extraRefetch.set([extra])
    await settleStream(fixture)

    const fanOut = facadeState().refetchQueries
    // the registry's EvidenceItem entries (detail + summary) plus the extra
    expect(fanOut).toHaveLength(3)
    expect(fanOut.at(-1)).toBe(extra)
  })
})

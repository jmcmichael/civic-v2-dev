import {
  ActivitySubjectInput,
  RevisionStatus,
} from '@app/generated/civic.apollo.types'
import {
  describeLegacyTableCharacterization,
  mountLegacyTable,
  type LegacyTableDescriptor,
} from '@app/testing/legacy-table.harness'
import { describe, expect, it } from 'vitest'
import { CvcRevisionsTableComponent } from './revisions-table.component'
import { CvcRevisionsTableModule } from './revisions-table.module'

/**
 * Characterization of the LEGACY revisions browse table's FLAT behaviors,
 * committed before the migration commit deletes it. Row expansion is
 * deliberately not characterized: the migration drops it by design (the
 * revision diff details belong to the entity revise pages, queued for the
 * activity-feed abstraction project), and it never worked visually anyway —
 * the fixed-29px virtual scroll can't account for variable detail heights.
 *
 * Also not characterized: the exclude-own-revisions checkbox — it reads the
 * signed-in viewer's id, and the harness answers ViewerBase with a null
 * viewer; the migrated facade covers it with a stubbed viewer instead.
 */

const CONNECTION = {
  revisionSets: {
    __typename: 'RevisionSetConnection',
    totalCount: 0,
    pageInfo: {
      __typename: 'PageInfo',
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
    edges: [],
  },
}

const descriptor: LegacyTableDescriptor<CvcRevisionsTableComponent> = {
  component: CvcRevisionsTableComponent,
  module: CvcRevisionsTableModule,
  operationName: 'RevisionsBrowse',
  respond: () => CONNECTION,
  // no sortBy at all: the legacy table has ZERO sortable columns; the server
  // default (revision_sets.created_at DESC) orders every result set
  opening: {
    first: 25,
    status: RevisionStatus.New,
  },
  filters: [
    {
      name: 'field name',
      apply: (c) => {
        c.fieldNameInput = 'description'
        c.onModelChanged()
      },
      sends: { fieldName: 'description' },
    },
    {
      name: 'originating user name',
      apply: (c) => {
        c.originatingUserNameInput = 'jdoe'
        c.onModelChanged()
      },
      sends: { originatingUserName: 'jdoe' },
    },
    {
      name: 'organization name',
      apply: (c) => {
        c.organizationNameInput = 'WashU'
        c.onModelChanged()
      },
      sends: { organizationName: 'WashU' },
    },
    {
      name: 'subject type',
      apply: (c) => {
        c.subjectTypeInput = ActivitySubjectInput.Variant
        c.onModelChanged()
      },
      sends: { subjectType: ActivitySubjectInput.Variant },
    },
  ],
  // no sorts: nothing sortable in the legacy table
  idsRefetch: true,
}

describe('CvcRevisionsTableComponent (legacy)', () => {
  describeLegacyTableCharacterization(descriptor)

  it('an [ids] scope drops the NEW status filter', async () => {
    // search-result mode: ids name specific sets, whatever their status
    const h = await mountLegacyTable({
      ...descriptor,
      inputs: { ids: [42, 43] },
      opening: { first: 25, ids: [42, 43] },
    })
    await h.settle()

    const opening = h.requests()[0]
    expect(opening).toMatchObject({ ids: [42, 43] })
    expect(opening['status']).toBeUndefined()
  })
})

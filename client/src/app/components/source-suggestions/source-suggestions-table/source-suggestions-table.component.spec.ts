import {
  SortDirection,
  SourceSource,
  SourceSuggestionsSortColumns,
  SourceSuggestionStatus,
} from '@app/generated/civic.apollo.types'
import {
  describeLegacyTableCharacterization,
  mountLegacyTable,
  type LegacyTableDescriptor,
} from '@app/testing/legacy-table.harness'
import { describe, expect, it } from 'vitest'
import { CvcSourceSuggestionsTableComponent } from './source-suggestions-table.component'
import { CvcSourceSuggestionsTableModule } from './source-suggestions-table.module'

/**
 * Characterization of the LEGACY source-suggestions browse table, committed
 * before the migration commit deletes it. Every wire expectation is ported
 * into the migrated facade's `source-suggestions-table.config.spec.ts`.
 *
 * Not characterized here: the manage-popover mutation flow — it lives in the
 * separate `CvcUpdateSourceSuggestionForm`, which the migration keeps; only
 * the table's own query wiring dies with this component.
 */

const CONNECTION = {
  sourceSuggestions: {
    __typename: 'SourceSuggestionConnection',
    totalCount: 0,
    filteredCount: 0,
    pageCount: 0,
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

const descriptor: LegacyTableDescriptor<CvcSourceSuggestionsTableComponent> = {
  component: CvcSourceSuggestionsTableComponent,
  module: CvcSourceSuggestionsTableModule,
  operationName: 'BrowseSourceSuggestions',
  respond: () => CONNECTION,
  opening: {
    first: 35,
    status: SourceSuggestionStatus.New,
    sortBy: {
      column: SourceSuggestionsSortColumns.CreatedAt,
      direction: SortDirection.Desc,
    },
  },
  filters: [
    {
      name: 'citation',
      apply: (c) => {
        c.citationInput = 'BRAF melanoma'
        c.filterChange$.next()
      },
      sends: { citation: 'BRAF melanoma' },
    },
    {
      name: 'submitter',
      apply: (c) => {
        c.submitterInput = 'jdoe'
        c.filterChange$.next()
      },
      sends: { submitter: 'jdoe' },
    },
    {
      name: 'source type',
      apply: (c) => {
        c.sourceTypeInput = SourceSource.Asco
        c.filterChange$.next()
      },
      sends: { sourceType: SourceSource.Asco },
    },
    {
      name: 'citation id (string coerced to number)',
      apply: (c) => {
        c.citationIdInput = '12345'
        c.filterChange$.next()
      },
      sends: { citationId: 12345 },
    },
    {
      name: 'molecular profile name',
      apply: (c) => {
        c.molecularProfileNameInput = 'V600E'
        c.filterChange$.next()
      },
      sends: { molecularProfileName: 'V600E' },
    },
    {
      name: 'disease name',
      apply: (c) => {
        c.diseaseNameInput = 'melanoma'
        c.filterChange$.next()
      },
      sends: { diseaseName: 'melanoma' },
    },
    {
      name: 'status',
      apply: (c) => {
        c.statusInput = SourceSuggestionStatus.Curated
        c.filterChange$.next()
      },
      sends: { status: SourceSuggestionStatus.Curated },
    },
  ],
  sorts: [
    {
      name: 'citation ascend',
      apply: (c) =>
        c.sortChange$.next({
          key: SourceSuggestionsSortColumns.Citation,
          value: 'ascend',
        }),
      sends: {
        sortBy: {
          column: SourceSuggestionsSortColumns.Citation,
          direction: SortDirection.Asc,
        },
      },
    },
    {
      name: 'submitted descend',
      apply: (c) =>
        c.sortChange$.next({
          key: SourceSuggestionsSortColumns.CreatedAt,
          value: 'descend',
        }),
      sends: {
        sortBy: {
          column: SourceSuggestionsSortColumns.CreatedAt,
          direction: SortDirection.Desc,
        },
      },
    },
  ],
  // the table has no [ids] input
  idsRefetch: false,
}

describe('CvcSourceSuggestionsTableComponent (legacy)', () => {
  describeLegacyTableCharacterization(descriptor)

  it('opens scoped by [sourceId] and [submitterId]', async () => {
    const h = await mountLegacyTable({
      ...descriptor,
      inputs: { sourceId: 42, submitterId: 7 },
      opening: { ...descriptor.opening, sourceId: 42, submitterId: 7 },
    })
    await h.settle()

    expect(h.requests()[0]).toMatchObject({ sourceId: 42, submitterId: 7 })
  })

  it('LEGACY BUG: any filter change clobbers the [sourceId] scope', async () => {
    // refresh() rebuilds sourceId from the UI-less sourceIdInput filter
    // field — explicitly undefined — so one keystroke in any filter widens a
    // sources-summary-embedded table to ALL suggestions. submitterId is
    // omitted from refresh() entirely, so Apollo's variable merge retains
    // it. The migrated facade keeps both in spec scope, immune by
    // construction.
    const h = await mountLegacyTable({
      ...descriptor,
      inputs: { sourceId: 42, submitterId: 7 },
      opening: { ...descriptor.opening, sourceId: 42, submitterId: 7 },
    })
    await h.settle()

    h.component.diseaseNameInput = 'melanoma'
    h.component.filterChange$.next()
    await h.settle()

    const last = h.requests().at(-1)!
    expect(last['sourceId']).toBeUndefined()
    expect(last).toMatchObject({ submitterId: 7, diseaseName: 'melanoma' })
  })
})

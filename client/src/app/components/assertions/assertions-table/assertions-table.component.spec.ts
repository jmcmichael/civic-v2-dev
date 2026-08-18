import {
  AmpLevel,
  AssertionSignificance,
  AssertionSortColumns,
  EvidenceDirection,
  EvidenceStatusFilter,
  EvidenceType,
} from '@app/generated/civic.apollo.types'
import {
  describeLegacyTableCharacterization,
  mountLegacyTable,
  type LegacyTableDescriptor,
} from '@app/testing/legacy-table.harness'
import { describe, expect, it } from 'vitest'
import { CvcAssertionsTableComponent } from './assertions-table.component'
import { CvcAssertionsTableModule } from './assertions-table.module'

/**
 * Characterization of the LEGACY assertions browse table, committed before the
 * migration commit deletes it (the parity net the clone-table batch never
 * preserved — see the audit's process note). Every wire expectation here is
 * ported into the migrated facade's `assertions-table.config.spec.ts`.
 *
 * Not characterized here: the constructor's `queryParamMap` seeding of five
 * column filters (assertionType, assertionDirection, significance,
 * molecularProfileName, diseaseName) plus `includeSubgroups` — the harness
 * mounts with an empty router, so that wiring is asserted on the migrated
 * facade and live-verified via a `clinical-significance-counts` link instead.
 */

const CONNECTION = {
  assertions: {
    __typename: 'AssertionConnection',
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

const descriptor: LegacyTableDescriptor<CvcAssertionsTableComponent> = {
  component: CvcAssertionsTableComponent,
  module: CvcAssertionsTableModule,
  operationName: 'AssertionsBrowse',
  respond: () => CONNECTION,
  opening: {
    first: 25,
    status: EvidenceStatusFilter.NonRejected,
    // organizationFilter() always sends both wrappers, empty when unscoped
    organization: { ids: [], includeSubgroups: false },
    approvingOrganizations: { ids: [], includeSubgroups: false },
  },
  filters: [
    {
      name: 'AID (prefixed)',
      apply: (c) => {
        c.aidInput = 'AID12'
        c.onModelChanged()
      },
      sends: { id: 12 },
    },
    {
      name: 'molecular profile name',
      apply: (c) => {
        c.molecularProfileNameInput = 'V600E'
        c.onModelChanged()
      },
      sends: { molecularProfileName: 'V600E' },
    },
    {
      name: 'disease name',
      apply: (c) => {
        c.diseaseNameInput = 'melanoma'
        c.onModelChanged()
      },
      sends: { diseaseName: 'melanoma' },
    },
    {
      name: 'therapy name',
      apply: (c) => {
        c.therapyNameInput = 'dabrafenib'
        c.onModelChanged()
      },
      sends: { therapyName: 'dabrafenib' },
    },
    {
      name: 'summary',
      apply: (c) => {
        c.summaryInput = 'resistance'
        c.onModelChanged()
      },
      sends: { summary: 'resistance' },
    },
    {
      name: 'assertion type',
      apply: (c) => {
        c.assertionTypeInput = EvidenceType.Predictive
        c.onModelChanged()
      },
      sends: { assertionType: EvidenceType.Predictive },
    },
    {
      name: 'assertion direction',
      apply: (c) => {
        c.assertionDirectionInput = EvidenceDirection.Supports
        c.onModelChanged()
      },
      sends: { assertionDirection: EvidenceDirection.Supports },
    },
    {
      name: 'significance',
      apply: (c) => {
        c.SignificanceInput = AssertionSignificance.AdverseResponse
        c.onModelChanged()
      },
      sends: { significance: AssertionSignificance.AdverseResponse },
    },
    {
      name: 'AMP level',
      apply: (c) => {
        c.ampLevelInput = AmpLevel.TierILevelA
        c.onModelChanged()
      },
      sends: { ampLevel: AmpLevel.TierILevelA },
    },
  ],
  sorts: [
    {
      name: 'disease name ascend',
      apply: (c) =>
        c.sortChange$.next({
          key: AssertionSortColumns.DiseaseName,
          value: 'ascend',
        }),
      sends: {
        sortBy: { column: AssertionSortColumns.DiseaseName, direction: 'ASC' },
      },
    },
    {
      name: 'evidence items count descend',
      apply: (c) =>
        c.sortChange$.next({
          key: AssertionSortColumns.EvidenceItemsCount,
          value: 'descend',
        }),
      sends: {
        sortBy: {
          column: AssertionSortColumns.EvidenceItemsCount,
          direction: 'DESC',
        },
      },
    },
  ],
  // ngOnChanges watches 'ids'; refresh() re-reads this.ids, so the new value
  // really lands on the wire (unlike the batch's users/sources/mp bugs)
}

describe('CvcAssertionsTableComponent (legacy)', () => {
  describeLegacyTableCharacterization(descriptor)

  it('parses a bare numeric AID filter', async () => {
    const h = await mountLegacyTable(descriptor)
    await h.settle()

    h.component.aidInput = '34'
    h.component.onModelChanged()
    await h.settle()

    expect(h.requests().at(-1)).toMatchObject({ id: 34 })
  })

  it('opens scoped by the [status] input', async () => {
    const h = await mountLegacyTable({
      ...descriptor,
      inputs: { status: EvidenceStatusFilter.Submitted },
      opening: { status: EvidenceStatusFilter.Submitted },
    })
    await h.settle()

    expect(h.requests()[0]).toMatchObject({
      status: EvidenceStatusFilter.Submitted,
    })
  })

  it('LEGACY BUG: any filter change reverts the [status] scope to the menu default', async () => {
    // refresh() sends statusInput (the scope menu's state, initialized to
    // NON_REJECTED regardless of the [status] input), so one keystroke in any
    // filter silently widens/narrows the host page's scope. The pending
    // queue's SUBMITTED and query-search's ALL both regress this way. The
    // migrated facade seeds its status signal from [status] instead.
    const h = await mountLegacyTable({
      ...descriptor,
      inputs: { status: EvidenceStatusFilter.Submitted },
      opening: { status: EvidenceStatusFilter.Submitted },
    })
    await h.settle()

    h.component.diseaseNameInput = 'melanoma'
    h.component.onModelChanged()
    await h.settle()

    expect(h.requests().at(-1)).toMatchObject({
      status: EvidenceStatusFilter.NonRejected,
      diseaseName: 'melanoma',
    })
  })

  it('scope menu: status radio refetches with the chosen status', async () => {
    const h = await mountLegacyTable(descriptor)
    await h.settle()

    h.component.statusInput = EvidenceStatusFilter.Accepted
    h.component.statusChanged()
    await h.settle()

    expect(h.requests().at(-1)).toMatchObject({
      status: EvidenceStatusFilter.Accepted,
    })
  })

  it('scope menu: include-subgroups feeds BOTH organization wrappers', async () => {
    const h = await mountLegacyTable({
      ...descriptor,
      inputs: { organizationId: 5 },
      opening: {
        ...descriptor.opening,
        organization: { ids: [5], includeSubgroups: false },
      },
    })
    await h.settle()
    expect(h.requests()[0]).toMatchObject({
      organization: { ids: [5], includeSubgroups: false },
    })

    h.component.includeSubgroups = true
    h.component.includeSubgroupsChanged()
    await h.settle()

    // one shared flag: the approving-organizations wrapper picks it up too,
    // even though this embed only scopes by submitting organization
    expect(h.requests().at(-1)).toMatchObject({
      organization: { ids: [5], includeSubgroups: true },
      approvingOrganizations: { ids: [], includeSubgroups: true },
    })
  })
})

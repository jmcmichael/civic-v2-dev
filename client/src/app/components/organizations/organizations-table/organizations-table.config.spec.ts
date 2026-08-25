import { TestBed } from '@angular/core/testing'
import { OrganizationSortColumns } from '@app/generated/civic.apollo.types'
import { provideMockApollo } from '@app/testing/apollo-test.providers'
import {
  describeEntityTableContract,
  specCell,
  specColumn,
} from '@app/testing/entity-table.harness'
import { OperationDefinitionNode, visit } from 'graphql'
import { beforeEach, describe, expect, it } from 'vitest'
import { organizationsTableConfig } from './organizations-table.config'
import {
  OrganizationBrowseTableRowFieldsFragment,
  OrganizationsBrowseDocument,
  OrganizationsBrowseGQL,
} from './organizations-table.query.gql.generated'

/**
 * The parity net ported from the (now-deleted) legacy
 * `organizations-table.characterization.spec.ts`: the shared contract plus
 * the invariants the compiler cannot see — filter -> variable routing
 * (including the declared∧used document walk) and sortable columns (none
 * defaulted, matching the legacy table's unsorted opening query). No host
 * scope: the legacy table has no `ids`/entity-id input.
 */

const ROW: OrganizationBrowseTableRowFieldsFragment = {
  __typename: 'BrowseOrganization',
  id: 4,
  name: 'ClinGen',
  description: 'Clinical Genome Resource',
  url: 'https://clinicalgenome.org',
  memberCount: 12,
  activityCount: 340,
  mostRecentActivityTimestamp: '2026-08-01T00:00:00Z',
  childOrganizations: [
    { __typename: 'Organization', id: 9, name: 'ClinGen Somatic' },
  ],
}

const SECOND_ROW: OrganizationBrowseTableRowFieldsFragment = {
  ...ROW,
  id: 7,
  name: 'Washington University in Saint Louis',
  childOrganizations: [],
}

/** the variables the operation declares, e.g. `$name` */
function declaredVariables(): Set<string> {
  const operation = OrganizationsBrowseDocument.definitions.find(
    (d): d is OperationDefinitionNode => d.kind === 'OperationDefinition'
  )
  return new Set(
    (operation?.variableDefinitions ?? []).map((v) => v.variable.name.value)
  )
}

/** the variables the operation actually passes to a field or input object */
function usedVariables(): Set<string> {
  const used = new Set<string>()
  visit(OrganizationsBrowseDocument, {
    Argument: (node) => {
      visit(node.value, { Variable: (v) => void used.add(v.name.value) })
    },
  })
  return used
}

describe('organizationsTableConfig', () => {
  describeEntityTableContract({
    spec: () =>
      organizationsTableConfig(
        TestBed.inject(OrganizationsBrowseGQL),
        'Organizations'
      ),
    operationName: 'OrganizationsBrowse',
    rows: [ROW, SECOND_ROW],
    connection: (rows, pageInfo) => ({
      browseOrganizations: {
        __typename: 'BrowseOrganizationConnection',
        edges: rows.map((node) => ({ cursor: `c${node.id}`, node })),
        pageInfo,
        totalCount: 61,
      },
    }),
    // neither Organization nor its child orgs are taggable typenames -- nothing to seed
    seeded: [],
  })

  let spec: ReturnType<typeof organizationsTableConfig>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockApollo(() => {
          throw new Error('no network expected')
        }),
      ],
    })
    spec = organizationsTableConfig(
      TestBed.inject(OrganizationsBrowseGQL),
      'Organizations'
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
    ).toEqual([['name', 'name']])
  })

  it('offers a sorter on every sortable column, none defaulted', () => {
    expect(
      spec.columns.filter((c) => c.sort).map((c) => c.sort!.column)
    ).toEqual([
      OrganizationSortColumns.Name,
      OrganizationSortColumns.MemberCount,
      OrganizationSortColumns.ActivityCount,
      OrganizationSortColumns.MostRecentActivityTimestamp,
    ])
    // the legacy table's opening query never sets sortBy
    expect(spec.columns.every((c) => !c.sort?.default)).toBe(true)
    // no sort control on the child-orgs column, matching the legacy table
    expect(column('childOrganizations').sort).toBeUndefined()
  })

  describe('cell accessors', () => {
    it('renders the name and child-orgs columns as custom cells (neither is a taggable typename)', () => {
      expect(column('name').cell.kind).toBe('custom')
      expect(column('childOrganizations').cell.kind).toBe('custom')
    })

    it('renders member/activity counts as plain text', () => {
      expect(specCell(spec, 'memberCount', 'text').text(ROW)).toBe(12)
      expect(specCell(spec, 'activityCount', 'text').text(ROW)).toBe(340)
    })

    it('formats the last-action timestamp with the timeAgo formatter', () => {
      const text = specCell(spec, 'mostRecentActivityTimestamp', 'text')
      expect(text.text(ROW)).toMatch(/ago$|^[A-Z][a-z]{2} \d/)
    })

    it('leaves an absent last-action timestamp empty rather than "--"', () => {
      const text = specCell(spec, 'mostRecentActivityTimestamp', 'text')
      expect(
        text.text({ ...ROW, mostRecentActivityTimestamp: undefined })
      ).toBeUndefined()
    })
  })
})

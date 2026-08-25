import { TestBed } from '@angular/core/testing'
import { UserRole, UsersSortColumns } from '@app/generated/civic.apollo.types'
import { provideMockApollo } from '@app/testing/apollo-test.providers'
import {
  describeEntityTableContract,
  specCell,
  specColumn,
} from '@app/testing/entity-table.harness'
import { OperationDefinitionNode, visit } from 'graphql'
import { beforeEach, describe, expect, it } from 'vitest'
import { usersTableConfig } from './users-table.config'
import {
  UserBrowseTableRowFieldsFragment,
  UsersBrowseDocument,
  UsersBrowseGQL,
} from './users-table.query.gql.generated'

/**
 * The parity net ported from the (now-deleted) legacy
 * `users-table.characterization.spec.ts`: the shared contract plus the
 * invariants the compiler cannot see — filter -> variable routing
 * (including the declared∧used document walk), sortable columns, the
 * opening default sort, the `ids` scope passthrough, and the nested
 * `organization: {name}` filter shape.
 *
 * Deliberately NOT ported: the legacy `ids` bug (refresh() never included
 * `ids`, so it stuck at whatever it was at mount). The facade's `computed`
 * spec always reflects the current `ids` signal, so `host scope` below
 * asserts the fix instead — an embed changing `[ids]` is expected to
 * change the scope, full stop.
 */

const ROW: UserBrowseTableRowFieldsFragment = {
  __typename: 'BrowseUser',
  id: 4,
  name: 'Jane Doe',
  displayName: 'jdoe',
  username: 'jdoe',
  organizations: [{ __typename: 'Organization', id: 9, name: 'ClinGen' }],
  role: UserRole.Editor,
  evidenceCount: 12,
  revisionCount: 3,
  mostRecentActivityTimestamp: '2026-08-01T00:00:00Z',
}

const SECOND_ROW: UserBrowseTableRowFieldsFragment = {
  ...ROW,
  id: 7,
  name: 'John Smith',
  displayName: 'jsmith',
  username: 'jsmith',
}

/** the variables the operation declares, e.g. `$organization` */
function declaredVariables(): Set<string> {
  const operation = UsersBrowseDocument.definitions.find(
    (d): d is OperationDefinitionNode => d.kind === 'OperationDefinition'
  )
  return new Set(
    (operation?.variableDefinitions ?? []).map((v) => v.variable.name.value)
  )
}

/** the variables the operation actually passes to a field or input object */
function usedVariables(): Set<string> {
  const used = new Set<string>()
  visit(UsersBrowseDocument, {
    Argument: (node) => {
      visit(node.value, { Variable: (v) => void used.add(v.name.value) })
    },
  })
  return used
}

describe('usersTableConfig', () => {
  describeEntityTableContract({
    spec: () => usersTableConfig(TestBed.inject(UsersBrowseGQL), 'Users'),
    operationName: 'UsersBrowse',
    rows: [ROW, SECOND_ROW],
    connection: (rows, pageInfo) => ({
      browseUsers: {
        __typename: 'BrowseUserConnection',
        edges: rows.map((node) => ({ cursor: `c${node.id}`, node })),
        pageInfo,
        totalCount: 843,
      },
    }),
    // the organization filter normalises to a nested object, not a scalar
    filterInputs: { organizations: 'ClinGen' },
    // neither User nor its organizations are taggable typenames -- nothing to seed
    seeded: [],
  })

  let spec: ReturnType<typeof usersTableConfig>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockApollo(() => {
          throw new Error('no network expected')
        }),
      ],
    })
    spec = usersTableConfig(TestBed.inject(UsersBrowseGQL), 'Users')
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
      ['user', 'name'],
      ['organizations', 'organization'],
      ['role', 'role'],
    ])
  })

  it('builds the nested organization filter object', () => {
    const filter = column('organizations').filter
    expect(filter?.kind).toBe('text')
    if (filter?.kind !== 'text') return
    expect(filter.transform?.('ClinGen')).toEqual({ name: 'ClinGen' })
    expect(filter.transform?.(undefined)).toBeUndefined()
  })

  it('offers every user role in the role filter', () => {
    const filter = column('role').filter
    expect(filter?.kind).toBe('enum')
    if (filter?.kind !== 'enum') return
    expect(filter.options.map((option) => option.value)).toEqual(
      Object.values(UserRole)
    )
  })

  it('prefixes its count headers with entity icons, as the legacy table did', () => {
    expect(
      spec.columns.filter((c) => c.labelIcon).map((c) => [c.key, c.labelIcon])
    ).toEqual([
      ['evidenceCount', 'civic-evidence'],
      ['revisionCount', 'civic-revision'],
    ])
  })

  it('offers a sorter on every sortable column', () => {
    expect(
      spec.columns.filter((c) => c.sort).map((c) => c.sort!.column)
    ).toEqual([
      UsersSortColumns.Name,
      UsersSortColumns.Role,
      UsersSortColumns.LastAction,
      UsersSortColumns.EvidenceCount,
      UsersSortColumns.RevisionCount,
    ])
    // the User column carries the folded-in Name sort; Organizations has none
    expect(column('user').sort?.column).toBe(UsersSortColumns.Name)
    expect(column('organizations').sort).toBeUndefined()
  })

  it('opens sorted by last action, as the legacy table always has', () => {
    expect(column('mostRecentActivityTimestamp').sort?.default).toBe('descend')
  })

  describe('host scope', () => {
    it('passes the embed-site ids scope through', () => {
      const scoped = usersTableConfig(
        TestBed.inject(UsersBrowseGQL),
        undefined,
        {
          ids: [1, 2],
        }
      )
      expect(scoped.scope).toMatchObject({ ids: [1, 2] })
    })
  })

  describe('cell accessors', () => {
    it('renders the User and Organizations columns as custom cells (neither is a taggable typename)', () => {
      expect(column('user').cell.kind).toBe('custom')
      expect(column('organizations').cell.kind).toBe('custom')
    })

    it('renders role with the legacy enumToTitle formatting', () => {
      expect(specCell(spec, 'role', 'text').text(ROW)).toBe('Editor')
    })

    it('renders the counts as plain text', () => {
      expect(specCell(spec, 'evidenceCount', 'text').text(ROW)).toBe(12)
      expect(specCell(spec, 'revisionCount', 'text').text(ROW)).toBe(3)
    })

    it('formats the last-action timestamp with the timeAgo formatter', () => {
      const text = specCell(spec, 'mostRecentActivityTimestamp', 'text')
      expect(text.text(ROW)).toMatch(/ago$|^[A-Z][a-z]{2} \d/)
      expect(
        text.text({ ...ROW, mostRecentActivityTimestamp: undefined })
      ).toBeUndefined()
    })
  })
})

import { TestBed } from '@angular/core/testing'
import { TherapySortColumns } from '@app/generated/civic.apollo.types'
import { readCachedEntity, writeCachedEntity } from '@app/tags'
import { provideMockApollo } from '@app/testing/apollo-test.providers'
import {
  describeEntityTableContract,
  specCell,
  specColumn,
} from '@app/testing/entity-table.harness'
import { Apollo } from 'apollo-angular'
import { OperationDefinitionNode, visit } from 'graphql'
import { beforeEach, describe, expect, it } from 'vitest'
import { therapiesTableConfig } from './therapies-table.config'
import {
  TherapiesBrowseDocument,
  TherapiesBrowseGQL,
  TherapyBrowseTableRowFieldsFragment,
} from './therapies-table.query.gql.generated'

/**
 * The parity net ported from the (now-deleted) legacy
 * `therapies-table.characterization.spec.ts`: the shared contract plus the
 * invariants the compiler cannot see — filter -> variable routing
 * (including the declared∧used document walk), sortable columns, the
 * opening default sort, and the `ids` scope passthrough.
 */

const ROW: TherapyBrowseTableRowFieldsFragment = {
  __typename: 'BrowseTherapy',
  id: 3,
  name: 'Vemurafenib',
  ncitId: 'C64768',
  therapyUrl:
    'https://ncithesaurus.nci.nih.gov/ncitbrowser/ConceptReport.jsp?dictionary=NCI_Thesaurus&code=C64768',
  assertionCount: 8,
  evidenceCount: 62,
  link: '/therapies/3',
  deprecated: false,
  therapyAliases: ['Zelboraf', 'RO5185426'],
}

const SECOND_ROW: TherapyBrowseTableRowFieldsFragment = {
  ...ROW,
  id: 5,
  name: 'Dabrafenib',
  ncitId: 'C82386',
}

/** the variables the operation declares, e.g. `$ncitId` */
function declaredVariables(): Set<string> {
  const operation = TherapiesBrowseDocument.definitions.find(
    (d): d is OperationDefinitionNode => d.kind === 'OperationDefinition'
  )
  return new Set(
    (operation?.variableDefinitions ?? []).map((v) => v.variable.name.value)
  )
}

/** the variables the operation actually passes to a field or input object */
function usedVariables(): Set<string> {
  const used = new Set<string>()
  visit(TherapiesBrowseDocument, {
    Argument: (node) => {
      visit(node.value, { Variable: (v) => void used.add(v.name.value) })
    },
  })
  return used
}

describe('therapiesTableConfig', () => {
  describeEntityTableContract({
    spec: () =>
      therapiesTableConfig(TestBed.inject(TherapiesBrowseGQL), 'Therapies'),
    operationName: 'TherapiesBrowse',
    rows: [ROW, SECOND_ROW],
    connection: (rows, pageInfo) => ({
      browseTherapies: {
        __typename: 'BrowseTherapyConnection',
        edges: rows.map((node) => ({ cursor: `c${node.id}`, node })),
        pageInfo,
        totalCount: 634,
        filteredCount: 634,
      },
    }),
    // the therapy is projected out of the row itself, addressed as Therapy
    seeded: [['Therapy', 3]],
  })

  let apollo: Apollo
  let spec: ReturnType<typeof therapiesTableConfig>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockApollo(() => {
          throw new Error('no network expected')
        }),
      ],
    })
    apollo = TestBed.inject(Apollo)
    spec = therapiesTableConfig(TestBed.inject(TherapiesBrowseGQL), 'Therapies')
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
      ['name', 'name'],
      ['ncitId', 'ncitId'],
      ['therapyAliases', 'therapyAlias'],
    ])
  })

  it('offers a sorter on every sortable column', () => {
    expect(
      spec.columns.filter((c) => c.sort).map((c) => c.sort!.column)
    ).toEqual([
      TherapySortColumns.Name,
      TherapySortColumns.NcitId,
      TherapySortColumns.EvidenceItemCount,
      TherapySortColumns.AssertionCount,
    ])
    expect(column('therapyAliases').sort).toBeUndefined()
  })

  it('opens sorted by evidence count, as the legacy table always has', () => {
    expect(column('evidenceCount').sort?.default).toBe('descend')
  })

  describe('host scope', () => {
    it('passes the embed-site ids scope through', () => {
      const scoped = therapiesTableConfig(
        TestBed.inject(TherapiesBrowseGQL),
        undefined,
        { ids: [1, 2] }
      )
      expect(scoped.scope).toMatchObject({ ids: [1, 2] })
    })
  })

  describe('cell accessors', () => {
    it('addresses the therapy by cache identity alone', () => {
      const entityTag = specCell(spec, 'name', 'entity-tag')
      expect(entityTag.ref(ROW)).toEqual({ __typename: 'Therapy', id: 3 })
    })

    it('renders NCIt Code as an external link-out to the NCI Thesaurus', () => {
      const link = specCell(spec, 'ncitId', 'external-link')
      expect(link.href(ROW)).toBe(ROW.therapyUrl)
      expect(link.text?.(ROW)).toBe('C64768')
    })

    it('renders aliases as highlightable plain text', () => {
      const text = specCell(spec, 'therapyAliases', 'text')
      expect(text.text(ROW)).toEqual(['Zelboraf', 'RO5185426'])
      expect(text.highlight).toBe(true)
    })

    it('renders the counts as plain text', () => {
      expect(specCell(spec, 'evidenceCount', 'text').text(ROW)).toBe(62)
      expect(specCell(spec, 'assertionCount', 'text').text(ROW)).toBe(8)
    })
  })

  describe('cache seeds', () => {
    it('projects a therapy that satisfies LinkableTherapy', () => {
      const seedOf = (column('name').cell as any).seed
      writeCachedEntity(apollo, 'Therapy', seedOf(ROW))

      expect(readCachedEntity(apollo, 'Therapy', 3)).toMatchObject({
        name: 'Vemurafenib',
        link: '/therapies/3',
      })
    })
  })
})

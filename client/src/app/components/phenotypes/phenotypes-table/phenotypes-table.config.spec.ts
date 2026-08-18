import { TestBed } from '@angular/core/testing'
import { PhenotypeSortColumns } from '@app/generated/civic.apollo.types'
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
import { phenotypesTableConfig } from './phenotypes-table.config'
import {
  PhenotypeBrowseTableRowFieldsFragment,
  PhenotypesBrowseDocument,
  PhenotypesBrowseGQL,
} from './phenotypes-table.query.gql.generated'

/**
 * The parity net ported from the (now-deleted) legacy
 * `phenotypes-table.characterization.spec.ts`: the shared contract plus the
 * invariants the compiler cannot see — filter -> variable routing (including
 * the declared∧used document walk), sortable columns, the opening default
 * sort, and the `ids` scope passthrough. Same "sends X" expectations the
 * characterization spec proved against the legacy component, now proving
 * the facade instead.
 */

const ROW: PhenotypeBrowseTableRowFieldsFragment = {
  __typename: 'BrowsePhenotype',
  id: 1363,
  name: 'Craniosynostosis',
  hpoId: 'HP:0001363',
  url: 'https://hpo.jax.org/app/browse/term/HP:0001363',
  assertionCount: 2,
  evidenceCount: 5,
  link: '/phenotypes/1363',
}

const SECOND_ROW: PhenotypeBrowseTableRowFieldsFragment = {
  ...ROW,
  id: 12,
  name: 'Seizure',
  hpoId: 'HP:0001250',
  link: '/phenotypes/12',
}

/** the variables the operation declares, e.g. `$hpoId` */
function declaredVariables(): Set<string> {
  const operation = PhenotypesBrowseDocument.definitions.find(
    (d): d is OperationDefinitionNode => d.kind === 'OperationDefinition'
  )
  return new Set(
    (operation?.variableDefinitions ?? []).map((v) => v.variable.name.value)
  )
}

/** the variables the operation actually passes to a field or input object */
function usedVariables(): Set<string> {
  const used = new Set<string>()
  visit(PhenotypesBrowseDocument, {
    Argument: (node) => {
      visit(node.value, { Variable: (v) => void used.add(v.name.value) })
    },
  })
  return used
}

describe('phenotypesTableConfig', () => {
  describeEntityTableContract({
    spec: () =>
      phenotypesTableConfig(TestBed.inject(PhenotypesBrowseGQL), 'Phenotypes'),
    operationName: 'PhenotypesBrowse',
    rows: [ROW, SECOND_ROW],
    connection: (rows, pageInfo) => ({
      browsePhenotypes: {
        __typename: 'BrowsePhenotypeConnection',
        edges: rows.map((node) => ({ cursor: `c${node.id}`, node })),
        pageInfo,
        totalCount: 1088,
        filteredCount: 1088,
      },
    }),
    // the phenotype is projected out of the row itself, addressed as Phenotype
    seeded: [['Phenotype', 1363]],
  })

  let apollo: Apollo
  let spec: ReturnType<typeof phenotypesTableConfig>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockApollo(() => {
          throw new Error('no network expected')
        }),
      ],
    })
    apollo = TestBed.inject(Apollo)
    spec = phenotypesTableConfig(
      TestBed.inject(PhenotypesBrowseGQL),
      'Phenotypes'
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
      ['name', 'name'],
      ['hpoId', 'hpoId'],
    ])
  })

  it('offers a sorter on every sortable column', () => {
    expect(
      spec.columns.filter((c) => c.sort).map((c) => c.sort!.column)
    ).toEqual([
      PhenotypeSortColumns.Name,
      PhenotypeSortColumns.HpoId,
      PhenotypeSortColumns.EvidenceItemCount,
      PhenotypeSortColumns.AssertionCount,
    ])
  })

  it('opens sorted by evidence count, as the legacy table always has', () => {
    expect(column('evidenceCount').sort?.default).toBe('descend')
  })

  describe('host scope', () => {
    it('passes the embed-site ids scope through', () => {
      const scoped = phenotypesTableConfig(
        TestBed.inject(PhenotypesBrowseGQL),
        undefined,
        { ids: [1, 2] }
      )
      expect(scoped.scope).toMatchObject({ ids: [1, 2] })
    })
  })

  describe('cell accessors', () => {
    it('addresses the phenotype by cache identity alone', () => {
      const entityTag = specCell(spec, 'name', 'entity-tag')
      expect(entityTag.ref(ROW)).toEqual({
        __typename: 'Phenotype',
        id: 1363,
      })
    })

    it('renders the counts as plain text', () => {
      expect(specCell(spec, 'evidenceCount', 'text').text(ROW)).toBe(5)
      expect(specCell(spec, 'assertionCount', 'text').text(ROW)).toBe(2)
    })

    it('renders HPO ID as an external link-out to the HPO term', () => {
      const link = specCell(spec, 'hpoId', 'external-link')
      expect(link.href(ROW)).toBe(
        'https://hpo.jax.org/app/browse/term/HP:0001363'
      )
      expect(link.text?.(ROW)).toBe('HP:0001363')
    })
  })

  describe('cache seeds', () => {
    it('projects a phenotype that satisfies LinkablePhenotype', () => {
      const seedOf = (column('name').cell as any).seed
      writeCachedEntity(apollo, 'Phenotype', seedOf(ROW))

      expect(readCachedEntity(apollo, 'Phenotype', 1363)).toMatchObject({
        name: 'Craniosynostosis',
        link: '/phenotypes/1363',
      })
    })
  })
})

import { TestBed } from '@angular/core/testing'
import { VariantGroupsSortColumns } from '@app/generated/civic.apollo.types'
import { SORT_DESCEND_FIRST } from '@app/tables'
import { provideMockApollo } from '@app/testing/apollo-test.providers'
import {
  describeEntityTableContract,
  specCell,
  specColumn,
} from '@app/testing/entity-table.harness'
import { OperationDefinitionNode, visit } from 'graphql'
import { beforeEach, describe, expect, it } from 'vitest'
import { variantGroupsTableConfig } from './variant-groups-table.config'
import {
  BrowseVariantGroupRowFieldsFragment,
  BrowseVariantGroupsDocument,
  BrowseVariantGroupsGQL,
} from './variant-groups-table.query.gql.generated'

/**
 * The parity net ported from the (now-deleted) legacy
 * `variant-groups-table.characterization.spec.ts`: the shared contract
 * plus the invariants the compiler cannot see — filter -> variable
 * routing (including the declared∧used document walk) and sortable
 * columns. No host scope: the legacy table has no `ids`/entity-id input.
 */

const ROW: BrowseVariantGroupRowFieldsFragment = {
  __typename: 'BrowseVariantGroup',
  id: 6,
  name: 'BRAF Non-V600E Mutations',
  link: '/variant-groups/6',
  featureNames: ['BRAF'],
  variantNames: ['G469A', 'D594N'],
  variantCount: 12,
  evidenceItemCount: 34,
}

const SECOND_ROW: BrowseVariantGroupRowFieldsFragment = {
  ...ROW,
  id: 9,
  name: 'EGFR Exon 19 Deletions',
}

/** the variables the operation declares, e.g. `$variantNames` */
function declaredVariables(): Set<string> {
  const operation = BrowseVariantGroupsDocument.definitions.find(
    (d): d is OperationDefinitionNode => d.kind === 'OperationDefinition'
  )
  return new Set(
    (operation?.variableDefinitions ?? []).map((v) => v.variable.name.value)
  )
}

/** the variables the operation actually passes to a field or input object */
function usedVariables(): Set<string> {
  const used = new Set<string>()
  visit(BrowseVariantGroupsDocument, {
    Argument: (node) => {
      visit(node.value, { Variable: (v) => void used.add(v.name.value) })
    },
  })
  return used
}

describe('variantGroupsTableConfig', () => {
  describeEntityTableContract({
    spec: () =>
      variantGroupsTableConfig(
        TestBed.inject(BrowseVariantGroupsGQL),
        'Variant Groups'
      ),
    operationName: 'BrowseVariantGroups',
    rows: [ROW, SECOND_ROW],
    connection: (rows, pageInfo) => ({
      browseVariantGroups: {
        __typename: 'BrowseVariantGroupConnection',
        edges: rows.map((node) => ({ cursor: `c${node.id}`, node })),
        pageInfo,
        totalCount: 216,
        filteredCount: 216,
        pageCount: 8,
        lastUpdated: '2026-08-17T00:00:00Z',
      },
    }),
    // VariantGroup is not a taggable typename -- nothing to seed
    seeded: [],
  })

  let spec: ReturnType<typeof variantGroupsTableConfig>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockApollo(() => {
          throw new Error('no network expected')
        }),
      ],
    })
    spec = variantGroupsTableConfig(
      TestBed.inject(BrowseVariantGroupsGQL),
      'Variant Groups'
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
      ['variantNames', 'variantNames'],
      ['featureNames', 'featureNames'],
    ])
  })

  it('cycles its count columns descend-first, as the legacy table did', () => {
    for (const key of ['variantCount', 'evidenceItemCount']) {
      expect(column(key).sort?.directions).toEqual(SORT_DESCEND_FIRST)
    }
  })

  it('discloses the full variant list in a hover tooltip, as legacy did', () => {
    expect(column('variantNames').cell).toMatchObject({
      kind: 'text',
      tooltip: true,
    })
  })

  it('offers a sorter only where the legacy table did', () => {
    expect(
      spec.columns.filter((c) => c.sort).map((c) => c.sort!.column)
    ).toEqual([
      VariantGroupsSortColumns.Name,
      VariantGroupsSortColumns.VariantCount,
      VariantGroupsSortColumns.EvidenceItemCount,
    ])
    expect(column('variantNames').sort).toBeUndefined()
    expect(column('featureNames').sort).toBeUndefined()
  })

  it('opens sorted by variant count, as the legacy table always has', () => {
    expect(column('variantCount').sort?.default).toBe('descend')
  })

  describe('cell accessors', () => {
    it('renders Name as a custom cell (VariantGroup is not a taggable typename)', () => {
      expect(column('name').cell.kind).toBe('custom')
    })

    it('renders variant/feature names as highlightable plain text', () => {
      const variants = specCell(spec, 'variantNames', 'text')
      expect(variants.text(ROW)).toEqual(['G469A', 'D594N'])
      expect(variants.highlight).toBe(true)

      const features = specCell(spec, 'featureNames', 'text')
      expect(features.text(ROW)).toEqual(['BRAF'])
      expect(features.highlight).toBe(true)
    })

    it('renders the counts as plain text', () => {
      expect(specCell(spec, 'variantCount', 'text').text(ROW)).toBe(12)
      expect(specCell(spec, 'evidenceItemCount', 'text').text(ROW)).toBe(34)
    })
  })
})

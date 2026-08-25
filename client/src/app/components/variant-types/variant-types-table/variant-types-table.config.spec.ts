import { TestBed } from '@angular/core/testing'
import { VariantTypeSortColumns } from '@app/generated/civic.apollo.types'
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
import { variantTypesTableConfig } from './variant-types-table.config'
import {
  VariantTypeBrowseTableRowFieldsFragment,
  VariantTypesBrowseDocument,
  VariantTypesBrowseGQL,
} from './variant-types-table.query.gql.generated'

/**
 * The parity net ported from the (now-deleted) legacy
 * `variant-types-table.characterization.spec.ts`: the shared contract plus
 * the invariants the compiler cannot see — filter -> variable routing
 * (including the declared∧used document walk), sortable columns (none
 * defaulted, matching the legacy table's unsorted opening query), and the
 * `ids` scope passthrough.
 */

const ROW: VariantTypeBrowseTableRowFieldsFragment = {
  __typename: 'BrowseVariantType',
  id: 9,
  name: 'Missense Variant',
  soid: 'SO:0001583',
  url: 'http://www.sequenceontology.org/browser/current_svn/term/SO:0001583',
  variantCount: 130,
  link: '/variant-types/9',
}

const SECOND_ROW: VariantTypeBrowseTableRowFieldsFragment = {
  ...ROW,
  id: 3,
  name: 'Frameshift Variant',
  soid: 'SO:0001589',
  link: '/variant-types/3',
}

/** the variables the operation declares, e.g. `$soid` */
function declaredVariables(): Set<string> {
  const operation = VariantTypesBrowseDocument.definitions.find(
    (d): d is OperationDefinitionNode => d.kind === 'OperationDefinition'
  )
  return new Set(
    (operation?.variableDefinitions ?? []).map((v) => v.variable.name.value)
  )
}

/** the variables the operation actually passes to a field or input object */
function usedVariables(): Set<string> {
  const used = new Set<string>()
  visit(VariantTypesBrowseDocument, {
    Argument: (node) => {
      visit(node.value, { Variable: (v) => void used.add(v.name.value) })
    },
  })
  return used
}

describe('variantTypesTableConfig', () => {
  describeEntityTableContract({
    spec: () =>
      variantTypesTableConfig(
        TestBed.inject(VariantTypesBrowseGQL),
        'Variant Types'
      ),
    operationName: 'VariantTypesBrowse',
    rows: [ROW, SECOND_ROW],
    connection: (rows, pageInfo) => ({
      variantTypes: {
        __typename: 'BrowseVariantTypeConnection',
        edges: rows.map((node) => ({ cursor: `c${node.id}`, node })),
        pageInfo,
        totalCount: 47,
        filteredCount: 47,
      },
    }),
    // the variant type is projected out of the row itself, addressed as VariantType
    seeded: [['VariantType', 9]],
  })

  let apollo: Apollo
  let spec: ReturnType<typeof variantTypesTableConfig>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockApollo(() => {
          throw new Error('no network expected')
        }),
      ],
    })
    apollo = TestBed.inject(Apollo)
    spec = variantTypesTableConfig(
      TestBed.inject(VariantTypesBrowseGQL),
      'Variant Types'
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
      ['soid', 'soid'],
    ])
  })

  it('offers a sorter on every sortable column, none defaulted', () => {
    expect(
      spec.columns.filter((c) => c.sort).map((c) => c.sort!.column)
    ).toEqual([
      VariantTypeSortColumns.Name,
      VariantTypeSortColumns.Soid,
      VariantTypeSortColumns.VariantCount,
    ])
    // the legacy table's opening query never sets sortBy
    expect(spec.columns.every((c) => !c.sort?.default)).toBe(true)
  })

  describe('host scope', () => {
    it('passes the embed-site ids scope through', () => {
      const scoped = variantTypesTableConfig(
        TestBed.inject(VariantTypesBrowseGQL),
        undefined,
        { ids: [1, 2] }
      )
      expect(scoped.scope).toMatchObject({ ids: [1, 2] })
    })
  })

  describe('cell accessors', () => {
    it('addresses the variant type by cache identity alone', () => {
      const entityTag = specCell(spec, 'name', 'entity-tag')
      expect(entityTag.ref(ROW)).toEqual({
        __typename: 'VariantType',
        id: 9,
      })
    })

    it('renders the variant count as plain text', () => {
      expect(specCell(spec, 'variantCount', 'text').text(ROW)).toBe(130)
    })

    it('renders SOID as an external link-out to sequenceontology.org', () => {
      const link = specCell(spec, 'soid', 'external-link')
      expect(link.href(ROW)).toBe(
        'http://www.sequenceontology.org/browser/current_svn/term/SO:0001583'
      )
      expect(link.text?.(ROW)).toBe('SO:0001583')
    })
  })

  describe('cache seeds', () => {
    it('projects a variant type that satisfies LinkableVariantType', () => {
      const seedOf = (column('name').cell as any).seed
      writeCachedEntity(apollo, 'VariantType', seedOf(ROW))

      expect(readCachedEntity(apollo, 'VariantType', 9)).toMatchObject({
        name: 'Missense Variant',
        link: '/variant-types/9',
      })
    })
  })
})

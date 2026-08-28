import { TestBed } from '@angular/core/testing'
import {
  FeatureInstanceTypes,
  FeaturesSortColumns,
} from '@app/generated/civic.apollo.types'
import { SORT_DESCEND_FIRST } from '@app/tables'
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
import { featuresTableConfig } from './features-table.config'
import {
  BrowseFeaturesFieldsFragment,
  BrowseFeaturesDocument,
  BrowseFeaturesGQL,
} from './features-table.query.gql.generated'

/**
 * The parity net ported from the (now-deleted) legacy
 * `features-table.characterization.spec.ts`: the shared contract plus the
 * invariants the compiler cannot see — filter -> variable routing
 * (including the declared∧used document walk), sortable columns, the
 * opening default sort, and the `ids` scope passthrough.
 */

const ROW: BrowseFeaturesFieldsFragment = {
  __typename: 'BrowseFeature',
  id: 5,
  name: 'BRAF',
  fullName: 'B-Raf Proto-Oncogene',
  link: '/features/5',
  deprecated: false,
  flagged: false,
  featureAliases: ['BRAF1'],
  diseases: [
    {
      __typename: 'Disease',
      id: 7,
      name: 'Melanoma',
      link: '/diseases/7',
      deprecated: false,
    },
  ],
  therapies: [
    {
      __typename: 'Therapy',
      id: 3,
      name: 'Vemurafenib',
      link: '/therapies/3',
      deprecated: false,
    },
  ],
  variantCount: 130,
  evidenceItemCount: 300,
  assertionCount: 15,
  molecularProfileCount: 45,
  featureInstanceType: FeatureInstanceTypes.Gene,
}

const SECOND_ROW: BrowseFeaturesFieldsFragment = {
  ...ROW,
  id: 9,
  name: 'KRAS',
  fullName: 'Kirsten Rat Sarcoma Viral Oncogene Homolog',
}

/** the variables the operation declares, e.g. `$featureAlias` */
function declaredVariables(): Set<string> {
  const operation = BrowseFeaturesDocument.definitions.find(
    (d): d is OperationDefinitionNode => d.kind === 'OperationDefinition'
  )
  return new Set(
    (operation?.variableDefinitions ?? []).map((v) => v.variable.name.value)
  )
}

/** the variables the operation actually passes to a field or input object */
function usedVariables(): Set<string> {
  const used = new Set<string>()
  visit(BrowseFeaturesDocument, {
    Argument: (node) => {
      visit(node.value, { Variable: (v) => void used.add(v.name.value) })
    },
  })
  return used
}

describe('featuresTableConfig', () => {
  describeEntityTableContract({
    spec: () =>
      featuresTableConfig(TestBed.inject(BrowseFeaturesGQL), 'Features'),
    operationName: 'BrowseFeatures',
    rows: [ROW, SECOND_ROW],
    connection: (rows, pageInfo) => ({
      browseFeatures: {
        __typename: 'BrowseFeatureConnection',
        edges: rows.map((node) => ({ cursor: `c${node.id}`, node })),
        pageInfo,
        totalCount: 942,
        filteredCount: 942,
        pageCount: 27,
        lastUpdated: '2026-08-17T00:00:00Z',
      },
    }),
    // the feature is projected out of the row; diseases/therapies arrive as real nested entities
    seeded: [['Feature', 5]],
  })

  let apollo: Apollo
  let spec: ReturnType<typeof featuresTableConfig>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockApollo(() => {
          throw new Error('no network expected')
        }),
      ],
    })
    apollo = TestBed.inject(Apollo)
    spec = featuresTableConfig(TestBed.inject(BrowseFeaturesGQL), 'Features')
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
      ['name', 'featureName'],
      ['fullName', 'featureFullName'],
      ['featureAliases', 'featureAlias'],
      ['diseases', 'diseaseName'],
      ['therapies', 'therapyName'],
    ])
  })

  it('cycles its count columns descend-first, as the legacy table did', () => {
    for (const key of [
      'molecularProfileCount',
      'variantCount',
      'evidenceItemCount',
      'assertionCount',
    ]) {
      expect(column(key).sort?.directions).toEqual(SORT_DESCEND_FIRST)
    }
  })

  it('prefixes its count headers with entity icons, as the legacy table did', () => {
    expect(
      spec.columns.filter((c) => c.labelIcon).map((c) => [c.key, c.labelIcon])
    ).toEqual([
      ['molecularProfileCount', 'civic-molecularprofile'],
      ['variantCount', 'civic-variant'],
      ['evidenceItemCount', 'civic-evidence'],
      ['assertionCount', 'civic-assertion'],
    ])
  })

  it('discloses its clip-prone text columns in hover tooltips', () => {
    expect(column('fullName').cell).toMatchObject({
      kind: 'text',
      tooltip: true,
    })
    expect(column('featureAliases').cell).toMatchObject({
      kind: 'text',
      tooltip: true,
    })
  })

  it('offers a sorter only where the legacy table did', () => {
    expect(
      spec.columns.filter((c) => c.sort).map((c) => c.sort!.column)
    ).toEqual([
      FeaturesSortColumns.FeatureName,
      FeaturesSortColumns.FeatureFullName,
      FeaturesSortColumns.MolecularProfileCount,
      FeaturesSortColumns.VariantCount,
      FeaturesSortColumns.EvidenceItemCount,
      FeaturesSortColumns.AssertionCount,
    ])
    expect(column('featureAliases').sort).toBeUndefined()
    expect(column('diseases').sort).toBeUndefined()
    expect(column('therapies').sort).toBeUndefined()
  })

  it('opens sorted by variant count, as the legacy table always has', () => {
    expect(column('variantCount').sort?.default).toBe('descend')
  })

  it('offers every feature type in the feature column funnel', () => {
    const filter = column('name').extraFilter
    expect(filter?.var).toBe('featureType')
    expect(filter?.options.map((option) => option.value)).toEqual(
      Object.values(FeatureInstanceTypes)
    )
  })

  describe('host scope', () => {
    it('passes the embed-site ids scope through', () => {
      const scoped = featuresTableConfig(
        TestBed.inject(BrowseFeaturesGQL),
        undefined,
        { ids: [1, 2] }
      )
      expect(scoped.scope).toMatchObject({ ids: [1, 2] })
    })
  })

  describe('cell accessors', () => {
    it('addresses the feature by cache identity alone', () => {
      const entityTag = specCell(spec, 'name', 'entity-tag')
      expect(entityTag.ref(ROW)).toEqual({ __typename: 'Feature', id: 5 })
    })

    it('passes nested diseases/therapies through untouched', () => {
      expect(specCell(spec, 'diseases', 'entity-tag').ref(ROW)).toBe(
        ROW.diseases
      )
      expect(specCell(spec, 'therapies', 'entity-tag').ref(ROW)).toBe(
        ROW.therapies
      )
    })

    it('titlecases the full name', () => {
      expect(specCell(spec, 'fullName', 'text').text(ROW)).toBe(
        'B-raf Proto-oncogene'
      )
    })

    it('renders aliases as highlightable plain text', () => {
      const text = specCell(spec, 'featureAliases', 'text')
      expect(text.text(ROW)).toEqual(['BRAF1'])
      expect(text.highlight).toBe(true)
    })

    it('renders the counts as count-tag cells', () => {
      expect(
        specCell(spec, 'molecularProfileCount', 'count-tag').count(ROW)
      ).toBe(45)
      expect(specCell(spec, 'variantCount', 'count-tag').count(ROW)).toBe(130)
      expect(specCell(spec, 'evidenceItemCount', 'count-tag').count(ROW)).toBe(
        300
      )
      expect(specCell(spec, 'assertionCount', 'count-tag').count(ROW)).toBe(15)
    })
  })

  describe('cache seeds', () => {
    it('projects a feature that satisfies LinkableFeature, borrowing featureInstanceType for featureType', () => {
      const seedOf = (column('name').cell as any).seed
      writeCachedEntity(apollo, 'Feature', seedOf(ROW))

      expect(readCachedEntity(apollo, 'Feature', 5)).toMatchObject({
        name: 'BRAF',
        link: '/features/5',
        featureType: FeatureInstanceTypes.Gene,
      })
    })

    it('leaves the nested-entity columns unseeded', () => {
      expect((column('diseases').cell as any).seed).toBeUndefined()
      expect((column('therapies').cell as any).seed).toBeUndefined()
    })
  })
})

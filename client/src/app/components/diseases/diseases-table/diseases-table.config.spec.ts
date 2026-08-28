import { TestBed } from '@angular/core/testing'
import {
  DiseasesSortColumns,
  FeatureInstanceTypes,
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
import { diseasesTableConfig } from './diseases-table.config'
import {
  BrowseDiseaseRowFieldsFragment,
  DiseaseBrowseDocument,
  DiseaseBrowseGQL,
} from './diseases-table.query.gql.generated'

/**
 * The parity net ported from the (now-deleted) legacy
 * `diseases-table.characterization.spec.ts`: the shared contract plus the
 * invariants the compiler cannot see — filter -> variable routing
 * (including the declared∧used document walk), sortable columns, the
 * opening default sort, and the `ids` scope passthrough.
 */

const ROW: BrowseDiseaseRowFieldsFragment = {
  __typename: 'BrowseDisease',
  id: 7,
  name: 'Melanoma',
  doid: '1909',
  diseaseUrl: 'https://disease-ontology.org/?id=DOID:1909',
  features: [
    {
      __typename: 'LinkableFeature',
      id: 5,
      name: 'BRAF',
      link: '/features/5',
      flagged: false,
      deprecated: false,
      featureType: FeatureInstanceTypes.Gene,
    },
  ],
  assertionCount: 12,
  evidenceItemCount: 130,
  variantCount: 40,
  featureCount: 1,
  link: '/diseases/7',
  deprecated: false,
  diseaseAliases: ['Malignant Melanoma'],
}

const SECOND_ROW: BrowseDiseaseRowFieldsFragment = {
  ...ROW,
  id: 3,
  name: 'Lung Cancer',
  doid: '1324',
}

/** the variables the operation declares, e.g. `$doid` */
function declaredVariables(): Set<string> {
  const operation = DiseaseBrowseDocument.definitions.find(
    (d): d is OperationDefinitionNode => d.kind === 'OperationDefinition'
  )
  return new Set(
    (operation?.variableDefinitions ?? []).map((v) => v.variable.name.value)
  )
}

/** the variables the operation actually passes to a field or input object */
function usedVariables(): Set<string> {
  const used = new Set<string>()
  visit(DiseaseBrowseDocument, {
    Argument: (node) => {
      visit(node.value, { Variable: (v) => void used.add(v.name.value) })
    },
  })
  return used
}

describe('diseasesTableConfig', () => {
  describeEntityTableContract({
    spec: () =>
      diseasesTableConfig(TestBed.inject(DiseaseBrowseGQL), 'Diseases'),
    operationName: 'DiseaseBrowse',
    rows: [ROW, SECOND_ROW],
    connection: (rows, pageInfo) => ({
      browseDiseases: {
        __typename: 'BrowseDiseaseConnection',
        edges: rows.map((node) => ({ cursor: `c${node.id}`, node })),
        pageInfo,
        totalCount: 220,
        filteredCount: 220,
        pageCount: 7,
        lastUpdated: '2026-08-17T00:00:00Z',
      },
    }),
    // the disease is projected out of the row directly; each row feature is
    // seeded under its own Feature identity for the tags to resolve
    seeded: [
      ['Disease', 7],
      ['Feature', 5],
    ],
  })

  let apollo: Apollo
  let spec: ReturnType<typeof diseasesTableConfig>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockApollo(() => {
          throw new Error('no network expected')
        }),
      ],
    })
    apollo = TestBed.inject(Apollo)
    spec = diseasesTableConfig(TestBed.inject(DiseaseBrowseGQL), 'Diseases')
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
      ['doid', 'doid'],
      ['diseaseAliases', 'diseaseAlias'],
      ['features', 'featureName'],
    ])
  })

  it('cycles its count columns descend-first, as the legacy table did', () => {
    for (const key of [
      'featureCount',
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
      ['featureCount', 'civic-feature'],
      ['variantCount', 'civic-variant'],
      ['evidenceItemCount', 'civic-evidence'],
      ['assertionCount', 'civic-assertion'],
    ])
  })

  it('discloses its clip-prone text columns in hover tooltips', () => {
    expect(column('diseaseAliases').cell).toMatchObject({
      kind: 'text',
      tooltip: true,
    })
  })

  it('offers a sorter only where the schema has a sort column', () => {
    expect(
      spec.columns.filter((c) => c.sort).map((c) => c.sort!.column)
    ).toEqual([
      DiseasesSortColumns.Name,
      DiseasesSortColumns.Doid,
      DiseasesSortColumns.FeatureCount,
      DiseasesSortColumns.VariantCount,
      DiseasesSortColumns.EvidenceItemCount,
      DiseasesSortColumns.AssertionCount,
    ])
    expect(column('diseaseAliases').sort).toBeUndefined()
    expect(column('features').sort).toBeUndefined()
  })

  it('opens sorted by evidence count, as the legacy table always has', () => {
    expect(column('evidenceItemCount').sort?.default).toBe('descend')
  })

  describe('host scope', () => {
    it('passes the embed-site ids scope through', () => {
      const scoped = diseasesTableConfig(
        TestBed.inject(DiseaseBrowseGQL),
        undefined,
        { ids: [1, 2] }
      )
      expect(scoped.scope).toMatchObject({ ids: [1, 2] })
    })
  })

  describe('cell accessors', () => {
    it('addresses the disease by cache identity alone', () => {
      const entityTag = specCell(spec, 'name', 'entity-tag')
      expect(entityTag.ref(ROW)).toEqual({ __typename: 'Disease', id: 7 })
    })

    it('renders DOID as an external link-out to disease-ontology.org', () => {
      const link = specCell(spec, 'doid', 'external-link')
      expect(link.href(ROW)).toBe('https://disease-ontology.org/?id=DOID:1909')
      expect(link.text?.(ROW)).toBe('1909')
    })

    // href gated on doid, not just diseaseUrl: the external-link kind falls
    // back to the href as its label when `text` yields nothing, so a row
    // with a url but no doid would render the raw url where the legacy
    // table branched on doid and showed its empty state
    it('shows the empty state when doid is absent, whatever the url says', () => {
      const link = specCell(spec, 'doid', 'external-link')
      expect(link.href({ ...ROW, doid: undefined })).toBeUndefined()
    })

    it('renders aliases as highlightable plain text', () => {
      const text = specCell(spec, 'diseaseAliases', 'text')
      expect(text.text(ROW)).toEqual(['Malignant Melanoma'])
      expect(text.highlight).toBe(true)
    })

    it('renders the counts as count-tag cells', () => {
      expect(specCell(spec, 'featureCount', 'count-tag').count(ROW)).toBe(1)
      expect(specCell(spec, 'variantCount', 'count-tag').count(ROW)).toBe(40)
      expect(specCell(spec, 'evidenceItemCount', 'count-tag').count(ROW)).toBe(
        130
      )
      expect(specCell(spec, 'assertionCount', 'count-tag').count(ROW)).toBe(12)
    })

    it('addresses each row feature by cache identity', () => {
      const entityTag = specCell(spec, 'features', 'entity-tag')
      expect(entityTag.ref(ROW)).toEqual([{ __typename: 'Feature', id: 5 }])
    })
  })

  describe('cache seeds', () => {
    it('projects a disease that satisfies LinkableDisease', () => {
      const seedOf = (column('name').cell as any).seed
      writeCachedEntity(apollo, 'Disease', seedOf(ROW))

      expect(readCachedEntity(apollo, 'Disease', 7)).toMatchObject({
        name: 'Melanoma',
        link: '/diseases/7',
      })
    })

    it('projects features that satisfy LinkableFeature', () => {
      const seedOf = (column('features').cell as any).seed
      for (const seed of seedOf(ROW)) {
        writeCachedEntity(apollo, 'Feature', seed)
      }

      expect(readCachedEntity(apollo, 'Feature', 5)).toMatchObject({
        name: 'BRAF',
        link: '/features/5',
        featureType: FeatureInstanceTypes.Gene,
      })
    })
  })
})

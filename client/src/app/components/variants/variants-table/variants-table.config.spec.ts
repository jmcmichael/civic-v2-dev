import { TestBed } from '@angular/core/testing'
import {
  VariantCategories,
  VariantsSortColumns,
} from '@app/generated/civic.apollo.types'
import { provideMockApollo } from '@app/testing/apollo-test.providers'
import {
  describeEntityTableContract,
  specCell,
  specColumn,
} from '@app/testing/entity-table.harness'
import { SORT_DESCEND_FIRST } from '@app/tables'
import { readCachedEntity, writeCachedEntity } from '@app/tags'
import { Apollo } from 'apollo-angular'
import { beforeEach, describe, expect, it } from 'vitest'
import { variantsTableConfig } from './variants-table.config'
import {
  BrowseVariantsFieldsFragment,
  BrowseVariantsGQL,
} from './variants-table.query.gql.generated'

/**
 * The browse twin of `variant-manager.config.spec.ts`: the shared contract
 * plus the invariants a structurally-valid-but-wrong config would slip past
 * the compiler — filter→variable routing, sortable columns, scope
 * passthrough, and the cache-seed projections.
 */

const ROW: BrowseVariantsFieldsFragment = {
  __typename: 'BrowseVariant',
  id: 12,
  name: 'V600E',
  link: '/variants/12',
  deprecated: false,
  flagged: false,
  category: VariantCategories.Gene,
  evidenceItemCount: 130,
  featureId: 5,
  featureName: 'BRAF',
  featureLink: '/features/5',
  featureDeprecated: false,
  featureFlagged: true,
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
  aliases: [{ __typename: 'VariantAlias', name: 'RS113488022' }],
  variantTypes: [
    {
      __typename: 'LinkableVariantType',
      id: 9,
      name: 'Missense Variant',
      link: '/variant-types/9',
    },
  ],
}

const SECOND_ROW: BrowseVariantsFieldsFragment = {
  ...ROW,
  id: 34,
  name: 'V600K',
  link: '/variants/34',
  aliases: [{ __typename: 'VariantAlias', name: 'RS121913227' }],
}

describe('variantsTableConfig', () => {
  describeEntityTableContract({
    spec: () =>
      variantsTableConfig(TestBed.inject(BrowseVariantsGQL), 'Variants'),
    operationName: 'BrowseVariants',
    rows: [ROW, SECOND_ROW],
    connection: (rows, pageInfo) => ({
      browseVariants: {
        __typename: 'BrowseVariantConnection',
        edges: rows.map((node) => ({ cursor: `c${node.id}`, node })),
        pageInfo,
        totalCount: 4881,
        filteredCount: 4881,
        pageCount: 98,
        lastUpdated: '2026-08-17T00:00:00Z',
      },
    }),
    // variant and feature are projected out of the flattened row; the
    // variant types are readdressed from their LinkableVariantType projection
    seeded: [
      ['Variant', 12],
      ['Feature', 5],
      ['VariantType', 9],
    ],
  })

  let apollo: Apollo
  let spec: ReturnType<typeof variantsTableConfig>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockApollo(() => {
          throw new Error('no network expected')
        }),
      ],
    })
    apollo = TestBed.inject(Apollo)
    spec = variantsTableConfig(TestBed.inject(BrowseVariantsGQL), 'Variants')
  })

  const column = (key: string) => specColumn(spec, key)

  it('routes every filter to a variable the query declares', () => {
    expect(
      spec.columns.filter((c) => c.filter).map((c) => [c.key, c.filter!.var])
    ).toEqual([
      ['variant', 'variantName'],
      ['category', 'category'],
      ['feature', 'featureName'],
      ['aliases', 'variantAlias'],
      ['variantTypes', 'variantTypeName'],
      ['diseases', 'diseaseName'],
      ['therapies', 'therapyName'],
    ])
  })

  it('cycles its count column descend-first, as the legacy table did', () => {
    expect(column('evidenceCount').sort?.directions).toEqual(SORT_DESCEND_FIRST)
  })

  it('offers a sorter only where the schema has a sort column', () => {
    expect(
      spec.columns.filter((c) => c.sort).map((c) => [c.key, c.sort!.column])
    ).toEqual([
      ['variant', VariantsSortColumns.VariantName],
      ['feature', VariantsSortColumns.FeatureName],
      ['diseases', VariantsSortColumns.DiseaseName],
      ['therapies', VariantsSortColumns.TherapyName],
      ['evidenceCount', VariantsSortColumns.EvidenceItemCount],
    ])
    expect(column('aliases').sort).toBeUndefined()
    expect(column('variantTypes').sort).toBeUndefined()
  })

  it('opens sorted by evidence count, as the browse table always has', () => {
    expect(column('evidenceCount').sort?.default).toBe('descend')
  })

  it('offers every variant category in the type filter', () => {
    const filter = column('category').filter
    expect(filter?.kind).toBe('enum')
    if (filter?.kind !== 'enum') return
    expect(filter.options.map((option) => option.value)).toEqual(
      Object.values(VariantCategories)
    )
  })

  describe('host scope', () => {
    const gql = () => TestBed.inject(BrowseVariantsGQL)

    it('passes the embed-site scope variables through', () => {
      const scoped = variantsTableConfig(gql(), undefined, {
        ids: [1, 2],
        variantTypeId: 11,
        variantGroupId: 22,
      })
      expect(scoped.scope).toMatchObject({
        ids: [1, 2],
        variantTypeId: 11,
        variantGroupId: 22,
      })
    })

    it('sends hasNoVariantType only while the toggle is on', () => {
      const on = variantsTableConfig(gql(), undefined, {
        hasNoVariantType: true,
      })
      const off = variantsTableConfig(gql(), undefined, {
        hasNoVariantType: false,
      })
      expect(on.scope['hasNoVariantType']).toBe(true)
      // absent, not false — a cleared toggle must not reach the resolver
      expect(off.scope['hasNoVariantType']).toBeUndefined()
    })
  })

  describe('cell accessors', () => {
    const entityTag = (key: string) => specCell(spec, key, 'entity-tag')
    const textCell = (key: string) => specCell(spec, key, 'text')

    it('addresses the variant and feature by cache identity alone', () => {
      expect(entityTag('variant').ref(ROW)).toEqual({
        __typename: 'Variant',
        id: 12,
      })
      expect(entityTag('feature').ref(ROW)).toEqual({
        __typename: 'Feature',
        id: 5,
      })
    })

    it('passes nested entities through untouched', () => {
      expect(entityTag('diseases').ref(ROW)).toBe(ROW.diseases)
      expect(entityTag('therapies').ref(ROW)).toBe(ROW.therapies)
    })

    it('readdresses variant types from their Linkable projection', () => {
      // the schema types them LinkableVariantType; the tag spec knows only
      // VariantType, so the ref rewrites the typename and the seed writes
      // the entity under it
      expect(entityTag('variantTypes').ref(ROW)).toEqual([
        { __typename: 'VariantType', id: 9 },
      ])
    })

    it('renders the category and count as plain text', () => {
      expect(textCell('category').text(ROW)).toBe('Gene')
      expect(textCell('evidenceCount').text(ROW)).toBe(130)
      expect(textCell('aliases').text(ROW)).toEqual(['RS113488022'])
    })
  })

  describe('cache seeds', () => {
    const seedOf = (key: string) => (column(key).cell as any).seed

    it('projects a variant and its feature that satisfy their fragments', () => {
      writeCachedEntity(apollo, 'Variant', seedOf('variant')(ROW))
      writeCachedEntity(apollo, 'Feature', seedOf('feature')(ROW))

      expect(readCachedEntity(apollo, 'Variant', 12)).toMatchObject({
        name: 'V600E',
        link: '/variants/12',
      })
      expect(readCachedEntity(apollo, 'Feature', 5)).toMatchObject({
        name: 'BRAF',
        link: '/features/5',
        featureType: VariantCategories.Gene,
      })
    })

    it('projects variant types that satisfy LinkableVariantType', () => {
      for (const seed of seedOf('variantTypes')(ROW)) {
        writeCachedEntity(apollo, 'VariantType', seed)
      }
      expect(readCachedEntity(apollo, 'VariantType', 9)).toMatchObject({
        name: 'Missense Variant',
        link: '/variant-types/9',
      })
    })

    it('leaves the nested-entity columns unseeded', () => {
      expect(seedOf('diseases')).toBeUndefined()
      expect(seedOf('therapies')).toBeUndefined()
    })
  })
})

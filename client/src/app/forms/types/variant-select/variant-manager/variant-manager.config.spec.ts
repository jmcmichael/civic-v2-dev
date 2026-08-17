import { TestBed } from '@angular/core/testing'
import {
  VariantCategories,
  VariantsSortColumns,
} from '@app/generated/civic.apollo.types'
import { provideMockApollo } from '@app/testing/apollo-test.providers'
import { readCachedEntity, writeCachedEntity } from '@app/tags'
import { Apollo } from 'apollo-angular'
import { beforeEach, describe, expect, it } from 'vitest'
import { variantManagerConfig } from './variant-manager.config'
import {
  VariantManagerFieldsFragment,
  VariantManagerGQL,
} from './variant-manager.query.gql.generated'

/**
 * The config carries what three lookup tables used to: which query variable a
 * filter sets, which enum member a sort maps to, and how a cell reads its row.
 * Most of that is now checked by the compiler; these cover the parts that are
 * not — the accessors, and the two invariants a wrong config would satisfy
 * structurally while still being wrong.
 */

const ROW: VariantManagerFieldsFragment = {
  __typename: 'BrowseVariant',
  id: 12,
  name: 'V600E',
  link: '/variants/12',
  deprecated: false,
  flagged: false,
  category: VariantCategories.Gene,
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
}

describe('variantManagerConfig', () => {
  let apollo: Apollo
  let spec: ReturnType<typeof variantManagerConfig>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockApollo(() => {
          throw new Error('no network expected')
        }),
      ],
    })
    apollo = TestBed.inject(Apollo)
    spec = variantManagerConfig(TestBed.inject(VariantManagerGQL))
  })

  const column = (key: string) => {
    const found = spec.columns.find((c) => c.key === key)
    expect(found, `no column keyed '${key}'`).toBeTruthy()
    return found!
  }

  it('routes every filter to a variable the query declares', () => {
    // the compiler already pins this via `filter.var: keyof TVars`; asserting
    // the values catches a filter wired to the wrong real variable, which
    // typechecks perfectly and silently filters the wrong column
    expect(
      spec.columns.filter((c) => c.filter).map((c) => [c.key, c.filter!.var])
    ).toEqual([
      ['variant', 'variantName'],
      ['aliases', 'variantAlias'],
      ['feature', 'featureName'],
      ['diseases', 'diseaseName'],
      ['therapies', 'therapyName'],
    ])
  })

  /**
   * `aliases` used to declare `sort: {}` with no entry in
   * `columnKeyToSortColumnMap`, so its sorter sent
   * `sortBy: { column: undefined }` against a non-null `VariantsSort.column` —
   * clicking it failed the whole query. There is no alias member in
   * `VariantsSortColumns`, so the column simply is not sortable.
   */
  it('offers a sorter only where the schema has a sort column', () => {
    expect(
      spec.columns.filter((c) => c.sort).map((c) => [c.key, c.sort!.column])
    ).toEqual([
      ['variant', VariantsSortColumns.VariantName],
      ['feature', VariantsSortColumns.FeatureName],
      ['diseases', VariantsSortColumns.DiseaseName],
      ['therapies', VariantsSortColumns.TherapyName],
    ])
    expect(column('aliases').sort).toBeUndefined()
  })

  it('opens sorted by variant name, as it always has', () => {
    expect(column('variant').sort?.default).toBe('ascend')
  })

  describe('cell accessors', () => {
    const cellOf = (key: string) => column(key).cell as any

    it('addresses the variant and feature by cache identity alone', () => {
      // cvc-tag reads name and link from the cache, never from the ref, so the
      // old row projection's copies of them were dead weight
      expect(cellOf('variant').ref(ROW)).toEqual({
        __typename: 'Variant',
        id: 12,
      })
      expect(cellOf('feature').ref(ROW)).toEqual({
        __typename: 'Feature',
        id: 5,
      })
    })

    it('passes nested entities through untouched', () => {
      expect(cellOf('diseases').ref(ROW)).toBe(ROW.diseases)
      expect(cellOf('therapies').ref(ROW)).toBe(ROW.therapies)
    })

    it('plucks alias names, replacing the objectKey indirection', () => {
      expect(cellOf('aliases').text(ROW)).toEqual(['RS113488022'])
      expect(cellOf('aliases').highlight).toBe(true)
    })
  })

  describe('cache seeds', () => {
    // the table walks each entity-tag column's `seed` and writes the result;
    // these assert the projections themselves, which is where the field lists
    // have to match the Linkable* fragments exactly
    const seedOf = (key: string) => (column(key).cell as any).seed

    it('projects a variant that satisfies LinkableVariant', () => {
      expect(readCachedEntity(apollo, 'Variant', 12)).toBeUndefined()

      writeCachedEntity(apollo, 'Variant', seedOf('variant')(ROW))

      expect(readCachedEntity(apollo, 'Variant', 12)).toMatchObject({
        name: 'V600E',
        link: '/variants/12',
      })
    })

    it('projects a feature that satisfies LinkableFeature', () => {
      writeCachedEntity(apollo, 'Feature', seedOf('feature')(ROW))

      expect(readCachedEntity(apollo, 'Feature', 5)).toMatchObject({
        name: 'BRAF',
        link: '/features/5',
        flagged: true,
      })
    })

    // these arrive as real nested entities and normalise on their own
    it('leaves the nested-entity columns unseeded', () => {
      expect(seedOf('diseases')).toBeUndefined()
      expect(seedOf('therapies')).toBeUndefined()
    })

    /**
     * `LinkableFeature` selects `featureType`, which no consumer reads but
     * which `watchFragment` still requires for `complete`. `BrowseVariant` has
     * no such column, so the seed derives it from `category` —
     * `VariantCategories` and `FeatureInstanceTypes` have identical members.
     * If either enum gains a member the other lacks, this is where it shows.
     */
    it('derives the feature type from the variant category', () => {
      writeCachedEntity(apollo, 'Feature', seedOf('feature')(ROW))

      expect(readCachedEntity(apollo, 'Feature', 5)).toMatchObject({
        featureType: VariantCategories.Gene,
      })
    })
  })
})

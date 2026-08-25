import { TestBed } from '@angular/core/testing'
import { MolecularProfilesSortColumns } from '@app/generated/civic.apollo.types'
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
import { molecularProfileTableConfig } from './molecular-profile-table.config'
import {
  BrowseMolecularProfilesDocument,
  BrowseMolecularProfilesFieldsFragment,
  BrowseMolecularProfilesGQL,
} from './molecular-profile-table.query.gql.generated'

/**
 * The parity net ported from the (now-deleted) legacy
 * `molecular-profile-table.characterization.spec.ts`: the shared contract
 * plus the invariants the compiler cannot see -- filter -> variable routing
 * (including the declared∧used document walk), sortable columns, and the
 * `ids`/`variantId` host scope passthrough.
 *
 * Deliberately NOT ported: the legacy `variantId` bug -- `ngOnChanges`
 * never noticed a `variantId` change, and `refresh()`'s payload never
 * included it either, so a rebound `[variantId]` (e.g. route reuse between
 * two variants) was silently ignored forever. The facade's `computed` spec
 * always reflects both current scope signals, so `host scope` below
 * asserts the fix instead -- same treatment as sources-table's
 * `clinicalTrialId` bug.
 *
 * Also deliberately not ported: a default sort. Unlike every other migrated
 * table, the legacy opening query never set `sortBy` and no column header
 * carried a default `nzSortOrder` -- confirmed against the legacy
 * component/template before it was touched.
 */

const ROW: BrowseMolecularProfilesFieldsFragment = {
  __typename: 'BrowseMolecularProfile',
  id: 7,
  name: 'BRAF V600E',
  evidenceItemCount: 40,
  molecularProfileScore: 125.5,
  assertionCount: 3,
  variantCount: 1,
  link: '/molecular-profiles/7',
  deprecated: false,
  aliases: [{ __typename: 'MolecularProfileAlias', name: 'V600E' }],
  variants: [
    {
      __typename: 'LinkableVariant',
      id: 12,
      name: 'V600E',
      link: '/variants/12',
      matchText: 'V600E',
      feature: {
        __typename: 'LinkableFeature',
        id: 5,
        link: '/features/5',
        name: 'BRAF',
      },
    },
  ],
  therapies: [
    {
      __typename: 'LinkableTherapy',
      id: 9,
      name: 'Vemurafenib',
      link: '/therapies/9',
      deprecated: false,
    },
  ],
  diseases: [
    {
      __typename: 'LinkableDisease',
      id: 3,
      name: 'Melanoma',
      link: '/diseases/3',
      deprecated: false,
    },
  ],
}

const SECOND_ROW: BrowseMolecularProfilesFieldsFragment = {
  ...ROW,
  id: 8,
  name: 'BRAF V600K',
}

/** the variables the operation declares, e.g. `$variantName` */
function declaredVariables(): Set<string> {
  const operation = BrowseMolecularProfilesDocument.definitions.find(
    (d): d is OperationDefinitionNode => d.kind === 'OperationDefinition'
  )
  return new Set(
    (operation?.variableDefinitions ?? []).map((v) => v.variable.name.value)
  )
}

/** the variables the operation actually passes to a field or input object */
function usedVariables(): Set<string> {
  const used = new Set<string>()
  visit(BrowseMolecularProfilesDocument, {
    Argument: (node) => {
      visit(node.value, { Variable: (v) => void used.add(v.name.value) })
    },
  })
  return used
}

describe('molecularProfileTableConfig', () => {
  describeEntityTableContract({
    spec: () =>
      molecularProfileTableConfig(
        TestBed.inject(BrowseMolecularProfilesGQL),
        'Molecular Profiles'
      ),
    operationName: 'BrowseMolecularProfiles',
    rows: [ROW, SECOND_ROW],
    connection: (rows, pageInfo) => ({
      browseMolecularProfiles: {
        __typename: 'BrowseMolecularProfileConnection',
        edges: rows.map((node) => ({ cursor: `c${node.id}`, node })),
        pageInfo,
        filteredCount: 1104,
        pageCount: 32,
        lastUpdated: '2026-08-17T00:00:00Z',
      },
    }),
    // Disease/Therapy are projected out of nested fields, addressed by
    // their own real typenames; MolecularProfile itself is a custom cell
    seeded: [
      ['Disease', 3],
      ['Therapy', 9],
    ],
  })

  let apollo: Apollo
  let spec: ReturnType<typeof molecularProfileTableConfig>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockApollo(() => {
          throw new Error('no network expected')
        }),
      ],
    })
    apollo = TestBed.inject(Apollo)
    spec = molecularProfileTableConfig(
      TestBed.inject(BrowseMolecularProfilesGQL),
      'Molecular Profiles'
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
      ['name', 'molecularProfileName'],
      ['aliases', 'molecularProfileAlias'],
      ['variants', 'variantName'],
      ['diseases', 'diseaseName'],
      ['therapies', 'therapyName'],
    ])
  })

  it('offers a sorter only where the legacy table did', () => {
    expect(
      spec.columns.filter((c) => c.sort).map((c) => c.sort!.column)
    ).toEqual([
      MolecularProfilesSortColumns.MolecularProfileScore,
      MolecularProfilesSortColumns.EvidenceItemCount,
      MolecularProfilesSortColumns.AssertionCount,
      MolecularProfilesSortColumns.VariantCount,
    ])
    expect(column('name').sort).toBeUndefined()
    expect(column('diseases').sort).toBeUndefined()
  })

  it('opens with no default sort, unlike every other migrated table', () => {
    for (const key of [
      'molecularProfileScore',
      'evidenceItemCount',
      'assertionCount',
      'variantCount',
    ]) {
      expect(column(key).sort?.default).toBeUndefined()
    }
  })

  describe('host scope', () => {
    it('passes the embed-site ids and variantId scope through', () => {
      const scoped = molecularProfileTableConfig(
        TestBed.inject(BrowseMolecularProfilesGQL),
        undefined,
        { ids: [1, 2], variantId: 12 }
      )
      expect(scoped.scope).toMatchObject({ ids: [1, 2], variantId: 12 })
    })
  })

  describe('cell accessors', () => {
    it('renders Name, Aliases, and Variants as custom cells', () => {
      expect(column('name').cell.kind).toBe('custom')
      expect(column('aliases').cell.kind).toBe('custom')
      expect(column('variants').cell.kind).toBe('custom')
    })

    it('addresses diseases and therapies by cache identity alone', () => {
      const diseases = specCell(spec, 'diseases', 'entity-tag')
      expect(diseases.ref(ROW)).toEqual([{ __typename: 'Disease', id: 3 }])

      const therapies = specCell(spec, 'therapies', 'entity-tag')
      expect(therapies.ref(ROW)).toEqual([{ __typename: 'Therapy', id: 9 }])
    })

    it('renders the score and counts as plain text', () => {
      expect(specCell(spec, 'molecularProfileScore', 'text').text(ROW)).toBe(
        125.5
      )
      expect(specCell(spec, 'evidenceItemCount', 'text').text(ROW)).toBe(40)
      expect(specCell(spec, 'assertionCount', 'text').text(ROW)).toBe(3)
      expect(specCell(spec, 'variantCount', 'text').text(ROW)).toBe(1)
    })
  })

  describe('cache seeds', () => {
    it('projects a disease that satisfies LinkableDisease', () => {
      const seedOf = (column('diseases').cell as any).seed
      const [seeded] = seedOf(ROW)
      writeCachedEntity(apollo, 'Disease', seeded)

      expect(readCachedEntity(apollo, 'Disease', 3)).toMatchObject({
        name: 'Melanoma',
        link: '/diseases/3',
      })
    })

    it('projects a therapy that satisfies LinkableTherapy', () => {
      const seedOf = (column('therapies').cell as any).seed
      const [seeded] = seedOf(ROW)
      writeCachedEntity(apollo, 'Therapy', seeded)

      expect(readCachedEntity(apollo, 'Therapy', 9)).toMatchObject({
        name: 'Vemurafenib',
        link: '/therapies/9',
      })
    })
  })
})

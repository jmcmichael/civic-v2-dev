import { TestBed } from '@angular/core/testing'
import {
  EvidenceDirection,
  EvidenceLevel,
  EvidenceSignificance,
  EvidenceSortColumns,
  EvidenceStatus,
  EvidenceType,
  TherapyInteraction,
  VariantOrigin,
} from '@app/generated/civic.apollo.types'
import { provideMockApollo } from '@app/testing/apollo-test.providers'
import { describeEntityTableContract } from '@app/testing/entity-table.harness'
import { OperationDefinitionNode, visit } from 'graphql'
import { beforeEach, describe, expect, it } from 'vitest'
import { evidenceManagerConfig } from './evidence-manager.config'
import {
  EvidenceManagerDocument,
  EvidenceManagerFieldsFragment,
  EvidenceManagerGQL,
} from './evidence-manager.query.gql.generated'

/**
 * The config's filter and sort surface is typed against the query, so a
 * filter naming a variable the query does not declare, or a sort naming a
 * column the schema does not have, is a compile error.
 *
 * What types still cannot catch is a variable that is *declared but never
 * passed to the field* — `keyof EvidenceManagerQueryVariables` is generated
 * from the document's variable definitions, not from its argument list, so a
 * filter can name a real variable that reaches nothing. That is the shape of
 * the rating bug, and it is what the document walk below guards.
 */

const ROW: EvidenceManagerFieldsFragment = {
  __typename: 'EvidenceItem',
  id: 812,
  name: 'EID812',
  link: '/evidence/812',
  status: EvidenceStatus.Accepted,
  flagged: false,
  therapyInteractionType: TherapyInteraction.Combination,
  description: 'A description.',
  evidenceType: EvidenceType.Predictive,
  evidenceDirection: EvidenceDirection.Supports,
  evidenceLevel: EvidenceLevel.B,
  evidenceRating: 4,
  significance: EvidenceSignificance.Sensitivityresponse,
  variantOrigin: VariantOrigin.Somatic,
  disease: {
    __typename: 'Disease',
    id: 7,
    name: 'Melanoma',
    link: '/diseases/7',
    deprecated: false,
  },
  therapies: [
    {
      __typename: 'Therapy',
      id: 3,
      name: 'Vemurafenib',
      link: '/therapies/3',
      deprecated: false,
    },
  ],
  molecularProfile: {
    __typename: 'MolecularProfile',
    id: 12,
    name: 'BRAF V600E',
    link: '/molecular-profiles/12',
    flagged: false,
    deprecated: false,
    parsedName: [],
  },
}

/** the variables the operation declares, e.g. `$rating` */
function declaredVariables(): Set<string> {
  const operation = EvidenceManagerDocument.definitions.find(
    (d): d is OperationDefinitionNode => d.kind === 'OperationDefinition'
  )
  return new Set(
    (operation?.variableDefinitions ?? []).map((v) => v.variable.name.value)
  )
}

/** the variables the operation actually passes to a field or input object */
function usedVariables(): Set<string> {
  const used = new Set<string>()
  visit(EvidenceManagerDocument, {
    Argument: (node) => {
      visit(node.value, { Variable: (v) => void used.add(v.name.value) })
    },
  })
  return used
}

const SECOND_ROW: EvidenceManagerFieldsFragment = {
  ...ROW,
  id: 999,
  name: 'EID999',
  link: '/evidence/999',
  evidenceRating: 2,
}

describe('evidenceManagerConfig', () => {
  describeEntityTableContract({
    spec: () => evidenceManagerConfig(TestBed.inject(EvidenceManagerGQL)),
    operationName: 'EvidenceManager',
    rows: [ROW, SECOND_ROW],
    connection: (rows, pageInfo) => ({
      evidenceItems: {
        __typename: 'EvidenceItemConnection',
        edges: rows.map((node) => ({ cursor: `c${node.id}`, node })),
        pageInfo,
        totalCount: 11190,
        pageCount: 224,
      },
    }),
    // the EID filter normalises before the query sees it; the generic sample
    // would transform to null and make that column's assertion vacuous
    filterInputs: { id: 'EID123' },
    // nothing: evidenceItems returns real EvidenceItems and the query spreads
    // the Linkable* fragments, so every entity normalises on its own
    seeded: [],
  })

  let spec: ReturnType<typeof evidenceManagerConfig>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockApollo(() => {
          throw new Error('no network expected')
        }),
      ],
    })
    spec = evidenceManagerConfig(TestBed.inject(EvidenceManagerGQL))
  })

  const column = (key: string) => {
    const found = spec.columns.find((c) => c.key === key)
    expect(found, `no column keyed '${key}'`).toBeTruthy()
    return found!
  }

  it('gives every column a distinct key', () => {
    const keys = spec.columns.map((c) => c.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  describe('filters', () => {
    const filterColumns = () => spec.columns.filter((c) => c.filter)

    it('names only variables the query both declares and passes on', () => {
      const declared = declaredVariables()
      const used = usedVariables()

      const unreachable = filterColumns()
        .map((c) => ({ key: c.key, sends: c.filter!.var }))
        .filter(({ sends }) => !declared.has(sends) || !used.has(sends))

      expect(unreachable).toEqual([])
    })

    /**
     * The historical bug: the column is `evidenceRating`, the query's variable
     * is `$rating`, and it reaches the field as `evidenceRating: $rating`. The
     * old map named the column key, so the filter set a variable nothing read.
     */
    it('routes the rating column to the variable that exists', () => {
      expect(column('evidenceRating').filter!.var).toBe('rating')
      expect(declaredVariables().has('evidenceRating')).toBe(false)
    })

    it('offers every enum member the schema declares', () => {
      const options = (key: string) => {
        const filter = column(key).filter!
        expect(filter.kind).toBe('enum')
        return (filter as { options: ReadonlyArray<{ value: unknown }> })
          .options
      }

      expect(options('evidenceType').map((o) => o.value)).toEqual(
        Object.values(EvidenceType)
      )
      expect(options('therapyInteractionType').map((o) => o.value)).toEqual(
        Object.values(TherapyInteraction)
      )
    })
  })

  describe('sorts', () => {
    /**
     * All three of these sorters existed and none worked: `molecularProfile`
     * and `therapyInteractionType` had no entry in the old sort map and sent
     * `column: undefined`, failing the query outright, while `therapies` was
     * marked disabled because there was nothing to send. The server grew the
     * columns rather than the table dropping the sorters.
     */
    it('sorts on the columns that used to send undefined', () => {
      expect(column('molecularProfile').sort?.column).toBe(
        EvidenceSortColumns.MolecularProfileName
      )
      expect(column('therapies').sort?.column).toBe(
        EvidenceSortColumns.TherapyName
      )
      expect(column('therapyInteractionType').sort?.column).toBe(
        EvidenceSortColumns.TherapyInteractionType
      )
    })

    it('names only members the schema declares', () => {
      const members = new Set<string>(Object.values(EvidenceSortColumns))
      const unknown = spec.columns
        .filter((c) => c.sort)
        .map((c) => c.sort!.column)
        .filter((sortColumn) => !members.has(sortColumn))

      expect(unknown).toEqual([])
    })

    it('opens on EID ascending, as it always has', () => {
      expect(column('id').sort?.default).toBe('ascend')
    })
  })

  describe('cell accessors', () => {
    const cellOf = (key: string) => column(key).cell as any

    it('addresses the evidence item by cache identity alone', () => {
      expect(cellOf('id').ref(ROW)).toEqual({
        __typename: 'EvidenceItem',
        id: 812,
      })
    })

    it('passes nested entities through untouched', () => {
      expect(cellOf('molecularProfile').ref(ROW)).toBe(ROW.molecularProfile)
      expect(cellOf('disease').ref(ROW)).toBe(ROW.disease)
      expect(cellOf('therapies').ref(ROW)).toBe(ROW.therapies)
    })

    /**
     * `evidenceItems` returns real EvidenceItems and the query spreads the
     * Linkable* fragments, so every entity here normalises into the cache on
     * its own. Seeding is a Browse* concern.
     */
    it('seeds nothing, because nothing here arrives denormalised', () => {
      const seeded = spec.columns
        .filter((c) => c.cell.kind === 'entity-tag' && !!(c.cell as any).seed)
        .map((c) => c.key)

      expect(seeded).toEqual([])
    })

    it('expands enum values into sentences for their tooltips', () => {
      expect(cellOf('evidenceType').tooltip(ROW)).toBe('Predictive')
      expect(cellOf('evidenceRating').tooltip(ROW)).toBe('Four Stars')
    })
  })

  describe('the EID filter transform', () => {
    const transform = () => (column('id').filter as any).transform

    it('accepts an EID with or without its prefix', () => {
      expect(transform()('EID123')).toBe(123)
      expect(transform()('eid123')).toBe(123)
      expect(transform()('123')).toBe(123)
      expect(transform()('  EID123  ')).toBe(123)
    })

    it('clears rather than guessing at anything else', () => {
      expect(transform()('kinase')).toBeNull()
      expect(transform()('')).toBeNull()
      expect(transform()(null)).toBeNull()
    })
  })
})

import { TestBed } from '@angular/core/testing'
import { ClinicalTrialSortColumns } from '@app/generated/civic.apollo.types'
import { SORT_DESCEND_FIRST } from '@app/tables'
import { provideMockApollo } from '@app/testing/apollo-test.providers'
import {
  describeEntityTableContract,
  specCell,
  specColumn,
} from '@app/testing/entity-table.harness'
import { OperationDefinitionNode, visit } from 'graphql'
import { beforeEach, describe, expect, it } from 'vitest'
import { clinicalTrialsTableConfig } from './clinical-trials-table.config'
import {
  BrowseClinicalTrialsRowFieldsFragment,
  ClinicalTrialsBrowseDocument,
  ClinicalTrialsBrowseGQL,
} from './clinical-trials-table.query.gql.generated'

/**
 * The parity net ported from the (now-deleted) legacy
 * `clinical-trials-table.characterization.spec.ts`: the shared contract
 * plus the invariants the compiler cannot see — filter -> variable routing
 * (including the declared∧used document walk) and sortable columns (none
 * defaulted, matching the legacy table's unsorted opening query). No host
 * scope: the legacy table has no `ids`/entity-id input.
 */

const ROW: BrowseClinicalTrialsRowFieldsFragment = {
  __typename: 'BrowseClinicalTrial',
  id: 4,
  name: 'A Study of Vemurafenib in Patients With BRAF V600E Mutated Melanoma',
  nctId: 'NCT00949260',
  evidenceCount: 3,
  sourceCount: 1,
  link: '/clinical_trials/4',
}

const SECOND_ROW: BrowseClinicalTrialsRowFieldsFragment = {
  ...ROW,
  id: 7,
  name: 'A Study of Dabrafenib in Combination With Trametinib',
  nctId: 'NCT01584648',
}

/** the variables the operation declares, e.g. `$nctId` */
function declaredVariables(): Set<string> {
  const operation = ClinicalTrialsBrowseDocument.definitions.find(
    (d): d is OperationDefinitionNode => d.kind === 'OperationDefinition'
  )
  return new Set(
    (operation?.variableDefinitions ?? []).map((v) => v.variable.name.value)
  )
}

/** the variables the operation actually passes to a field or input object */
function usedVariables(): Set<string> {
  const used = new Set<string>()
  visit(ClinicalTrialsBrowseDocument, {
    Argument: (node) => {
      visit(node.value, { Variable: (v) => void used.add(v.name.value) })
    },
  })
  return used
}

describe('clinicalTrialsTableConfig', () => {
  describeEntityTableContract({
    spec: () =>
      clinicalTrialsTableConfig(
        TestBed.inject(ClinicalTrialsBrowseGQL),
        'Clinical Trials'
      ),
    operationName: 'ClinicalTrialsBrowse',
    rows: [ROW, SECOND_ROW],
    connection: (rows, pageInfo) => ({
      clinicalTrials: {
        __typename: 'BrowseClinicalTrialConnection',
        edges: rows.map((node) => ({ cursor: `c${node.id}`, node })),
        pageInfo,
        totalCount: 512,
        filteredCount: 512,
      },
    }),
    // ClinicalTrial is not a taggable typename -- nothing to seed
    seeded: [],
  })

  let spec: ReturnType<typeof clinicalTrialsTableConfig>

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockApollo(() => {
          throw new Error('no network expected')
        }),
      ],
    })
    spec = clinicalTrialsTableConfig(
      TestBed.inject(ClinicalTrialsBrowseGQL),
      'Clinical Trials'
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
      ['nctId', 'nctId'],
      ['name', 'name'],
    ])
  })

  it('cycles its count columns descend-first, as the legacy table did', () => {
    for (const key of ['sourceCount', 'evidenceCount']) {
      expect(column(key).sort?.directions).toEqual(SORT_DESCEND_FIRST)
    }
  })

  it('offers a sorter on every sortable column, none defaulted', () => {
    expect(
      spec.columns.filter((c) => c.sort).map((c) => c.sort!.column)
    ).toEqual([
      ClinicalTrialSortColumns.NctId,
      ClinicalTrialSortColumns.Name,
      ClinicalTrialSortColumns.SourceCount,
      ClinicalTrialSortColumns.EvidenceItemCount,
    ])
    // the legacy table's opening query never sets sortBy
    expect(spec.columns.every((c) => !c.sort?.default)).toBe(true)
  })

  describe('cell accessors', () => {
    it('renders name as highlightable plain text', () => {
      const text = specCell(spec, 'name', 'text')
      expect(text.text(ROW)).toBe(ROW.name)
      expect(text.highlight).toBe(true)
    })

    it('renders the counts as plain text', () => {
      expect(specCell(spec, 'sourceCount', 'text').text(ROW)).toBe(1)
      expect(specCell(spec, 'evidenceCount', 'text').text(ROW)).toBe(3)
    })

    it('renders NCT ID as a custom cell (ClinicalTrial is not a taggable typename)', () => {
      expect(column('nctId').cell.kind).toBe('custom')
    })
  })
})

import { AssertionState } from '@app/forms/states/assertion.state'
import { AssertionType } from '@app/generated/civic.apollo.types'
import { MockGraphqlOperation } from '@app/testing/apollo-test.providers'
import {
  createSelectFieldHarness,
  describeEntitySelectContract,
  describeTypeGateContract,
} from '@app/testing/select-field.harness'
import { describe, expect, it } from 'vitest'
import { CvcAcmgCodeSelectField } from './acmg-code-select.type'

// AcmgCode has no link; code and name carry the same value server-side
const acmgCode = (id: number, code: string, description: string) => ({
  __typename: 'AcmgCode' as const,
  id,
  name: code,
  code,
  description,
  tooltip: `${code} tooltip`,
})

const PVS1 = acmgCode(1, 'PVS1', 'Null variant in a LOF gene')
const PS1 = acmgCode(2, 'PS1', 'Same amino acid change as a known variant')

const respond = (op: MockGraphqlOperation) => {
  if (op.operationName === 'AcmgCodeSelectTypeahead') {
    return { acmgCodesTypeahead: [PVS1, PS1] }
  }
  if (op.operationName === 'AcmgCodeSelectTag') {
    return { acmgCode: [PVS1, PS1].find((c) => c.id === op.variables.id) }
  }
  throw new Error(`unexpected operation ${op.operationName}`)
}

describe('CvcAcmgCodeSelectField', () => {
  describeEntitySelectContract({
    fieldType: CvcAcmgCodeSelectField,
    type: 'acmg-code-select',
    multiType: 'acmg-code-multi-select',
    key: 'acmgCodeIds',
    typeaheadOp: 'AcmgCodeSelectTypeahead',
    tagOp: 'AcmgCodeSelectTag',
    respond,
    records: [PVS1, PS1],
    // this query names its search variable code, not name
    emptySearchVars: { code: '' },
    searchVars: (code) => ({ code }),
    tagVars: (id) => ({ id }),
    searchTerm: 'PVS',
    hasQuickAdd: false,
  })

  describeTypeGateContract({
    fieldType: CvcAcmgCodeSelectField,
    type: 'acmg-code-select',
    key: 'acmgCodeIds',
    respond,
    formState: () => new AssertionState(),
    typeKey: 'assertionType',
    requiredType: AssertionType.Predisposing,
    excludedType: AssertionType.Predictive,
    requiresKey: 'requiresAcmgCodes',
    value: PVS1.id,
    excludedPhrase: 'does not include associated ACMG/AMP Code(s)',
  })

  it('renders each code with its description', async () => {
    const h = await createSelectFieldHarness({
      type: 'acmg-code-select',
      key: 'acmgCodeIds',
      respond,
    })
    h.openDropdown()
    await h.settle()
    const text = h
      .optionItems()
      .map((el) => el.textContent?.replace(/\s+/g, ' ').trim())
      .join('|')
    expect(text).toContain('PVS1')
    expect(text).toContain('Null variant in a LOF gene')
    h.destroy()
  })
})

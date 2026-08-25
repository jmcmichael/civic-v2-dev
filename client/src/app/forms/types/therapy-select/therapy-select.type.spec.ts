import { EvidenceState } from '@app/forms/states/evidence.state'
import { EvidenceType } from '@app/generated/civic.apollo.types'
import { MockGraphqlOperation } from '@app/testing/apollo-test.providers'
import {
  createSelectFieldHarness,
  describeEntitySelectContract,
  describeTypeGateContract,
} from '@app/testing/select-field.harness'
import { describe, expect, it } from 'vitest'
import { CvcTherapySelectField } from './therapy-select.type'

const therapy = (id: number, name: string, ncitId: string) => ({
  __typename: 'Therapy' as const,
  id,
  name,
  link: `/therapies/${id}`,
  deprecated: false,
  ncitId,
  therapyAliases: [`${name} alias`],
})

const IMATINIB = therapy(51, 'Imatinib', 'C1687')
const SUNITINIB = therapy(52, 'Sunitinib', 'C71622')

const respond = (op: MockGraphqlOperation) => {
  if (op.operationName === 'TherapySelectTypeahead') {
    return { therapyTypeahead: [IMATINIB, SUNITINIB] }
  }
  if (op.operationName === 'TherapySelectTag') {
    return {
      therapy: [IMATINIB, SUNITINIB].find((t) => t.id === op.variables.id),
    }
  }
  throw new Error(`unexpected operation ${op.operationName}`)
}

describe('CvcTherapySelectField', () => {
  describeEntitySelectContract({
    fieldType: CvcTherapySelectField,
    type: 'therapy-select',
    multiType: 'therapy-multi-select',
    key: 'therapyIds',
    typeaheadOp: 'TherapySelectTypeahead',
    tagOp: 'TherapySelectTag',
    respond,
    records: [IMATINIB, SUNITINIB],
    emptySearchVars: { name: '' },
    searchVars: (name) => ({ name }),
    tagVars: (id) => ({ id }),
    searchTerm: 'ima',
  })

  describeTypeGateContract({
    fieldType: CvcTherapySelectField,
    type: 'therapy-select',
    key: 'therapyIds',
    respond,
    formState: () => new EvidenceState(),
    typeKey: 'evidenceType',
    requiredType: EvidenceType.Predictive,
    excludedType: EvidenceType.Diagnostic,
    requiresKey: 'requiresTherapy',
    value: IMATINIB.id,
    excludedPhrase: 'does not include associated therapies',
  })

  it('renders the NCIt id and aliases alongside each option', async () => {
    const h = await createSelectFieldHarness({
      type: 'therapy-select',
      key: 'therapyIds',
      respond,
    })
    h.openDropdown()
    await h.settle()
    const text = h
      .optionItems()
      .map((el) => el.textContent?.replace(/\s+/g, ' ').trim())
      .join('|')
    expect(text).toContain('C1687')
    expect(text).toContain('Imatinib alias')
    h.destroy()
  })
})

import { CONFIGS, walk } from '@app/forms/config/form-configs.fixture'
import { selectFieldTypes } from '@app/forms/select/select-fields.registry.module'
import { baseFieldTypes } from '@app/forms/types/base-fields.registry.module'
import { describe, expect, it } from 'vitest'
import { CVC_FIELD_MESSAGES, CvcFieldMessages } from './field-messages'

/**
 * The catalog's contract with the forms that read it. A message id resolves
 * from a field's `props.messageId`, its model key, or its registered type
 * name — none of which the compiler can check against the catalog, so this
 * spec does.
 */

const entries = Object.entries(CVC_FIELD_MESSAGES) as [
  string,
  CvcFieldMessages,
][]

const modelKeys = new Set(
  CONFIGS.flatMap(([, fields]) => walk(fields))
    .map((f) =>
      typeof f.key === 'string' ? f.key.split('.').pop() : undefined
    )
    .filter((k): k is string => !!k)
)

const registeredTypes = new Set(
  [...(baseFieldTypes.types ?? []), ...(selectFieldTypes.types ?? [])].map(
    (t) => (typeof t === 'string' ? t : t.name)
  )
)

describe('the field message catalog', () => {
  it('has an entry for every message id the form configs name', () => {
    const named = CONFIGS.flatMap(([, fields]) => walk(fields))
      .map((f) => f.props?.['messageId'])
      .filter((id): id is string => typeof id === 'string')
    expect(named.length).toBeGreaterThan(0)
    for (const id of new Set(named)) {
      expect(CVC_FIELD_MESSAGES).toHaveProperty(id)
    }
  })

  it('keys every entry to something a field can resolve', () => {
    // an id no field reaches is dead copy: it must be a model key, a
    // registered type name, or explicitly named by a config
    const named = new Set(
      CONFIGS.flatMap(([, fields]) => walk(fields))
        .map((f) => f.props?.['messageId'])
        .filter((id): id is string => typeof id === 'string')
    )
    for (const [id] of entries) {
      expect(
        modelKeys.has(id) || registeredTypes.has(id) || named.has(id),
        `${id} is unreachable`
      ).toBe(true)
    }
  })

  it('answers for required wherever it answers at all', () => {
    // formly renders the first error only, so an entry that covers a later
    // validator but not required would never be seen on an empty field
    for (const [id, messages] of entries) {
      expect(messages.required, `${id} has no required message`).toBeTruthy()
    }
  })

  it('reads as sentences', () => {
    for (const [id, messages] of entries) {
      for (const [key, text] of Object.entries(messages)) {
        expect(text, `${id}.${key}`).toMatch(/^[A-Z].*\.$/)
      }
    }
  })
})

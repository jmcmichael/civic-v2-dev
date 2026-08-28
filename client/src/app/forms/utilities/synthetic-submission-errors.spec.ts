import { describe, expect, it } from 'vitest'
import { syntheticSubmissionState } from './synthetic-submission-errors'

describe('syntheticSubmissionState', () => {
  it('produces specimens spanning every error category', () => {
    const state = syntheticSubmissionState()
    const categories = state.errors().map((e) => e.category)
    for (const category of [
      'graphql',
      'network',
      'apollo',
      'cache',
      'code',
    ] as const) {
      expect(categories).toContain(category)
    }
    expect(state.isSubmitting()).toBe(false)
    expect(state.success()).toBe(false)
  })

  it('specimens carry the detail fields the popover renders', () => {
    const errors = syntheticSubmissionState().errors()
    const graphql = errors.find((e) => e.category === 'graphql')!
    expect(graphql.code).toBe('VALIDATION_FAILED')
    expect(graphql.meta).toContainEqual({
      label: 'path',
      value: 'submitEvidenceItem.fields.evidenceLevel',
    })
    expect(graphql.json).toBeDefined()

    const server = errors.find((e) => e.code === '502')!
    expect(server.json).toMatchObject({ error: 'Bad Gateway' })

    // every specimen has copyable log text
    expect(errors.every((e) => e.log)).toBe(true)
  })
})

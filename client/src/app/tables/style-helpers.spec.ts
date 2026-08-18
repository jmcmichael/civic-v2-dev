import { describe, expect, it } from 'vitest'
import { heatmapStyle } from './style-helpers'

describe('heatmapStyle', () => {
  it('yields nothing for empty values or values at/below min', () => {
    expect(heatmapStyle(undefined, { max: 100 })).toBeUndefined()
    expect(heatmapStyle(0, { max: 100 })).toBeUndefined()
    expect(heatmapStyle(5, { min: 5, max: 100 })).toBeUndefined()
  })

  it('scales alpha linearly to position in [min, max]', () => {
    expect(heatmapStyle(50, { max: 100 })).toEqual({
      'background-color': 'rgba(24, 144, 255, 0.125)',
    })
  })

  it('clamps above max to the full tint', () => {
    expect(heatmapStyle(400, { max: 100, maxAlpha: 0.2 })).toEqual({
      'background-color': 'rgba(24, 144, 255, 0.200)',
    })
  })

  it('takes a custom color triple and a log scale', () => {
    const style = heatmapStyle(10, {
      max: 1000,
      color: '82, 196, 26',
      log: true,
    })
    // log1p(10)/log1p(1000) ≈ 0.347 → alpha ≈ 0.087
    expect(style).toEqual({ 'background-color': 'rgba(82, 196, 26, 0.087)' })
  })
})

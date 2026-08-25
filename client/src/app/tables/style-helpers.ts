import { Maybe } from '@app/generated/civic.apollo.types'
import { CvcStyle } from './entity-table.types'

/**
 * A linear heatmap for `styles.cell` / a cell spec's `style`: maps a value's
 * position in [min, max] onto the alpha of a background tint, so magnitude
 * reads at a glance — counts, scores, any cardinality.
 *
 * ```ts
 * styles: {
 *   cell: (row) =>
 *     heatmapStyle(row.evidenceItemCount, { max: 500, color: '43, 99, 182' }),
 * }
 * ```
 *
 * `color` is an `R, G, B` triple (defaults to ant's daybreak blue); alpha
 * runs 0 → `maxAlpha` (default 0.25, quiet enough for text legibility).
 * Values at/below `min` yield no style at all; above `max` clamp to full
 * tint. Scale is linear unless `log` — counts spanning orders of magnitude
 * read better logarithmically.
 */
export function heatmapStyle(
  value: Maybe<number>,
  options: {
    min?: number
    max: number
    color?: string
    maxAlpha?: number
    log?: boolean
  }
): Maybe<CvcStyle> {
  if (value === null || value === undefined) return undefined
  const min = options.min ?? 0
  if (value <= min) return undefined

  const scale = (v: number) => (options.log ? Math.log1p(v) : v)
  const position = Math.min(
    1,
    (scale(value) - scale(min)) / (scale(options.max) - scale(min) || 1)
  )
  const alpha = position * (options.maxAlpha ?? 0.25)
  return {
    'background-color': `rgba(${options.color ?? '24, 144, 255'}, ${alpha.toFixed(3)})`,
  }
}

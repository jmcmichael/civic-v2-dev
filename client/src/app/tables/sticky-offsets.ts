import { CvcColumn } from './entity-table.types'

/** the column members a pinned position is derived from */
type CvcPinnableColumn = Pick<CvcColumn<unknown>, 'key' | 'width' | 'fixed'>

/** a pinned column's resolved position, and whether it carries the edge shadow */
export interface CvcStickyOffset {
  left?: string
  right?: string
  lastLeft: boolean
  firstRight: boolean
}

/**
 * A column's declared width in pixels. Widths are `nzWidth` strings, documented
 * as px on `CvcColumn`; anything else yields 0 rather than NaN, which would
 * poison every offset after it.
 */
function pxWidth(width: string): number {
  const parsed = Number.parseFloat(width)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Where each pinned column sits, as a CSS length, plus which one carries the
 * edge shadow. Keyed by column key; a column that is not pinned is absent.
 *
 * ng-zorro can derive this itself — `nzLeft="true"` makes `NzTrDirective`
 * measure the preceding columns and push an offset back into each cell — but
 * that coordination does not reach these cells: every pinned column resolved to
 * `left: 0` and stacked on top of the next, so the select column sat over the
 * first data column. `ant-table-cell-fix-left-last` never appeared either, and
 * that class is pure list logic with no measurement in it, which is what rules
 * out a width problem. `NzCellFixedDirective.ngOnChanges` also resets that flag
 * on every input change, so the result depends on an ordering we do not control.
 *
 * Every width is a declared px value in the column config, so the offsets are
 * simple arithmetic. Computing them here is exact, needs no measurement pass,
 * and cannot be undone by a later change-detection cycle. `nzLeft` accepts a
 * CSS length as well as a boolean; a string turns ng-zorro's own auto-offset
 * off (`isAutoLeft` is only true for `''` or `true`), which is what we want.
 *
 * @param columns the visible columns, in render order
 */
export function resolveStickyOffsets(
  columns: ReadonlyArray<CvcPinnableColumn>
): ReadonlyMap<string, CvcStickyOffset> {
  const offsets = new Map<string, CvcStickyOffset>()

  let left = 0
  const pinnedLeft = columns.filter((c) => c.fixed === 'left')
  for (const column of pinnedLeft) {
    offsets.set(column.key, {
      left: `${left}px`,
      lastLeft: column === pinnedLeft[pinnedLeft.length - 1],
      firstRight: false,
    })
    left += pxWidth(column.width)
  }

  let right = 0
  const pinnedRight = columns.filter((c) => c.fixed === 'right')
  // right-pinned columns accumulate from the right-hand edge inward
  for (const column of [...pinnedRight].reverse()) {
    offsets.set(column.key, {
      right: `${right}px`,
      lastLeft: false,
      firstRight: column === pinnedRight[0],
    })
    right += pxWidth(column.width)
  }

  return offsets
}

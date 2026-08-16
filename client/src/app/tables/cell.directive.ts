import { Directive, TemplateRef, inject, input } from '@angular/core'
import { CvcSpecColumn, EntityTableSpec } from './entity-table-config'

/** what a `cvcCell` template receives */
export interface CvcCellContext<TRow> {
  $implicit: TRow
  row: TRow
  column: CvcSpecColumn<TRow>
}

/**
 * Per-column cell override:
 *
 * ```html
 * <cvc-entity-table [spec]="spec">
 *   <ng-template cvcCell="molecularProfile" [cvcCellOf]="spec" let-row>
 *     <cvc-tag [ref]="row.molecularProfile" />
 *   </ng-template>
 * </cvc-entity-table>
 * ```
 *
 * For genuine one-offs. The built-in `cell.kind`s cover almost every column
 * across both managers, and a column that opts out of them opts out of the
 * shared layout and filter wiring too — so reach for a cell kind first.
 *
 * ## The two type mechanics, since this is the codebase's first typed template
 *
 * `ngTemplateContextGuard` is what makes `let-row` a `TRow` instead of `any`.
 * Angular only consults it under `strictTemplates`, and only on a structural
 * directive, hence the `ng-template[cvcCell]` selector: on a plain attribute
 * selector the guard is ignored silently.
 *
 * `cvcCellOf` exists purely to give `TRow` something to infer from. A directive's
 * type parameter can only be inferred from its own inputs — never from a sibling
 * component's — so without it every `cvcCell` template would resolve to
 * `CvcCellDirective<unknown>` and `let-row` would be useless. Binding the same
 * spec the table gets is the least redundant carrier available; its value is
 * never read.
 */
@Directive({ selector: 'ng-template[cvcCell]' })
export class CvcCellDirective<TRow> {
  /** the `key` of the column this template renders */
  readonly cvcCell = input.required<string>()

  /** type carrier only — see the class docs */
  readonly cvcCellOf = input<EntityTableSpec<TRow>>()

  readonly template = inject(TemplateRef<CvcCellContext<TRow>>)

  static ngTemplateContextGuard<TRow>(
    _directive: CvcCellDirective<TRow>,
    _context: unknown
  ): _context is CvcCellContext<TRow> {
    return true
  }
}

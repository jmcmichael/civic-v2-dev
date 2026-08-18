import { Directive, TemplateRef, input } from '@angular/core'

/**
 * Projects host content into one column's filter cell, beside its filter
 * control — the home for table-scope menus that belong with a column rather
 * than in the toolbar (the assertions status/subgroups menu sits beside the
 * AID filter box this way):
 *
 * ```html
 * <cvc-entity-table [spec]="spec()">
 *   <ng-template cvcColumnFilterExtra="id">
 *     <nz-filter-trigger ... />
 *   </ng-template>
 * </cvc-entity-table>
 * ```
 *
 * The template renders with no context, so the embedded view is created
 * once — no outlet-context churn (see the tag-overflow lesson).
 */
@Directive({
  selector: 'ng-template[cvcColumnFilterExtra]',
})
export class CvcColumnFilterExtraDirective {
  /** the key of the column whose filter cell hosts this template */
  readonly cvcColumnFilterExtra = input.required<string>()

  constructor(readonly template: TemplateRef<void>) {}
}

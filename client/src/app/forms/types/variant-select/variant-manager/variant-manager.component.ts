import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
} from '@angular/core'
import { Maybe } from '@app/generated/civic.apollo.types'
import { CvcEntityTableComponent, CvcTableSettings } from '@app/tables'
import { Apollo } from 'apollo-angular'
import { variantManagerConfig } from './variant-manager.config'
import { VariantManagerGQL } from './variant-manager.query.gql.generated'

/**
 * The variant selection table, as a facade over `cvc-entity-table`.
 *
 * What remains of a 631-line component: the field-facing inputs and the table
 * config. The query pipeline, column preferences, filters, sort, virtual
 * scroll and error handling now live once in the table rather than twice
 * across this and the evidence manager.
 *
 * The I/O is deliberately unchanged — `variant-select.type.html` binds
 * `[cvcSelectedIds]` and `(cvcSelectedIdsChange)` and needs no edit. Neither
 * name is aliased: a `model()` called `cvcSelectedIds` emits
 * `cvcSelectedIdsChange` of its own accord, which is also what
 * `@angular-eslint/no-output-rename` requires.
 */
@Component({
  selector: 'cvc-variant-manager',
  imports: [CvcEntityTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Written out rather than as `[(selectedIds)]="cvcSelectedIds"`. The banana
  // box compiles — Angular calls `.set()` when the target is a writable signal
  // — but it reads as an assignment to a readonly property, which IDE analysis
  // flags as an error. These two lines say the same thing and say it plainly.
  template: `
    <cvc-entity-table
      [spec]="spec()"
      [selectedIds]="cvcSelectedIds()"
      (selectedIdsChange)="cvcSelectedIds.set($event)"
      [settings]="cvcTableSettings()" />
  `,
  styleUrl: './variant-manager.component.less',
})
export class CvcVariantManagerComponent {
  private readonly apollo = inject(Apollo)
  private readonly query = inject(VariantManagerGQL)

  /** the complete selection, in and out */
  readonly cvcSelectedIds = model<number[]>([])

  /**
   * Filters and column visibility pushed in by a sibling form field.
   *
   * Nothing binds this today — `variant-select.type.html` passes only the two
   * selection bindings — but the input stays, because the evidence manager's
   * field does bind it and the behaviour it drives is now generic to the
   * table. The sixty lines of filter-injection machinery that used to sit
   * behind it went with the old component; this forwards to the one
   * implementation.
   */
  readonly cvcTableSettings = input<Maybe<CvcTableSettings>>(undefined)

  protected readonly spec = computed(() =>
    variantManagerConfig(this.query, this.apollo)
  )
}

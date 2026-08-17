import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
} from '@angular/core'
import { Maybe } from '@app/generated/civic.apollo.types'
import {
  CvcEntityTableComponent,
  CvcFilterChange,
  CvcTableSettings,
} from '@app/tables'
import { evidenceManagerConfig } from './evidence-manager.config'
import { EvidenceManagerGQL } from './evidence-manager.query.gql.generated'

/**
 * What the evidence-select field pushes into the manager.
 *
 * Kept in the field's existing vocabulary — `preferences` entries are
 * `{ value, checked }`, not the table's `{ key, visible }` — so
 * `evidence-select.type.ts` needs no edit. The facade translates at the
 * boundary, which is one small function rather than a change rippling through
 * a field, its spec and its form configs.
 */
export type EvidenceManagerSettings = {
  filters: CvcFilterChange[]
  preferences: { value: string; checked?: boolean }[]
}

/**
 * The evidence selection table, as a facade over `cvc-entity-table`: the
 * field-facing inputs, the table config, and the settings translation below.
 *
 * `evidence-select.type.html` binds `[cvcSelectedIds]`,
 * `(cvcSelectedIdsChange)` and `[cvcTableSettings]`; that contract is pinned
 * by the field's specs and must not change shape here.
 */
@Component({
  selector: 'cvc-evidence-manager',
  imports: [CvcEntityTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <cvc-entity-table
      [spec]="spec()"
      [selectedIds]="cvcSelectedIds()"
      (selectedIdsChange)="cvcSelectedIds.set($event)"
      [settings]="settings()" />
  `,
  styleUrl: './evidence-manager.component.less',
})
export class CvcEvidenceManagerComponent {
  private readonly query = inject(EvidenceManagerGQL)

  /** the complete selection, in and out */
  readonly cvcSelectedIds = model<number[]>([])

  /** filters and column visibility driven by sibling fields on the form */
  readonly cvcTableSettings = input<Maybe<EvidenceManagerSettings>>(undefined)

  /**
   * Whether a required sibling field also shows its column.
   *
   * Off by default, deliberately: the field computes a `preferences` payload
   * from `REQUIRED_FIELD_TO_COL`, but auto-showing those columns is a
   * rejected feature. It is a switch rather than dead code so the path stays
   * covered by tests and re-enabling it is a config change.
   */
  readonly cvcApplyColumnPreferences = input(false)

  protected readonly spec = computed(() => evidenceManagerConfig(this.query))

  /**
   * The field's settings in the table's vocabulary.
   *
   * `filters` already match. `preferences` are translated, and dropped entirely
   * unless `cvcApplyColumnPreferences` is on — the payload is computed either
   * way, so gating it here is what keeps the default behaviour identical.
   */
  protected readonly settings = computed<Maybe<CvcTableSettings>>(() => {
    const settings = this.cvcTableSettings()
    if (!settings) return undefined
    return {
      filters: settings.filters,
      preferences: this.cvcApplyColumnPreferences()
        ? settings.preferences.map((pref) => ({
            key: pref.value,
            visible: pref.checked ?? false,
          }))
        : undefined,
    }
  })
}

import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core'
import { FormsModule } from '@angular/forms'
import { CvcTableDownloaderComponent } from '@app/components/shared/table-downloader/table-downloader.component'
import { Maybe } from '@app/generated/civic.apollo.types'
import { CvcEntityTableComponent } from '@app/tables'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox'
import { variantsTableConfig } from './variants-table.config'
import { BrowseVariantsGQL } from './variants-table.query.gql.generated'

/**
 * Browse-table facade over `cvc-entity-table`: keeps the legacy selector and
 * the input surface its ~4 embed sites bind (`ids`, `variantTypeId`,
 * `variantGroupId`, `cvcTitle`), while the table itself is configuration —
 * see `variants-table.config.ts`.
 *
 * The scope inputs feed the spec through a `computed`, so an embed changing
 * `[ids]` (query-search re-runs) re-queries through the table's normal
 * debounced-variables path — no `ngOnChanges` refetch plumbing.
 *
 * The legacy Variant Types "None" header filter survives as the Untyped
 * toolbar toggle; the downloader reads the table's live `queryVars()` the
 * way the legacy card-extra read `queryRef.variables`.
 */
@Component({
  selector: 'cvc-variants-table',
  imports: [
    CvcEntityTableComponent,
    CvcTableDownloaderComponent,
    FormsModule,
    NzCheckboxModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <cvc-entity-table
      #table
      [spec]="spec()"
      [titleTemplate]="cvcTitleTemplate()"
      [height]="cvcHeight() ?? '800px'">
      <span
        cvcTableToolbarExtra
        style="display: inline-flex; align-items: center; gap: 8px">
        <label
          nz-checkbox
          data-testid="has-no-variant-type"
          [ngModel]="hasNoVariantType()"
          (ngModelChange)="hasNoVariantType.set($event)">
          Untyped
        </label>
        <cvc-table-downloader
          [vars]="table.queryVars()"
          tableName="variants" />
      </span>
    </cvc-entity-table>
  `,
})
export class CvcVariantsTableComponent {
  private readonly gql = inject(BrowseVariantsGQL)

  readonly ids = input<Maybe<number[]>>()
  readonly variantTypeId = input<Maybe<number>>()
  readonly variantGroupId = input<Maybe<number>>()
  readonly cvcTitle = input<Maybe<string>>()
  readonly cvcTitleTemplate = input<Maybe<TemplateRef<void>>>()
  /** explicit body height; the default matches the legacy table's 800px */
  readonly cvcHeight = input<Maybe<string>>()

  /** show only variants with no variant type at all */
  protected readonly hasNoVariantType = signal(false)

  protected readonly spec = computed(() =>
    variantsTableConfig(this.gql, this.cvcTitle(), {
      ids: this.ids(),
      variantTypeId: this.variantTypeId(),
      variantGroupId: this.variantGroupId(),
      hasNoVariantType: this.hasNoVariantType(),
    })
  )
}

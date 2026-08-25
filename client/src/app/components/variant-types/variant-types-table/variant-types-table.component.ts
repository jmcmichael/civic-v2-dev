import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  inject,
  input,
} from '@angular/core'
import { CvcTableDownloaderComponent } from '@app/components/shared/table-downloader/table-downloader.component'
import { Maybe } from '@app/generated/civic.apollo.types'
import { CvcEntityTableComponent } from '@app/tables'
import { variantTypesTableConfig } from './variant-types-table.config'
import { VariantTypesBrowseGQL } from './variant-types-table.query.gql.generated'

/**
 * Browse-table facade over `cvc-entity-table`: keeps the legacy selector and
 * the input surface its 2 embed sites bind (`ids`, `cvcTitle`), while the
 * table itself is configuration — see `variant-types-table.config.ts`.
 *
 * The `ids` scope input feeds the spec through a `computed`, so an embed
 * changing it (query-search re-runs) re-queries through the table's normal
 * debounced-variables path — no `ngOnChanges` refetch plumbing. The
 * downloader reads the table's live `queryVars()` the way the legacy
 * card-extra read `queryRef.variables`.
 *
 * The legacy `initialUserFilters`/`initialPageSize` inputs had no consumers
 * (grepped across the app) and are dropped, matching the precedent set by
 * `variants-table`/`evidence-table`/`phenotypes-table`.
 */
@Component({
  selector: 'cvc-variant-types-table',
  imports: [CvcEntityTableComponent, CvcTableDownloaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <cvc-entity-table
      #table
      [spec]="spec()"
      [titleTemplate]="cvcTitleTemplate()"
      [height]="cvcHeight() ?? 'auto'">
      <cvc-table-downloader
        cvcTableToolbarExtra
        [vars]="table.queryVars()"
        tableName="variant_types" />
    </cvc-entity-table>
  `,
})
export class CvcVariantTypesTableComponent {
  private readonly gql = inject(VariantTypesBrowseGQL)

  readonly ids = input<Maybe<number[]>>()
  readonly cvcTitle = input<Maybe<string>>()
  readonly cvcTitleTemplate = input<Maybe<TemplateRef<void>>>()
  /** explicit body height; the default matches the legacy table's 800px */
  readonly cvcHeight = input<Maybe<string>>()

  protected readonly spec = computed(() =>
    variantTypesTableConfig(this.gql, this.cvcTitle(), {
      ids: this.ids(),
    })
  )
}

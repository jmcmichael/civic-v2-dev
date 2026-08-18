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
import { clinicalTrialsTableConfig } from './clinical-trials-table.config'
import { ClinicalTrialsBrowseGQL } from './clinical-trials-table.query.gql.generated'

/**
 * Browse-table facade over `cvc-entity-table`: keeps the legacy selector and
 * the input surface its 1 embed site binds (`cvcTitle`), while the table
 * itself is configuration — see `clinical-trials-table.config.ts`. No `ids`
 * scope input: the legacy table never had one.
 *
 * The downloader reads the table's live `queryVars()` the way the legacy
 * card-extra read `queryRef.variables`.
 *
 * The legacy `initialUserFilters`/`initialPageSize` inputs had no consumers
 * (grepped across the app) and are dropped, matching the precedent set by
 * the other migrated tables.
 */
@Component({
  selector: 'cvc-clinical-trials-table',
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
        tableName="clinical_trials" />
    </cvc-entity-table>
  `,
})
export class CvcClinicalTrialsTableComponent {
  private readonly gql = inject(ClinicalTrialsBrowseGQL)

  readonly cvcTitle = input<Maybe<string>>()
  readonly cvcTitleTemplate = input<Maybe<TemplateRef<void>>>()
  /** explicit body height; the default matches the legacy table's 800px */
  readonly cvcHeight = input<Maybe<string>>()

  protected readonly spec = computed(() =>
    clinicalTrialsTableConfig(this.gql, this.cvcTitle())
  )
}

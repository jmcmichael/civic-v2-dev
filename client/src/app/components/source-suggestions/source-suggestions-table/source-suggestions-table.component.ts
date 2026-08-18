import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  TemplateRef,
} from '@angular/core'
import { CvcTableDownloaderComponent } from '@app/components/shared/table-downloader/table-downloader.component'
import {
  Maybe,
  SourceSuggestionStatus,
} from '@app/generated/civic.apollo.types'
import { CvcEntityTableComponent, CvcTableSettings } from '@app/tables'
import { sourceSuggestionsTableConfig } from './source-suggestions-table.config'
import { BrowseSourceSuggestionsGQL } from './source-suggestions-table.query.gql.generated'

/**
 * Browse-table facade over `cvc-entity-table`: keeps the legacy selector and
 * the input surface its 5 embed sites bind (`[sourceId]` on sources-summary,
 * `[submitterId]` on user pages, titles), while the table itself is
 * configuration — see `source-suggestions-table.config.ts` and the four
 * custom cells beside it (status, submitter comment, submitter, and the
 * mutation-wired actions cell).
 *
 * The default NEW status filter is seeded through the table's `settings`, so
 * the column select opens showing New and the curator can widen or clear it
 * — legacy behavior, minus its bug: scope ids live on the spec, so filter
 * changes can no longer clobber `[sourceId]` (see the characterization spec
 * this facade's config spec ports).
 *
 * The legacy `initialPageSize` and `initialUserFilters` inputs had no
 * consumers and are dropped.
 */
@Component({
  selector: 'cvc-source-suggestions-table',
  imports: [CvcEntityTableComponent, CvcTableDownloaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <cvc-entity-table
      #table
      [spec]="spec()"
      [settings]="defaultSettings"
      [titleTemplate]="cvcTitleTemplate()"
      [height]="height()">
      <span cvcTableToolbarExtra>
        <cvc-table-downloader
          [vars]="table.queryVars()"
          tableName="source_suggestions" />
      </span>
    </cvc-entity-table>
  `,
})
export class CvcSourceSuggestionsTableComponent {
  private readonly gql = inject(BrowseSourceSuggestionsGQL)

  readonly sourceId = input<Maybe<number>>()
  readonly submitterId = input<Maybe<number>>()
  readonly cvcTitle = input<Maybe<string>>()
  readonly cvcTitleTemplate = input<Maybe<TemplateRef<void>>>()
  /** explicit body height; a bare number is treated as px (sources-summary
   * passes `cvcHeight="400"`) */
  readonly cvcHeight = input<Maybe<string>>()

  /** every embed opens filtered to NEW, as the legacy table always has */
  protected readonly defaultSettings: CvcTableSettings = {
    filters: [{ key: 'status', value: SourceSuggestionStatus.New }],
  }

  protected readonly height = computed(() => {
    const height = this.cvcHeight()
    if (!height) return 'auto'
    return /^\d+$/.test(height) ? `${height}px` : height
  })

  protected readonly spec = computed(() =>
    sourceSuggestionsTableConfig(
      this.gql,
      this.cvcTitle(),
      {
        sourceId: this.sourceId(),
        submitterId: this.submitterId(),
      },
      // a submitter-scoped table's rows all name the same submitter;
      // filtering on it is noise (legacy hid the input the same way)
      { hideSubmitterFilter: !!this.submitterId() }
    )
  )
}

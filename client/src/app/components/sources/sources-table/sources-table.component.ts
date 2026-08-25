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
import { sourcesTableConfig } from './sources-table.config'
import { BrowseSourcesGQL } from './sources-table.query.gql.generated'

/**
 * Browse-table facade over `cvc-entity-table`: keeps the legacy selector and
 * the input surface its 3 embed sites bind (`ids` at query-search,
 * `clinicalTrialId`+`cvcHeight` at clinical-trials-summary, neither at
 * sources-home), while the table itself is configuration — see
 * `sources-table.config.ts`.
 *
 * Both scope inputs feed the spec through a `computed`, so either changing
 * (query-search re-running, or a route-reused clinical-trials-summary
 * rebinding `[clinicalTrialId]`) re-queries through the table's normal
 * debounced-variables path — no `ngOnChanges` refetch plumbing, and no
 * chance of the legacy `clinicalTrialId`-goes-stale bug documented in the
 * (now-deleted) characterization spec: the computed always reflects the
 * current signals, full stop.
 *
 * `cvcHeight` was a legacy `number` (the one embed site passes a bare `400`)
 * rather than every other migrated table's `string`; kept as `number` here
 * to match the embed site literally, and stringified to px for
 * `cvc-entity-table`'s `[height]`.
 *
 * Defaults to `800px`, matching every other migrated facade — tried leaving
 * it unset first (the legacy table's own no-`cvcHeight` behavior was to
 * auto-measure the viewport via `cvcAutoHeightTarget`, a fundamentally
 * different, JS-driven mechanism `cvc-entity-table` doesn't have), and
 * confirmed live on :4201 that an unset `[height]` collapses the virtual
 * scroll viewport to 0px — rows are in the DOM (`innerText` has them) but
 * nothing is visible. `cvc-entity-table`'s flex-fill default apparently
 * needs a height-bounded ancestor none of this table's 3 embed sites
 * provide; every other facade already discovered this and defaults too.
 *
 * The legacy `initialUserFilters`/`initialPageSize` inputs had no consumers
 * (grepped across the app) and are dropped, matching the precedent set by
 * the other migrated tables.
 */
@Component({
  selector: 'cvc-sources-table',
  imports: [CvcEntityTableComponent, CvcTableDownloaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <cvc-entity-table
      #table
      [spec]="spec()"
      [titleTemplate]="cvcTitleTemplate()"
      [height]="heightPx()">
      <cvc-table-downloader
        cvcTableToolbarExtra
        [vars]="table.queryVars()"
        tableName="sources" />
    </cvc-entity-table>
  `,
})
export class CvcSourcesTableComponent {
  private readonly gql = inject(BrowseSourcesGQL)

  readonly ids = input<Maybe<number[]>>()
  readonly clinicalTrialId = input<Maybe<number>>()
  readonly cvcTitle = input<Maybe<string>>()
  readonly cvcTitleTemplate = input<Maybe<TemplateRef<void>>>()
  /** explicit body height in px, e.g. `cvcHeight="400"`; default matches the legacy table's 800px */
  readonly cvcHeight = input<Maybe<number>>()

  protected readonly heightPx = computed(() => {
    const height = this.cvcHeight()
    return height ? `${height}px` : 'auto'
  })

  protected readonly spec = computed(() =>
    sourcesTableConfig(this.gql, this.cvcTitle(), {
      ids: this.ids(),
      clinicalTrialId: this.clinicalTrialId(),
    })
  )
}

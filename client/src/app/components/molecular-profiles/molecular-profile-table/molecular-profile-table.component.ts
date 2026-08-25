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
import { molecularProfileTableConfig } from './molecular-profile-table.config'
import { BrowseMolecularProfilesGQL } from './molecular-profile-table.query.gql.generated'

/**
 * Browse-table facade over `cvc-entity-table`: keeps the legacy selector and
 * the input surface its 6 embed sites bind (`ids` at query-search,
 * `variantId`+`cvcHeight="300px"` at all 4 variant-summary pages, neither
 * at molecular-profiles-home), while the table itself is configuration --
 * see `molecular-profile-table.config.ts`.
 *
 * Both scope inputs feed the spec through a `computed`, so either changing
 * re-queries through the table's normal debounced-variables path -- no
 * `ngOnChanges` refetch plumbing, and no chance of the legacy
 * `variantId`-goes-stale bug documented in the (now-deleted)
 * characterization spec: the computed always reflects the current signals,
 * full stop.
 *
 * Defaults `cvcHeight` to 800px when unset, matching every other migrated
 * facade (confirmed live on sources-table that an unset `[height]`
 * collapses the virtual scroll viewport to 0px on its own unscoped home
 * embed -- the same risk applies here on molecular-profiles-home).
 *
 * The legacy `initialUserFilters`/`initialPageSize` inputs had no consumers
 * (grepped across the app) and are dropped, matching the precedent set by
 * the other migrated tables.
 */
@Component({
  selector: 'cvc-molecular-profiles-table',
  imports: [CvcEntityTableComponent, CvcTableDownloaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <cvc-entity-table
      #table
      [spec]="spec()"
      [titleTemplate]="cvcTitleTemplate()"
      [height]="cvcHeight() ?? '800px'">
      <cvc-table-downloader
        cvcTableToolbarExtra
        [vars]="table.queryVars()"
        tableName="molecular_profiles" />
    </cvc-entity-table>
  `,
})
export class CvcMolecularProfilesTableComponent {
  private readonly gql = inject(BrowseMolecularProfilesGQL)

  readonly ids = input<Maybe<number[]>>()
  readonly variantId = input<Maybe<number>>()
  readonly cvcTitle = input<Maybe<string>>()
  readonly cvcTitleTemplate = input<Maybe<TemplateRef<void>>>()
  readonly cvcHeight = input<Maybe<string>>()

  protected readonly spec = computed(() =>
    molecularProfileTableConfig(this.gql, this.cvcTitle(), {
      ids: this.ids(),
      variantId: this.variantId(),
    })
  )
}

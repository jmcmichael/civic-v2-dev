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
import { usersTableConfig } from './users-table.config'
import { UsersBrowseGQL } from './users-table.query.gql.generated'

/**
 * Browse-table facade over `cvc-entity-table`: keeps the legacy selector and
 * the input surface its 2 embed sites bind (`ids`, `cvcTitle`), while the
 * table itself is configuration — see `users-table.config.ts`.
 *
 * The `ids` scope input feeds the spec through a `computed`, so an embed
 * changing it (query-search re-runs) re-queries through the table's normal
 * debounced-variables path — no `ngOnChanges` refetch plumbing. This also
 * fixes a legacy bug: the old component's `refresh()` refetch never
 * included `ids`, so Apollo kept whatever `ids` was at mount forever,
 * however the input changed afterward (caught by the characterization
 * spec's `idsRefetchSends` override, now deleted). The `computed` always
 * reflects the current `ids` signal, so this can't recur.
 *
 * The downloader reads the table's live `queryVars()` the way the legacy
 * card-extra read `queryRef.variables`.
 *
 * The legacy `initialUserFilters`/`initialPageSize` inputs had no consumers
 * (grepped across the app) and are dropped, matching the precedent set by
 * the other migrated tables.
 */
@Component({
  selector: 'cvc-users-table',
  imports: [CvcEntityTableComponent, CvcTableDownloaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <cvc-entity-table
      #table
      [spec]="spec()"
      [titleTemplate]="cvcTitleTemplate()"
      [height]="cvcHeight() ?? 'auto'">
      <cvc-table-downloader
        cvcTableCtrlButton
        [vars]="table.queryVars()"
        tableName="users" />
    </cvc-entity-table>
  `,
})
export class CvcUsersTableComponent {
  private readonly gql = inject(UsersBrowseGQL)

  readonly ids = input<Maybe<number[]>>()
  readonly cvcTitle = input<Maybe<string>>()
  readonly cvcTitleTemplate = input<Maybe<TemplateRef<void>>>()
  /** explicit body height; the default matches the legacy table's 800px */
  readonly cvcHeight = input<Maybe<string>>()

  protected readonly spec = computed(() =>
    usersTableConfig(this.gql, this.cvcTitle(), {
      ids: this.ids(),
    })
  )
}

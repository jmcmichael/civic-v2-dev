import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
  TemplateRef,
} from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule } from '@angular/forms'
import { ViewerService } from '@app/core/services/viewer/viewer.service'
import { Maybe } from '@app/generated/civic.apollo.types'
import { CvcEntityTableComponent } from '@app/tables'
import { NzCardModule } from 'ng-zorro-antd/card'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox'
import { NzDropdownModule } from 'ng-zorro-antd/dropdown'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzTableModule } from 'ng-zorro-antd/table'
import { revisionsTableConfig } from './revisions-table.config'
import { RevisionsBrowseGQL } from './revisions-table.query.gql.generated'

/**
 * Browse-table facade over `cvc-entity-table`: keeps the legacy selector and
 * the input surface its 2 embed sites bind (the pending-revisions queue's
 * title, query-search's `[ids]`), while the table itself is configuration —
 * see `revisions-table.config.ts` and the four custom cells beside it.
 *
 * The legacy card-extra menu survives in the toolbar slot: the
 * "exclude revisions submitted by myself" checkbox, which scopes the query
 * by the signed-in curator's id. Hidden when `[ids]` scopes the table, like
 * the other tables' scope menus.
 *
 * Row expansion is deliberately gone — see the config's docstring.
 */
@Component({
  selector: 'cvc-revisions-table',
  imports: [
    CvcEntityTableComponent,
    FormsModule,
    NzCardModule,
    NzCheckboxModule,
    NzDropdownModule,
    NzGridModule,
    NzIconModule,
    NzTableModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <cvc-entity-table
      #table
      [spec]="spec()"
      [titleTemplate]="cvcTitleTemplate()"
      [height]="height()">
      @if (!idsScoped()) {
        <span cvcTableToolbarExtra>
          <nz-filter-trigger
            data-testid="revisions-scope-trigger"
            [nzVisible]="scopeMenuVisible"
            (nzVisibleChange)="scopeMenuVisible = $event"
            [nzActive]="excludeOwn()"
            [nzDropdownMenu]="scopeMenu">
            <span
              nz-icon
              nzType="filter"
              nzTheme="fill"></span>
          </nz-filter-trigger>
        </span>
      }
    </cvc-entity-table>

    <nz-dropdown-menu #scopeMenu>
      <nz-card data-testid="revisions-scope-menu">
        <nz-row>
          <nz-col nzSpan="2">
            <label
              nz-checkbox
              [ngModel]="excludeOwn()"
              (ngModelChange)="onExcludeOwnChange($event)"></label>
          </nz-col>
          <nz-col nzSpan="22">
            <span>Exclude revisions submitted by myself</span>
          </nz-col>
        </nz-row>
      </nz-card>
    </nz-dropdown-menu>
  `,
})
export class CvcRevisionsTableComponent {
  private readonly gql = inject(RevisionsBrowseGQL)
  private readonly viewerService = inject(ViewerService)

  readonly ids = input<Maybe<number[]>>()
  readonly cvcTitle = input<Maybe<string>>()
  readonly cvcTitleTemplate = input<Maybe<TemplateRef<void>>>()
  /** explicit body height; a bare number is treated as px */
  readonly cvcHeight = input<Maybe<string>>()

  protected scopeMenuVisible = false
  protected readonly excludeOwn = signal(false)

  private readonly viewer = toSignal(this.viewerService.viewer$)

  protected readonly idsScoped = computed(() => (this.ids()?.length ?? 0) > 0)

  protected readonly height = computed(() => {
    const height = this.cvcHeight()
    if (!height) return 'auto'
    return /^\d+$/.test(height) ? `${height}px` : height
  })

  protected readonly spec = computed(() =>
    revisionsTableConfig(this.gql, this.cvcTitle(), {
      ids: this.ids(),
      excludeRevisionsFromUserId: this.excludeOwn()
        ? this.viewer()?.user?.id
        : undefined,
    })
  )

  protected onExcludeOwnChange(exclude: boolean): void {
    this.excludeOwn.set(exclude)
    this.scopeMenuVisible = false
  }
}

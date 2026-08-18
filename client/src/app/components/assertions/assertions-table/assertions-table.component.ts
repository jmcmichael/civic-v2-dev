import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
} from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { CvcTableDownloaderComponent } from '@app/components/shared/table-downloader/table-downloader.component'
import {
  EvidenceStatusFilter,
  Maybe,
  OrganizationFilter,
} from '@app/generated/civic.apollo.types'
import {
  CvcColumnFilterExtraDirective,
  CvcEntityTableComponent,
  CvcTableSettings,
} from '@app/tables'
import { NzCardModule } from 'ng-zorro-antd/card'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox'
import { NzDropdownModule } from 'ng-zorro-antd/dropdown'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzRadioModule } from 'ng-zorro-antd/radio'
import { NzTableModule } from 'ng-zorro-antd/table'
import { assertionsTableConfig } from './assertions-table.config'
import { AssertionsBrowseGQL } from './assertions-table.query.gql.generated'

/**
 * The five query params `clinical-significance-counts` links carry to
 * `/assertions`, mapped to the column each prefilters. Snapshotted at init:
 * every producer navigates to a fresh page, and the legacy constructor
 * subscription was init-only in effect too (it mutated fields without
 * refetching).
 */
const FILTER_PARAMS: ReadonlyArray<[param: string, columnKey: string]> = [
  ['assertionType', 'assertionType'],
  ['assertionDirection', 'assertionDirection'],
  ['significance', 'significance'],
  ['molecularProfileName', 'molecularProfile'],
  ['diseaseName', 'disease'],
]

/**
 * Browse-table facade over `cvc-entity-table`: keeps the legacy selector and
 * the input surface its 11 embed sites bind (one entity-id scope input plus a
 * title, `[status]` on the curation queue and query-search), while the table
 * itself is configuration — see `assertions-table.config.ts`.
 *
 * The legacy card-extra scope menu survives in the toolbar slot: the
 * evidence-status radio plus, on organization pages, an include-subgroups
 * checkbox (worded for submitted vs approved assertions depending on which
 * org input scoped the table — one shared flag feeds both wrappers, as it
 * always has). The status radio is a `linkedSignal` seeded from `[status]`,
 * which fixes two legacy bugs at once: the radio claiming Non-Rejected while
 * the queue queried SUBMITTED, and `refresh()` silently reverting the host's
 * scope on any filter keystroke.
 *
 * The legacy `cvcTitleTemplate` and `variantId` inputs had no consumers and
 * are dropped.
 */
@Component({
  selector: 'cvc-assertions-table',
  imports: [
    CvcColumnFilterExtraDirective,
    CvcEntityTableComponent,
    CvcTableDownloaderComponent,
    FormsModule,
    NzCardModule,
    NzCheckboxModule,
    NzDropdownModule,
    NzGridModule,
    NzIconModule,
    NzRadioModule,
    NzTableModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <cvc-entity-table
      #table
      [spec]="spec()"
      [settings]="paramSettings"
      [height]="height()">
      <span cvcTableToolbarExtra>
        <cvc-table-downloader
          [vars]="table.queryVars()"
          tableName="assertions" />
      </span>
      <!-- the status/subgroups scope menu lives beside the AID filter box,
           in the id column's filter cell -->
      <ng-template cvcColumnFilterExtra="id">
        @if (!idsScoped()) {
          <nz-filter-trigger
            data-testid="assertions-scope-trigger"
            [nzVisible]="scopeMenuVisible"
            (nzVisibleChange)="scopeMenuVisible = $event"
            [nzActive]="scopeActive()"
            [nzDropdownMenu]="scopeMenu">
            <span
              nz-icon
              nzType="filter"
              nzTheme="fill"></span>
          </nz-filter-trigger>
        }
      </ng-template>
    </cvc-entity-table>

    <nz-dropdown-menu #scopeMenu>
      <nz-card data-testid="assertions-scope-menu">
        <nz-row>
          <nz-radio-group
            [ngModel]="statusFilter()"
            (ngModelChange)="onStatusChange($event)">
            <label
              nz-radio-button
              [nzValue]="statusFilters.NonRejected"
              >Non-Rejected</label
            >
            <label
              nz-radio-button
              [nzValue]="statusFilters.Accepted"
              >Accepted</label
            >
            <label
              nz-radio-button
              [nzValue]="statusFilters.Submitted"
              >Submitted</label
            >
            <label
              nz-radio-button
              [nzValue]="statusFilters.Rejected"
              >Rejected</label
            >
            <label
              nz-radio-button
              [nzValue]="statusFilters.All"
              >All</label
            >
          </nz-radio-group>
        </nz-row>
        @if (organizationId()) {
          <nz-row>
            <nz-col nzSpan="2">
              <label
                nz-checkbox
                [ngModel]="includeSubgroups()"
                (ngModelChange)="onSubgroupsChange($event)"></label>
            </nz-col>
            <nz-col nzSpan="22">
              <span>Include assertions submitted by child organizations</span>
            </nz-col>
          </nz-row>
        }
        @if (approvingOrganizationId()) {
          <nz-row>
            <nz-col nzSpan="2">
              <label
                nz-checkbox
                [ngModel]="includeSubgroups()"
                (ngModelChange)="onSubgroupsChange($event)"></label>
            </nz-col>
            <nz-col nzSpan="22">
              <span>Include assertions approved by child organizations</span>
            </nz-col>
          </nz-row>
        }
      </nz-card>
    </nz-dropdown-menu>
  `,
})
export class CvcAssertionsTableComponent {
  private readonly gql = inject(AssertionsBrowseGQL)
  private readonly route = inject(ActivatedRoute)

  readonly evidenceId = input<Maybe<number>>()
  readonly molecularProfileId = input<Maybe<number>>()
  readonly organizationId = input<Maybe<number>>()
  readonly approvingOrganizationId = input<Maybe<number>>()
  readonly userId = input<Maybe<number>>()
  readonly phenotypeId = input<Maybe<number>>()
  readonly diseaseId = input<Maybe<number>>()
  readonly therapyId = input<Maybe<number>>()
  readonly ids = input<Maybe<number[]>>()
  readonly status = input<Maybe<EvidenceStatusFilter>>()
  readonly cvcTitle = input<Maybe<string>>()
  /** explicit body height; a bare number is treated as px (the phenotypes
   * embed passes `cvcHeight="400"`) */
  readonly cvcHeight = input<Maybe<string>>()

  protected readonly statusFilters = EvidenceStatusFilter
  protected scopeMenuVisible = false

  /** the scope menu's choice; reseeds when the host's `[status]` changes */
  protected readonly statusFilter = linkedSignal<EvidenceStatusFilter>(
    () => this.status() ?? EvidenceStatusFilter.NonRejected
  )

  private readonly queryParams = toSignal(this.route.queryParamMap)

  /** query-param seeded, user-toggleable thereafter */
  protected readonly includeSubgroups = linkedSignal<boolean>(
    () => this.queryParams()?.get('includeSubgroups') === 'true'
  )

  /**
   * The clinical-significance-counts prefilters, read once from the opening
   * URL and handed to the table as settings — they land in the filter row's
   * controls and on the wire together.
   */
  protected readonly paramSettings: Maybe<CvcTableSettings> = (() => {
    const params = this.route.snapshot.queryParamMap
    const filters = FILTER_PARAMS.filter(([param]) => params.get(param)).map(
      ([param, key]) => ({ key, value: params.get(param) })
    )
    return filters.length ? { filters } : undefined
  })()

  protected readonly idsScoped = computed(() => (this.ids()?.length ?? 0) > 0)

  protected readonly scopeActive = computed(
    () =>
      this.statusFilter() !== EvidenceStatusFilter.NonRejected ||
      this.includeSubgroups()
  )

  protected readonly height = computed(() => {
    const height = this.cvcHeight()
    if (!height) return 'auto'
    return /^\d+$/.test(height) ? `${height}px` : height
  })

  private readonly organization = computed<Maybe<OrganizationFilter>>(() =>
    this.organizationFilter(this.organizationId())
  )

  private readonly approvingOrganizations = computed<Maybe<OrganizationFilter>>(
    () => this.organizationFilter(this.approvingOrganizationId())
  )

  private organizationFilter(id: Maybe<number>): Maybe<OrganizationFilter> {
    if (!id) return undefined
    return { ids: [id], includeSubgroups: this.includeSubgroups() }
  }

  protected readonly spec = computed(() =>
    assertionsTableConfig(this.gql, this.cvcTitle(), {
      evidenceId: this.evidenceId(),
      molecularProfileId: this.molecularProfileId(),
      userId: this.userId(),
      phenotypeId: this.phenotypeId(),
      diseaseId: this.diseaseId(),
      therapyId: this.therapyId(),
      ids: this.ids(),
      organization: this.organization(),
      approvingOrganizations: this.approvingOrganizations(),
      status: this.statusFilter(),
    })
  )

  protected onStatusChange(status: EvidenceStatusFilter): void {
    this.statusFilter.set(status)
    this.scopeMenuVisible = false
  }

  protected onSubgroupsChange(include: boolean): void {
    this.includeSubgroups.set(include)
    this.scopeMenuVisible = false
  }
}

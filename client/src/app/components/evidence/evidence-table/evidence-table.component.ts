import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
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
import { CvcEntityTableComponent } from '@app/tables'
import { NzCardModule } from 'ng-zorro-antd/card'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox'
import { NzDropdownModule } from 'ng-zorro-antd/dropdown'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzRadioModule } from 'ng-zorro-antd/radio'
import { NzTableModule } from 'ng-zorro-antd/table'
import { evidenceTableConfig } from './evidence-table.config'
import { EvidenceBrowseGQL } from './evidence-table.query.gql.generated'

/**
 * Browse-table facade over `cvc-entity-table`: keeps the legacy selector and
 * the input surface its ~13 embed sites bind (one entity-id scope input plus
 * a title, `[status]` on the curation queue, `[displayMolecularProfile]` on
 * molecular-profile pages), while the table itself is configuration — see
 * `evidence-table.config.ts`.
 *
 * The legacy card-extra scope menu survives in the toolbar slot: an
 * evidence-status radio plus, on organization pages, the include-subgroups
 * checkbox. `includeSubgroups` also reads the `?includeSubgroups=` query
 * param the organizations pages set, via a `linkedSignal` so a user's later
 * toggle overrides the param until it next changes.
 *
 * The legacy `initialTotalCount` output had no consumers and is dropped.
 */
@Component({
  selector: 'cvc-evidence-table',
  imports: [
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
      [titleTemplate]="cvcTitleTemplate()"
      [height]="height()">
      <span
        cvcTableToolbarExtra
        style="display: inline-flex; align-items: center; gap: 8px">
        <cvc-table-downloader
          [vars]="table.queryVars()"
          tableName="evidence" />
        @if (!idsScoped()) {
          <nz-filter-trigger
            data-testid="evidence-scope-trigger"
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
      </span>
    </cvc-entity-table>

    <nz-dropdown-menu #scopeMenu>
      <nz-card data-testid="evidence-scope-menu">
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
              <span>Include evidence submitted by child organizations</span>
            </nz-col>
          </nz-row>
        }
      </nz-card>
    </nz-dropdown-menu>
  `,
})
export class CvcEvidenceTableComponent {
  private readonly gql = inject(EvidenceBrowseGQL)
  private readonly route = inject(ActivatedRoute)

  readonly assertionId = input<Maybe<number>>()
  readonly clinicalTrialId = input<Maybe<number>>()
  readonly diseaseId = input<Maybe<number>>()
  readonly therapyId = input<Maybe<number>>()
  readonly organizationId = input<Maybe<number>>()
  readonly phenotypeId = input<Maybe<number>>()
  readonly sourceId = input<Maybe<number>>()
  readonly userId = input<Maybe<number>>()
  readonly variantId = input<Maybe<number>>()
  readonly molecularProfileId = input<Maybe<number>>()
  readonly ids = input<Maybe<number[]>>()
  readonly status = input<Maybe<EvidenceStatusFilter>>()
  readonly displayMolecularProfile = input<boolean>(true)
  readonly cvcTitle = input<Maybe<string>>()
  readonly cvcTitleTemplate = input<Maybe<TemplateRef<void>>>()
  /** explicit body height; a bare number is treated as px (legacy embeds
   * pass `cvcHeight="150"`) */
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

  private readonly organization = computed<Maybe<OrganizationFilter>>(() => {
    const id = this.organizationId()
    if (!id) return undefined
    return { ids: [id], includeSubgroups: this.includeSubgroups() }
  })

  protected readonly spec = computed(() =>
    evidenceTableConfig(
      this.gql,
      this.cvcTitle(),
      {
        assertionId: this.assertionId(),
        clinicalTrialId: this.clinicalTrialId(),
        diseaseId: this.diseaseId(),
        therapyId: this.therapyId(),
        phenotypeId: this.phenotypeId(),
        sourceId: this.sourceId(),
        userId: this.userId(),
        variantId: this.variantId(),
        molecularProfileId: this.molecularProfileId(),
        ids: this.ids(),
        organization: this.organization(),
        status: this.statusFilter(),
      },
      { displayMolecularProfile: this.displayMolecularProfile() }
    )
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

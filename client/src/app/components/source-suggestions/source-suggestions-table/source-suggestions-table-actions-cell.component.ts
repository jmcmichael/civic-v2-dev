import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { RouterLink } from '@angular/router'
import { CvcUpdateSourceSuggestionFormModule } from '@app/forms/components/update-source-suggestion/update-source-suggestion.module'
import { ViewerService } from '@app/core/services/viewer/viewer.service'
import { SourceSuggestionStatus } from '@app/generated/civic.apollo.types'
import { CvcCellContext } from '@app/tables'
import { injectContext } from '@taiga-ui/polymorpheus'
import { map } from 'rxjs/operators'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { NzSpaceModule } from 'ng-zorro-antd/space'
import { NzTooltipModule } from 'ng-zorro-antd/tooltip'
import { BrowseSourceSuggestionRowFieldsFragment } from './source-suggestions-table.query.gql.generated'

/**
 * The Actions column — the framework's first mutation-wired custom cell:
 *
 * - a create-evidence route button, prefilled with the row's molecular
 *   profile/source/disease and disabled unless the suggestion is NEW;
 * - a manage popover (click-triggered) hosting the existing
 *   `CvcUpdateSourceSuggestionForm`, which fires the status mutation. Each
 *   row's popover template binds its own row — no shared table-level
 *   selection state, unlike the legacy table's single template + selected*
 *   fields. Polymorpheus custom-cell content is not recreated per CD tick
 *   (verified live during the tag-overflow churn work), so the popover's
 *   open state is safe here.
 *
 * Gating is parity: any signed-in viewer sees both buttons ('--' when
 * signed out); the server authorizes the mutation itself.
 */
@Component({
  selector: 'cvc-source-suggestion-actions-cell',
  imports: [
    CvcUpdateSourceSuggestionFormModule,
    NzButtonModule,
    NzIconModule,
    NzPopoverModule,
    NzSpaceModule,
    NzTooltipModule,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (signedIn()) {
      <nz-space-compact>
        <button
          nz-button
          nzSize="small"
          routerLink="/evidence/add/submit"
          [queryParams]="evidenceParams"
          [disabled]="ctx.row.status !== statuses.New"
          nz-tooltip
          [nzTooltipTitle]="
            ctx.isScrolling ? '' : 'Create Evidence with this Source'
          "
          [nzTooltipMouseEnterDelay]="1">
          <span
            nz-icon
            nzType="civic-evidence"></span>
        </button>
        <button
          nz-button
          nzSize="small"
          nz-popover
          nzPopoverTitle="Manage Source Suggestion"
          nzPopoverPlacement="left"
          nzPopoverTrigger="click"
          [nzPopoverContent]="manageTpl"
          nz-tooltip
          [nzTooltipTitle]="ctx.isScrolling ? '' : 'Manage Source Suggestion'"
          nzTooltipPlacement="top"
          [nzTooltipMouseEnterDelay]="1">
          <span
            nz-icon
            nzType="civic-source"></span>
        </button>
      </nz-space-compact>
      <ng-template #manageTpl>
        <cvc-update-source-suggestion-form
          [sourceSuggestionId]="ctx.row.id"
          [currentStatus]="ctx.row.status" />
      </ng-template>
    } @else {
      --
    }
  `,
})
export class CvcSourceSuggestionActionsCellComponent {
  protected readonly ctx =
    injectContext<CvcCellContext<BrowseSourceSuggestionRowFieldsFragment>>()

  protected readonly statuses = SourceSuggestionStatus

  protected readonly signedIn = toSignal(
    inject(ViewerService).viewer$.pipe(map((v) => v.signedIn === true)),
    { initialValue: false }
  )

  /** stable per cell instance — the row is fixed for this cell's lifetime */
  protected readonly evidenceParams = {
    molecularProfileId: this.ctx.row.molecularProfile?.id,
    sourceId: this.ctx.row.source?.id,
    diseaseId: this.ctx.row.disease?.id,
    // the submit form reads these two as JSON, matching the legacy table
    therapyIds: JSON.stringify(this.ctx.row.therapies.map((t) => t.id)),
    therapyInteractionType: this.ctx.row.therapyInteractionType
      ? JSON.stringify(this.ctx.row.therapyInteractionType)
      : undefined,
  }
}

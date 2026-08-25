import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  Signal,
} from '@angular/core'
import { NzListModule } from 'ng-zorro-antd/list'
import { NzTypographyModule } from 'ng-zorro-antd/typography'
import { NzCollapseModule } from 'ng-zorro-antd/collapse'
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions'
import { CvcUserTagModule } from '@app/components/users/user-tag/user-tag.module'
import { CvcOrganizationTagModule } from '@app/components/organizations/organization-tag/organization-tag.module'
import { ApprovalListNodeFragment } from '@app/components/approvals/approval-list/approval-list.query.gql.generated'
import { Maybe } from '@app/generated/civic.apollo.types'
import { AssertionDetailFieldsFragment } from '@app/views/assertions/assertions-detail/assertions-detail.query.gql.generated'
import {
  ActivityStreamFilters,
  ActivityStreamSettings,
} from '@app/components/activities/activity-stream/activity-stream.types'
import {
  streamDefaultFilters,
  streamDefaultSettings,
} from '@app/components/activities/activity-stream/activity-stream.config'
import { CvcActivityStream } from '@app/components/activities/activity-stream/activity-stream.component'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { CvcPipesModule } from '@app/core/pipes/pipes.module'
import { CvcApprovalActionTooltipPipe } from '@app/components/approvals/approval-pipes/approval-action-tooltip.pipe'
import { CvcCanRevokeApproval } from '@app/components/approvals/approval-pipes/can-revoke-approval.pipe'
import { CvcApproveAssertionButtonComponent } from '@app/components/approvals/approve-assertion-button/approve-assertion-button.component'
import { Viewer, ViewerService } from '@app/core/services/viewer/viewer.service'
import { toSignal } from '@angular/core/rxjs-interop'
import { NzFlexModule } from 'ng-zorro-antd/flex'
import { CvcCanApproveApproval } from '@app/components/approvals/approval-pipes/can-approve-approval.pipe'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'cvc-approval-item',
  imports: [
    CommonModule,
    NzListModule,
    NzTypographyModule,
    NzCollapseModule,
    NzDescriptionsModule,
    NzTagModule,
    NzFlexModule,
    CvcPipesModule,
    CvcActivityStream,
    CvcUserTagModule,
    CvcOrganizationTagModule,
    CvcApprovalActionTooltipPipe,
    CvcCanRevokeApproval,
    CvcCanApproveApproval,
    CvcApproveAssertionButtonComponent,
  ],
  templateUrl: './approval-item.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './approval-item.component.less',
})
export class CvcApprovalItemComponent {
  cvcApproval = input.required<ApprovalListNodeFragment>()
  cvcAssertion = input.required<AssertionDetailFieldsFragment>()

  viewer: Signal<Maybe<Viewer>>

  constructor(private viewerService: ViewerService) {
    this.viewer = toSignal(this.viewerService.viewer$)
  }

  /** referentially stable so the stream's input seeding never re-runs */
  readonly feedSettings: ActivityStreamSettings = {
    ...streamDefaultSettings,
    showOrganization: false,
  }

  /** the approval's unapproved-changes window, recomputed per approval */
  readonly feedFilters = computed<ActivityStreamFilters>(() => ({
    ...streamDefaultFilters,
    linkedApprovalId: this.cvcApproval().id,
    occurredAfter: new Date(this.cvcApproval().lastReviewed),
  }))
}

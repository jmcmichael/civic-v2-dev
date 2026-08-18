import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core'
import { RevokeApprovalActivityDetailFragment } from './revoke-approval-activity.query.gql.generated'

import { CvcCommentBodyModule } from '@app/components/comments/comment-body/comment-body.module'
import { NzTypographyModule } from 'ng-zorro-antd/typography'

@Component({
  selector: 'cvc-revoke-approval-activity-details',
  imports: [CvcCommentBodyModule, NzTypographyModule],
  templateUrl: './revoke-approval-activity.component.html',
  styleUrl: './revoke-approval-activity.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcRevokeApprovalActivity {
  activity = input.required<RevokeApprovalActivityDetailFragment>({
    alias: 'cvcRevokeApprovalActivity',
  })
}

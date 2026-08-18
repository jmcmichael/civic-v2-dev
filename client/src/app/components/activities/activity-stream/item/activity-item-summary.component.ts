import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core'
import { CvcCommentTagModule } from '@app/components/comments/comment-tag/comment-tag.module'
import { CvcOrganizationTagModule } from '@app/components/organizations/organization-tag/organization-tag.module'
import { CvcUserTagModule } from '@app/components/users/user-tag/user-tag.module'
import { CvcPipesModule } from '@app/core/pipes/pipes.module'
import { CvcStreamItemContext } from '@app/streams/entity-stream.types'
import { injectContext } from '@taiga-ui/polymorpheus'
import { NzTypographyModule } from 'ng-zorro-antd/typography'
import { ActivityStreamState } from '../activity-stream-state'
import { ActivityStreamNode } from '../activity-stream.types'
import { CvcActivitySubjectTag } from './activity-subject-tag.component'

/**
 * One activity's summary line: user, verbiage, subject tag and organization,
 * with per-kind phrasing for approvals/revocations (organization-led) and
 * comment additions/deletions (comment-tag verbiage).
 *
 * Which tags render follows the stream's scope — a user-scoped stream
 * repeats no user tag, a subject-scoped one names its subject generically —
 * and popovers suspend while the stream scrolls, both read live from the
 * item context and `ActivityStreamState`.
 */
@Component({
  selector: 'cvc-activity-item-summary',
  templateUrl: './activity-item-summary.component.html',
  styleUrl: './activity-item-summary.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzTypographyModule,
    CvcPipesModule,
    CvcUserTagModule,
    CvcOrganizationTagModule,
    CvcCommentTagModule,
    CvcActivitySubjectTag,
  ],
})
export class CvcActivityItemSummary {
  protected readonly context =
    injectContext<CvcStreamItemContext<ActivityStreamNode>>()
  private readonly state = inject(ActivityStreamState)

  protected readonly mode = computed(() => this.state.scope().mode)
  protected readonly showOrganization = this.state.showOrganization
}

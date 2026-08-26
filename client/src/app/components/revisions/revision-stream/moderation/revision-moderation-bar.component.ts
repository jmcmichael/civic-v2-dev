import { NgStyle, NgTemplateOutlet } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core'
import { CvcCommentInputFormModule } from '@app/forms/components/comment-input/comment-input.module'
import { CvcOrgSelectorBtnGroupModule } from '@app/forms/components/org-selector-btn-group/org-selector-btn-group.module'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzCardModule } from 'ng-zorro-antd/card'
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzListModule } from 'ng-zorro-antd/list'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { NzSpaceModule } from 'ng-zorro-antd/space'
import { NzTooltipModule } from 'ng-zorro-antd/tooltip'
import { RevisionStreamState } from '../revision-stream-state'

/**
 * The moderation controls, rendered in the stream card's header-extra
 * slot: the Review Selected Revisions button, its comment/accept/reject
 * popover, and the validation-error indicator. All state lives in
 * `RevisionStreamState`; gating comes from its `can*` signals, which
 * wrap the pinned `revision-moderation` rules.
 */
@Component({
  selector: 'cvc-revision-moderation-bar',
  templateUrl: './revision-moderation-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgStyle,
    NgTemplateOutlet,
    NzButtonModule,
    NzCardModule,
    NzDescriptionsModule,
    NzIconModule,
    NzListModule,
    NzPopoverModule,
    NzSpaceModule,
    NzTooltipModule,
    CvcCommentInputFormModule,
    CvcOrgSelectorBtnGroupModule,
  ],
})
export class CvcRevisionModerationBar {
  protected readonly state = inject(RevisionStreamState)
  protected readonly mostRecentOrg = computed(
    () => this.state.viewer()?.mostRecentOrg
  )
}

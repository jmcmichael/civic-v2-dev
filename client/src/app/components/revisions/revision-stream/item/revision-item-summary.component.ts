import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcCommentBodyModule } from '@app/components/comments/comment-body/comment-body.module'
import { CvcPipesModule } from '@app/core/pipes/pipes.module'
import { CvcStreamItemContext } from '@app/streams/entity-stream.types'
import { injectContext } from '@taiga-ui/polymorpheus'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { NzSpaceModule } from 'ng-zorro-antd/space'
import { RevisionStreamNode } from '../revision-stream.types'

/**
 * One revision's summary line: the revision icon, its RID, the revised
 * field's display name, and — when the submission carried a note — a
 * comment icon whose popover shows it.
 */
@Component({
  selector: 'cvc-revision-item-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzIconModule,
    NzPopoverModule,
    NzSpaceModule,
    CvcCommentBodyModule,
    CvcPipesModule,
  ],
  template: `
    <nz-space>
      <span *nzSpaceItem>
        <span
          nz-icon
          nzTheme="twotone"
          [nzTwotoneColor]="'Revision' | entityColor"
          nzType="civic-revision"></span>
        RID{{ revision.id }}
        <span>{{ revision.linkoutData.name }} Updated</span>
      </span>
      @if (revision.creationActivity?.parsedNote; as note) {
        <span
          *nzSpaceItem
          nz-popover
          [nzPopoverContent]="creationComment"
          nz-icon
          nzType="comment"
          nzTheme="outline"></span>
        <ng-template #creationComment>
          <cvc-comment-body [commentBodySegments]="note"></cvc-comment-body>
        </ng-template>
      }
    </nz-space>
  `,
})
export class CvcRevisionItemSummary {
  protected readonly context =
    injectContext<CvcStreamItemContext<RevisionStreamNode>>()

  protected get revision(): RevisionStreamNode {
    return this.context.item
  }
}

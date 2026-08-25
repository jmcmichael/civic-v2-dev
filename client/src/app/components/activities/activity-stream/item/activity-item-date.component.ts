import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcPipesModule } from '@app/core/pipes/pipes.module'
import { CvcStreamItemContext } from '@app/streams/entity-stream.types'
import { injectContext } from '@taiga-ui/polymorpheus'
import { NzTypographyModule } from 'ng-zorro-antd/typography'
import { ActivityStreamNode } from '../activity-stream.types'

/** the item header's trailing timestamp, as relative time */
@Component({
  selector: 'cvc-activity-item-date',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzTypographyModule, CvcPipesModule],
  template: `
    <span
      nz-typography
      nzType="secondary">
      {{ context.item.createdAt | timeAgo }}
    </span>
  `,
})
export class CvcActivityItemDate {
  protected readonly context =
    injectContext<CvcStreamItemContext<ActivityStreamNode>>()
}

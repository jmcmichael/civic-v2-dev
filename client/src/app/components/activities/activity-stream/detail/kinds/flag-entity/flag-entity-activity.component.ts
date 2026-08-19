import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core'
import { FlagEntityActivityDetailFragment } from './flag-entity-activity.query.gql.generated'
import { CvcCommentBodyModule } from '@app/components/comments/comment-body/comment-body.module'
import { NzTypographyModule } from 'ng-zorro-antd/typography'

@Component({
  selector: 'cvc-flag-entity-activity-details',
  imports: [CvcCommentBodyModule, NzTypographyModule],
  templateUrl: './flag-entity-activity.component.html',
  styleUrl: './flag-entity-activity.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcFlagEntityActivity {
  activity = input.required<FlagEntityActivityDetailFragment>({
    alias: 'cvcFlagEntityActivity',
  })

}

import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcUserTagModule } from '@app/components/users/user-tag/user-tag.module'
import { CvcCellContext } from '@app/tables'
import { injectContext } from '@taiga-ui/polymorpheus'
import { RevisionSetBrowseFieldsFragment } from './revisions-table.query.gql.generated'

/**
 * The Submitter column: the creation activity's user via the bespoke
 * `cvc-user-tag` (`User` is not a taggable typename), with the column's
 * live filter emphasized in the label.
 */
@Component({
  selector: 'cvc-revisions-table-submitter-cell',
  imports: [CvcUserTagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ctx.row.creationActivity?.user; as user) {
      <cvc-user-tag
        [user]="user"
        [matchingText]="ctx.filterText()"
        [enablePopover]="!ctx.isScrolling" />
    }
  `,
})
export class CvcRevisionsTableSubmitterCellComponent {
  protected readonly ctx =
    injectContext<CvcCellContext<RevisionSetBrowseFieldsFragment>>()
}

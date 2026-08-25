import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcCellContext } from '@app/tables'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzTooltipModule } from 'ng-zorro-antd/tooltip'
import { injectContext } from '@taiga-ui/polymorpheus'
import { BrowseSourceRowFieldsFragment } from './sources-table.query.gql.generated'

/**
 * The sources browse table's Open Access column: an unlock/lock icon with a
 * tooltip, no text label at all. Neither the generic `enum-tag` kind (fixed
 * to enum-driven `civic-*` icons) nor `text` (no icon slot) can express an
 * icon keyed off a plain boolean, so this is `kind: 'custom'`.
 */
@Component({
  selector: 'cvc-source-open-access-cell',
  imports: [NzIconModule, NzTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      nz-icon
      [nzType]="ctx.row.openAccess ? 'unlock' : 'lock'"
      nzTheme="outline"
      nz-tooltip
      [nzTooltipTitle]="ctx.row.openAccess ? 'Open' : 'Closed'"></span>
  `,
})
export class CvcSourceOpenAccessCellComponent {
  protected readonly ctx =
    injectContext<CvcCellContext<BrowseSourceRowFieldsFragment>>()
}

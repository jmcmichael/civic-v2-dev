import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcMolecularProfileTagModule } from '@app/components/molecular-profiles/molecular-profile-tag/molecular-profile-tag.module'
import { CvcCellContext } from '@app/tables'
import { injectContext } from '@taiga-ui/polymorpheus'
import { BrowseMolecularProfilesFieldsFragment } from './molecular-profile-table.query.gql.generated'

/**
 * The molecular profiles browse table's Name column, as a `kind: 'custom'`
 * cell: `cvc-molecular-profile-tag`'s `LinkableMolecularProfile` input type
 * declares a `flagged` field `BrowseMolecularProfile` doesn't have in the
 * schema at all (confirmed against the generated type, same gap
 * variant-groups-table's own Name cell hit); `$any()` bypasses the mismatch
 * the same way.
 */
@Component({
  selector: 'cvc-molecular-profile-name-cell',
  imports: [CvcMolecularProfileTagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <cvc-molecular-profile-tag
      [molecularProfile]="$any(ctx.row)"
      [enablePopover]="!ctx.isScrolling"
      [truncateLongName]="true"
      popoverPlacement="right" />
  `,
})
export class CvcMolecularProfileNameCellComponent {
  protected readonly ctx =
    injectContext<CvcCellContext<BrowseMolecularProfilesFieldsFragment>>()
}

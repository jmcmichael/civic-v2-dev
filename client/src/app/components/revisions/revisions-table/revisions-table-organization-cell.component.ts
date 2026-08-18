import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcOrganizationTagModule } from '@app/components/organizations/organization-tag/organization-tag.module'
import { CvcCellContext } from '@app/tables'
import { injectContext } from '@taiga-ui/polymorpheus'
import { RevisionSetBrowseFieldsFragment } from './revisions-table.query.gql.generated'

/**
 * The Organization column: the creation activity's organization via the
 * bespoke `cvc-organization-tag` (`Organization` is not a taggable
 * typename); empty when the submitter acted without one, as legacy.
 */
@Component({
  selector: 'cvc-revisions-table-organization-cell',
  imports: [CvcOrganizationTagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ctx.row.creationActivity?.organization; as org) {
      <cvc-organization-tag [org]="org" />
    }
  `,
})
export class CvcRevisionsTableOrganizationCellComponent {
  protected readonly ctx =
    injectContext<CvcCellContext<RevisionSetBrowseFieldsFragment>>()
}

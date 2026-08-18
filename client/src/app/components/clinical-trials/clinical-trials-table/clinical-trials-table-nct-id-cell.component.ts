import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcClinicalTrialTagModule } from '@app/components/clinical-trials/clinical-trial-tag/clinical-trial-tag.module'
import { CvcCellContext } from '@app/tables'
import { CvcEmptyValueModule } from '@app/forms/components/empty-value/empty-value.module'
import { injectContext } from '@taiga-ui/polymorpheus'
import { BrowseClinicalTrialsRowFieldsFragment } from './clinical-trials-table.query.gql.generated'

/**
 * The clinical trials browse table's NCT ID column, as a `kind: 'custom'`
 * cell (`clinical-trials-table.config.ts`): `ClinicalTrial` is not a
 * taggable typename (no `entity-tag-specs.ts` entry, no `Linkable*`
 * fragment, no `TAG_POPOVERS` entry — unlike phenotypes/variant types),
 * so the generic `entity-tag` kind cannot address it. Wraps the existing
 * bespoke `cvc-clinical-trial-tag`, which has its own popover, instead.
 *
 * `nctId` is nullable in the schema (the legacy template bound the whole
 * row and never guarded it); this cell falls back to the empty state — a
 * custom cell owns its own empty rendering, the shared handling does not
 * apply.
 */
@Component({
  selector: 'cvc-clinical-trial-nct-id-cell',
  imports: [CvcClinicalTrialTagModule, CvcEmptyValueModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ctx.row.nctId; as nctId) {
      <cvc-clinical-trial-tag
        [clinicalTrial]="{ id: ctx.row.id, nctId, link: ctx.row.link }"
        [enablePopover]="!ctx.isScrolling"
        popoverPlacement="right" />
    } @else {
      <cvc-empty-value
        [cvcEmptyCategory]="ctx.column.emptyValue ?? 'unspecified'" />
    }
  `,
})
export class CvcClinicalTrialNctIdCellComponent {
  protected readonly ctx =
    injectContext<CvcCellContext<BrowseClinicalTrialsRowFieldsFragment>>()
}

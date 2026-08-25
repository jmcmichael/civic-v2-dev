import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcAssertionsTagModule } from '@app/components/assertions/assertions-tag/assertions-tag.module'
import { CvcCommentTagModule } from '@app/components/comments/comment-tag/comment-tag.module'
import { CvcEvidenceTagModule } from '@app/components/evidence/evidence-tag/evidence-tag.module'
import { CvcFeatureTagModule } from '@app/components/features/feature-tag/feature-tag.module'
import { CvcMolecularProfileTagModule } from '@app/components/molecular-profiles/molecular-profile-tag/molecular-profile-tag.module'
import { CvcFeatureVariantTagModule } from '@app/components/shared/feature-variant-tag/feature-variant-tag.module'
import { CvcSourceTagModule } from '@app/components/sources/source-tag/source-tag.module'
import { CvcVariantGroupTagModule } from '@app/components/variant-groups/variant-group-tag/variant-group-tag.module'
import { CvcCellContext } from '@app/tables'
import { injectContext } from '@taiga-ui/polymorpheus'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { CvcRevisionTagModule } from '../revision-tag/revision-tag.module'
import { RevisionSetBrowseFieldsFragment } from './revisions-table.query.gql.generated'

/**
 * The Revision Subject column: a RevisionSet's creation activity names the
 * entity the set revises, across a dozen possible typenames, each with its
 * own bespoke tag — no `Linkable*` coverage for several of them (the config
 * carries a commented-out generic-tag attempt from the legacy template as
 * witness), so this stays a custom cell reproducing the legacy switch.
 * Popovers suspend while scrolling via the live cell context.
 */
@Component({
  selector: 'cvc-revisions-table-subject-cell',
  imports: [
    CvcAssertionsTagModule,
    CvcCommentTagModule,
    CvcEvidenceTagModule,
    CvcFeatureTagModule,
    CvcFeatureVariantTagModule,
    CvcMolecularProfileTagModule,
    CvcRevisionTagModule,
    CvcSourceTagModule,
    CvcVariantGroupTagModule,
    NzTagModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (subject; as subject) {
      @switch (subject.__typename) {
        @case ('Feature') {
          <cvc-feature-tag
            [feature]="$any(subject)"
            [enablePopover]="!ctx.isScrolling" />
        }
        @case ('Assertion') {
          <cvc-assertion-tag
            [assertion]="$any(subject)"
            [enablePopover]="!ctx.isScrolling" />
        }
        @case ('Comment') {
          <cvc-comment-tag
            [comment]="$any(subject)"
            [enablePopover]="!ctx.isScrolling" />
        }
        @case ('EvidenceItem') {
          <cvc-evidence-tag
            [evidence]="$any(subject)"
            [enablePopover]="!ctx.isScrolling" />
        }
        @case ('GeneVariant') {
          <cvc-feature-variant-tag
            [variant]="$any(subject)"
            [feature]="$any(subject).feature"
            [truncateLongName]="true"
            [enablePopover]="!ctx.isScrolling" />
        }
        @case ('FactorVariant') {
          <cvc-feature-variant-tag
            [variant]="$any(subject)"
            [feature]="$any(subject).feature"
            [truncateLongName]="true"
            [enablePopover]="!ctx.isScrolling" />
        }
        @case ('FusionVariant') {
          <cvc-feature-variant-tag
            [variant]="$any(subject)"
            [feature]="$any(subject).feature"
            [truncateLongName]="true"
            [enablePopover]="!ctx.isScrolling" />
        }
        @case ('RegionVariant') {
          <cvc-feature-variant-tag
            [variant]="$any(subject)"
            [feature]="$any(subject).feature"
            [truncateLongName]="true"
            [enablePopover]="!ctx.isScrolling" />
        }
        @case ('Revision') {
          <cvc-revision-tag
            [revision]="$any(subject)"
            [enablePopover]="!ctx.isScrolling" />
        }
        @case ('VariantGroup') {
          <cvc-variant-group-tag
            [variantgroup]="$any(subject)"
            [enablePopover]="!ctx.isScrolling" />
        }
        @case ('Source') {
          <cvc-source-tag
            mode="concise"
            [source]="$any(subject)"
            [enablePopover]="!ctx.isScrolling" />
        }
        @case ('MolecularProfile') {
          <cvc-molecular-profile-tag
            [molecularProfile]="$any(subject)"
            [truncateLongName]="true"
            [enablePopover]="!ctx.isScrolling" />
        }
        @default {
          <nz-tag>{{ subject.__typename }} {{ subject.name }}</nz-tag>
        }
      }
    }
  `,
})
export class CvcRevisionsTableSubjectCellComponent {
  protected readonly ctx =
    injectContext<CvcCellContext<RevisionSetBrowseFieldsFragment>>()

  protected get subject() {
    return this.ctx.row.creationActivity?.subject
  }
}

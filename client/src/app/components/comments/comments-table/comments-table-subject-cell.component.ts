import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcAssertionsTagModule } from '@app/components/assertions/assertions-tag/assertions-tag.module'
import { CvcEvidenceTagModule } from '@app/components/evidence/evidence-tag/evidence-tag.module'
import { CvcFeatureTagModule } from '@app/components/features/feature-tag/feature-tag.module'
import { CvcFlagTagModule } from '@app/components/flags/flag-tag/flag-tag.module'
import { CvcMolecularProfileTagModule } from '@app/components/molecular-profiles/molecular-profile-tag/molecular-profile-tag.module'
import { CvcRevisionTagModule } from '@app/components/revisions/revision-tag/revision-tag.module'
import { CvcFeatureVariantTagModule } from '@app/components/shared/feature-variant-tag/feature-variant-tag.module'
import { CvcSourceTagModule } from '@app/components/sources/source-tag/source-tag.module'
import { CvcVariantGroupTagModule } from '@app/components/variant-groups/variant-group-tag/variant-group-tag.module'
import { CvcCellContext } from '@app/tables'
import { injectContext } from '@taiga-ui/polymorpheus'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { CommentBrowseFieldsFragment } from './comments-table.query.gql.generated'

/**
 * The comments browse table's Subject column, as a `kind: 'custom'` cell:
 * `comment.commentable` is a GraphQL union spanning ~20 possible schema
 * types (only 10 of which this query selects extra fields for), each
 * needing a different bespoke tag component — some with extra props
 * (`cvc-feature-variant-tag` needs both the variant AND its nested
 * `feature`; `cvc-molecular-profile-tag`/`cvc-feature-variant-tag` want
 * `truncateLongName`; `cvc-source-tag` wants `mode="concise"`). Several of
 * the ten (Assertion, EvidenceItem, Feature, MolecularProfile, Source, the
 * Variant kinds) ARE taggable typenames elsewhere, but the generic
 * `entity-tag` kind addresses one typename per column, not a dynamic
 * per-row union — this is a straight port of the legacy `@switch`, `$any`
 * casts included where the legacy template already needed them.
 */
@Component({
  selector: 'cvc-comment-subject-cell',
  imports: [
    CvcAssertionsTagModule,
    CvcEvidenceTagModule,
    CvcFeatureTagModule,
    CvcFeatureVariantTagModule,
    CvcFlagTagModule,
    CvcMolecularProfileTagModule,
    CvcRevisionTagModule,
    CvcSourceTagModule,
    CvcVariantGroupTagModule,
    NzTagModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let subject = ctx.row.commentable;
    @switch (subject.__typename) {
      @case ('Assertion') {
        <cvc-assertion-tag
          [assertion]="$any(subject)"
          [enablePopover]="!ctx.isScrolling" />
      }
      @case ('EvidenceItem') {
        <cvc-evidence-tag
          [evidence]="$any(subject)"
          [enablePopover]="!ctx.isScrolling" />
      }
      @case ('Feature') {
        <cvc-feature-tag
          [feature]="$any(subject)"
          [enablePopover]="!ctx.isScrolling" />
      }
      @case ('Flag') {
        <cvc-flag-tag
          [flag]="$any(subject)"
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
      @case ('MolecularProfile') {
        <cvc-molecular-profile-tag
          [molecularProfile]="$any(subject)"
          [truncateLongName]="true"
          [enablePopover]="!ctx.isScrolling" />
      }
      @case ('Revision') {
        <cvc-revision-tag
          [revision]="$any(subject)"
          [enablePopover]="!ctx.isScrolling" />
      }
      @case ('Source') {
        <cvc-source-tag
          mode="concise"
          [source]="$any(subject)"
          [enablePopover]="!ctx.isScrolling" />
      }
      @case ('VariantGroup') {
        <cvc-variant-group-tag
          [variantgroup]="$any(subject)"
          [enablePopover]="!ctx.isScrolling" />
      }
      @default {
        <nz-tag>{{ subject.__typename }} {{ $any(subject).name }}</nz-tag>
      }
    }
  `,
})
export class CvcCommentSubjectCellComponent {
  protected readonly ctx =
    injectContext<CvcCellContext<CommentBrowseFieldsFragment>>()
}

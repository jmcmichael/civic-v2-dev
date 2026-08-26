import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CvcCommentBodyModule } from '@app/components/comments/comment-body/comment-body.module'
import { CvcDiseaseTagModule } from '@app/components/diseases/disease-tag/disease-tag.module'
import { CvcEvidenceTagModule } from '@app/components/evidence/evidence-tag/evidence-tag.module'
import { CvcFeatureTagModule } from '@app/components/features/feature-tag/feature-tag.module'
import { CvcMolecularProfileTagModule } from '@app/components/molecular-profiles/molecular-profile-tag/molecular-profile-tag.module'
import { CvcPhenotypeTagModule } from '@app/components/phenotypes/phenotype-tag/phenotype-tag.module'
import { RevisionListDiffModule } from '@app/components/revisions/revision-list-diff/revision-list-diff.module'
import { CvcRevisionValueDiffModule } from '@app/components/revisions/revision-value-diff/revision-value-diff.module'
import { CvcFeatureVariantTagModule } from '@app/components/shared/feature-variant-tag/feature-variant-tag.module'
import { CvcSourceTagModule } from '@app/components/sources/source-tag/source-tag.module'
import { CvcTherapyTagModule } from '@app/components/therapies/cvc-therapy-tag/cvc-therapy-tag.module'
import { CvcUserTagModule } from '@app/components/users/user-tag/user-tag.module'
import { CvcVariantTypeTagModule } from '@app/components/variant-types/variant-type-tag/variant-type-tag.module'
import { CvcPipesModule } from '@app/core/pipes/pipes.module'
import { Maybe, RevisionStatus } from '@app/generated/civic.apollo.types'
import { CvcStreamItemContext } from '@app/streams/entity-stream.types'
import { injectContext } from '@taiga-ui/polymorpheus'
import { NzDividerModule } from 'ng-zorro-antd/divider'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { NzTypographyModule } from 'ng-zorro-antd/typography'
import {
  REVISION_DIFF_REGISTRY,
  RevisionDiffEntry,
} from '../revision-diff.registry'
import { RevisionStreamNode } from '../revision-stream.types'

/**
 * One revision's card body: the diff — an entity-tagged list diff for
 * association fields (`REVISION_DIFF_REGISTRY` picks the label and tag),
 * the value-diff for scalar fields — and, once resolved, the resolution
 * note with who resolved it and when.
 */
@Component({
  selector: 'cvc-revision-item-content',
  templateUrl: './revision-item-content.component.html',
  styles: ':host { display: block; padding: 4px 12px 8px; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzDividerModule,
    NzGridModule,
    NzTagModule,
    NzTypographyModule,
    RevisionListDiffModule,
    CvcRevisionValueDiffModule,
    CvcCommentBodyModule,
    CvcDiseaseTagModule,
    CvcEvidenceTagModule,
    CvcFeatureTagModule,
    CvcFeatureVariantTagModule,
    CvcMolecularProfileTagModule,
    CvcPhenotypeTagModule,
    CvcSourceTagModule,
    CvcTherapyTagModule,
    CvcUserTagModule,
    CvcVariantTypeTagModule,
    CvcPipesModule,
  ],
})
export class CvcRevisionItemContent {
  protected readonly context =
    injectContext<CvcStreamItemContext<RevisionStreamNode>>()

  protected get revision(): RevisionStreamNode {
    return this.context.item
  }

  /** registry row for association fields; scalar fields render the value-diff */
  protected get diffEntry(): Maybe<RevisionDiffEntry> {
    return REVISION_DIFF_REGISTRY[this.revision.fieldName]
  }

  protected get resolved(): boolean {
    return this.revision.status !== RevisionStatus.New
  }
}

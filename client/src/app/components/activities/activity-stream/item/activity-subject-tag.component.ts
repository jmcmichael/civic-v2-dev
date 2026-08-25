import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core'
import { CvcAssertionsTagModule } from '@app/components/assertions/assertions-tag/assertions-tag.module'
import { CvcCommentTagModule } from '@app/components/comments/comment-tag/comment-tag.module'
import { CvcEvidenceTagModule } from '@app/components/evidence/evidence-tag/evidence-tag.module'
import { CvcFeatureTagModule } from '@app/components/features/feature-tag/feature-tag.module'
import { CvcMolecularProfileTagModule } from '@app/components/molecular-profiles/molecular-profile-tag/molecular-profile-tag.module'
import { CvcRevisionTagModule } from '@app/components/revisions/revision-tag/revision-tag.module'
import { CvcFeatureVariantTagModule } from '@app/components/shared/feature-variant-tag/feature-variant-tag.module'
import { CvcSourceTagModule } from '@app/components/sources/source-tag/source-tag.module'
import { CvcVariantGroupTagModule } from '@app/components/variant-groups/variant-group-tag/variant-group-tag.module'
import { NzTagModule } from 'ng-zorro-antd/tag'

/**
 * The activity subject rendered as its entity's tag, chosen by typename —
 * with popovers suppressible while the stream scrolls. A typename without a
 * bespoke tag renders a plain named tag.
 *
 * A component rather than a shared template so each usage passes plain
 * inputs; the subject can be an activity's subject or, for comment
 * deletions, the commentable the comment hung on.
 */
@Component({
  selector: 'cvc-activity-subject-tag',
  templateUrl: './activity-subject-tag.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzTagModule,
    CvcFeatureTagModule,
    CvcAssertionsTagModule,
    CvcCommentTagModule,
    CvcEvidenceTagModule,
    CvcFeatureVariantTagModule,
    CvcRevisionTagModule,
    CvcVariantGroupTagModule,
    CvcSourceTagModule,
    CvcMolecularProfileTagModule,
  ],
})
export class CvcActivitySubjectTag {
  /** the subject entity; a partial with __typename, id, name, link (+ feature for variants) */
  readonly subject = input.required<{ __typename: string; name?: string }>()
  /** popovers render only while this is true (false while scrolling) */
  readonly enablePopover = input<boolean>(true)
}

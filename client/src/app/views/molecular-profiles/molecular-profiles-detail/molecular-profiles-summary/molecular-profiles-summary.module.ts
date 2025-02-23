import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LetDirective, PushPipe } from '@ngrx/component'
import { NzSpaceModule } from 'ng-zorro-antd/space'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { CvcTagListModule } from '@app/components/shared/tag-list/tag-list.module'
import { CvcSourceTagModule } from '@app/components/sources/source-tag/source-tag.module'
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions'
import { CvcVariantTypeTagModule } from '@app/components/variant-types/variant-type-tag/variant-type-tag.module'
import { CvcLinkTagModule } from '@app/components/shared/link-tag/link-tag.module'
import { CvcEmptyRevisableModule } from '@app/components/shared/empty-revisable/empty-revisable.module'
import { NzCardModule } from 'ng-zorro-antd/card'
import { CvcEvidenceTableModule } from '@app/components/evidence/evidence-table/evidence-table.module'
import { CvcAssertionsTableModule } from '@app/components/assertions/assertions-table/assertions-table.module'
import { NzTypographyModule } from 'ng-zorro-antd/typography'
import { CvcPipesModule } from '@app/core/pipes/pipes.module'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { CvcUserTagModule } from '@app/components/users/user-tag/user-tag.module'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { CvcGeneTagModule } from '@app/components/genes/gene-tag/gene-tag.module'
import { MolecularProfilesSummaryPage } from './molecular-profiles-summary.page'
import { CvcMolecularProfileTagNameModule } from '@app/components/molecular-profiles/molecular-profile-tag-name/molecular-profile-tag-name.module'
import { CvcMolecularProfileVariantCardModule } from '@app/components/molecular-profiles/molecular-profile-variant-card/molecular-profile-variant-card.module'
import { CvcEmptyValueModule } from '@app/forms2/components/empty-value/empty-value.module'

@NgModule({
  declarations: [MolecularProfilesSummaryPage],
  imports: [
    CommonModule,
    LetDirective,
    PushPipe,
    NzSpaceModule,
    NzGridModule,
    NzDescriptionsModule,
    NzCardModule,
    NzTypographyModule,
    NzIconModule,
    NzTagModule,
    CvcEmptyValueModule,
    CvcPipesModule,
    CvcEvidenceTableModule,
    CvcAssertionsTableModule,
    CvcTagListModule,
    CvcUserTagModule,
    CvcSourceTagModule,
    CvcGeneTagModule,
    CvcVariantTypeTagModule,
    CvcLinkTagModule,
    CvcEmptyRevisableModule,
    CvcMolecularProfileTagNameModule,
    CvcMolecularProfileVariantCardModule,
  ],
  exports: [MolecularProfilesSummaryPage],
})
export class MolecularProfilesSummaryModule {}

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { OrganizationsDetailComponent } from './organizations-detail.component'
import { CvcSectionNavigationModule } from '@app/components/shared/section-navigation/section-navigation.module'
import { NzImageModule } from 'ng-zorro-antd/image'
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header'
import { CvcTabNavigationModule } from '@app/components/shared/tab-navigation/tab-navigation.module'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzSpaceModule } from 'ng-zorro-antd/space'
import { RouterModule } from '@angular/router'
import { CvcLinkTagModule } from '@app/components/shared/link-tag/link-tag.module'
import { NzStatisticModule } from 'ng-zorro-antd/statistic'
import { NzCardModule } from 'ng-zorro-antd/card'
import { NzListModule } from 'ng-zorro-antd/list'
import { CvcOrganizationTagModule } from '@app/components/organizations/organization-tag/organization-tag.module'
import { LetDirective, PushPipe } from '@ngrx/component'
import { CvcStatsCardModule } from '@app/components/shared/stats-card/stats-card.module'
import { NzAvatarModule } from 'ng-zorro-antd/avatar'
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions'
import { NzDividerModule } from 'ng-zorro-antd/divider'
import { CvcOrganizationAvatarModule } from '@app/components/organizations/organization-avatar/organization-avatar.module'
import { CvcOrganizationCardModule } from '@app/components/organizations/organization-card/organization-card.module'

@NgModule({
  declarations: [OrganizationsDetailComponent],
  imports: [
    CommonModule,
    RouterModule,
    LetDirective,
    PushPipe,
    NzPageHeaderModule,
    NzGridModule,
    NzIconModule,
    NzSpaceModule,
    NzImageModule,
    NzCardModule,
    NzStatisticModule,
    NzListModule,
    NzAvatarModule,
    NzDescriptionsModule,
    NzDividerModule,
    CvcLinkTagModule,
    CvcTabNavigationModule,
    CvcSectionNavigationModule,
    CvcOrganizationCardModule,
  ],
})
export class OrganizationsDetailModule {}

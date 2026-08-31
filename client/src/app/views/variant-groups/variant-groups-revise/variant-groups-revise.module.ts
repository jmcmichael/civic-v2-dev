import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CvcLoginPromptModule } from '@app/components/shared/login-prompt/login-prompt.module'
import { CvcSectionNavigationModule } from '@app/components/shared/section-navigation/section-navigation.module'
import { LetDirective, PushPipe } from '@ngrx/component'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzSpaceModule } from 'ng-zorro-antd/space'
import { NzTypographyModule } from 'ng-zorro-antd/typography'
import { VariantGroupsReviseRoutingModule } from './variant-groups-revise-routing.module'
import { VariantGroupsReviseView } from './variant-groups-revise.view'

@NgModule({
  declarations: [VariantGroupsReviseView],
  imports: [
    CommonModule,
    VariantGroupsReviseRoutingModule,
    NzSpaceModule,
    NzTypographyModule,
    NzSpaceModule,
    CvcSectionNavigationModule,
    CvcLoginPromptModule,
    LetDirective,
    PushPipe,
    NzGridModule,
  ],
})
export class VariantGroupsReviseModule {}

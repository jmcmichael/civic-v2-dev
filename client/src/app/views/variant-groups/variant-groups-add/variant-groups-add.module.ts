import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CvcLoginPromptModule } from '@app/components/shared/login-prompt/login-prompt.module'
import { CvcSectionNavigationModule } from '@app/components/shared/section-navigation/section-navigation.module'
import { LetDirective, PushPipe } from '@ngrx/component'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { VariantGroupsAddRoutingModule } from './variant-groups-add-routing.module'
import { VariantGroupsAddView } from './variant-groups-add.view'

@NgModule({
  declarations: [VariantGroupsAddView],
  imports: [
    CommonModule,
    VariantGroupsAddRoutingModule,
    LetDirective,
    PushPipe,
    NzGridModule,
    CvcLoginPromptModule,
    CvcSectionNavigationModule,
  ],
})
export class VariantGroupsAddModule {}

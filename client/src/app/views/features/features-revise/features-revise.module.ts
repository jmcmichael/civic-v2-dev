import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { CvcLoginPromptModule } from '@app/components/shared/login-prompt/login-prompt.module'
import { CvcSectionNavigationModule } from '@app/components/shared/section-navigation/section-navigation.module'
import { LetDirective, PushPipe } from '@ngrx/component'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { FeaturesReviseRoutingModule } from './features-revise-routing.module'
import { FeaturesReviseView } from './features-revise.view'

@NgModule({
  declarations: [FeaturesReviseView],
  imports: [
    CommonModule,
    RouterModule,
    LetDirective,
    PushPipe,
    FeaturesReviseRoutingModule,
    NzGridModule,

    CvcLoginPromptModule,
    CvcSectionNavigationModule,
  ],
})
export class FeaturesReviseModule {}

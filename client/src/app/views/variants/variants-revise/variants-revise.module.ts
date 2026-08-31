import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { VariantsReviseRoutingModule } from './variants-revise-routing.module'
import { VariantsReviseView } from './variants-revise.view'
import { CvcSectionNavigationModule } from '@app/components/shared/section-navigation/section-navigation.module'
import { CvcLoginPromptModule } from '@app/components/shared/login-prompt/login-prompt.module'
import { LetDirective, PushPipe } from '@ngrx/component'
import { NzGridModule } from 'ng-zorro-antd/grid'

@NgModule({
  declarations: [VariantsReviseView],
  imports: [
    CommonModule,
    VariantsReviseRoutingModule,
    CvcSectionNavigationModule,
    CvcLoginPromptModule,
    LetDirective,
    PushPipe,
    NzGridModule,
  ],
})
export class VariantsReviseModule {}

import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CvcLoginPromptModule } from '@app/components/shared/login-prompt/login-prompt.module'
import { CvcSectionNavigationModule } from '@app/components/shared/section-navigation/section-navigation.module'
import { PushPipe } from '@ngrx/component'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { EvidenceAddRoutingModule } from './evidence-add-routing.module'
import { EvidenceAddView } from './evidence-add.view'

@NgModule({
  declarations: [EvidenceAddView],
  imports: [
    CommonModule,
    PushPipe,
    EvidenceAddRoutingModule,

    NzGridModule,

    CvcLoginPromptModule,
    CvcSectionNavigationModule,
  ],
})
export class EvidenceAddModule {}

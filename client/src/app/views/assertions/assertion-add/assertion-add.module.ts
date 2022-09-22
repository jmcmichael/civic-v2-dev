import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssertionAddRoutingModule } from './assertion-add-routing.module';
import { AssertionAddView } from './assertion-add.view';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CvcSectionNavigationModule } from '@app/components/shared/section-navigation/section-navigation.module';
import { CvcPipesModule } from '@app/core/pipes/pipes.module';
import { ReactiveComponentModule } from '@ngrx/component';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { CvcLoginPromptModule } from '@app/components/shared/login-prompt/login-prompt.module';

@NgModule({
  declarations: [AssertionAddView],
  imports: [
    CommonModule,
    ReactiveComponentModule,
    AssertionAddRoutingModule,

    NzGridModule,
    NzPageHeaderModule,
    NzIconModule,

    CvcLoginPromptModule,
    CvcSectionNavigationModule,
    CvcPipesModule,
  ]
})
export class AssertionAddModule { }

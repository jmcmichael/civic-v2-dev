import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { TestPagesRoutingModule } from './test-pages-routing.module'
import { TestPagesView } from './test-pages.view'
import { CvcSectionNavigationModule } from '@app/components/shared/section-navigation/section-navigation.module'
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { CvcTabNavigationModule } from '@app/components/shared/tab-navigation/tab-navigation.module'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzTypographyModule } from 'ng-zorro-antd/typography'
import { CvcPipesModule } from '@app/core/pipes/pipes.module'

@NgModule({
  declarations: [TestPagesView],
  imports: [
    CommonModule,
    TestPagesRoutingModule,
    NzPageHeaderModule,
    NzGridModule,
    NzIconModule,
    NzTypographyModule,
    CvcPipesModule,
    CvcTabNavigationModule,
    CvcSectionNavigationModule,
  ],
  exports: [TestPagesView],
})
export class TestPagesModule {}

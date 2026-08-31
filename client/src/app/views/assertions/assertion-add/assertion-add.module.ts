import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AssertionAddRoutingModule } from './assertion-add-routing.module'
import { AssertionAddView } from './assertion-add.view'
import { CvcSectionNavigationModule } from '@app/components/shared/section-navigation/section-navigation.module'

@NgModule({
  declarations: [AssertionAddView],
  imports: [
    CommonModule,
    AssertionAddRoutingModule,
    CvcSectionNavigationModule,
  ],
})
export class AssertionAddModule {}

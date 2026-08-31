import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ConfigOption, FormlyModule } from '@ngx-formly/core'
import { NzCardModule } from 'ng-zorro-antd/card'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzTooltipModule } from 'ng-zorro-antd/tooltip'
import { NzTypographyModule } from 'ng-zorro-antd/typography'
import { CvcPipesModule } from '@app/core/pipes/pipes.module'
import { CvcAutoHeightCardModule } from '@app/directives/auto-height-card/auto-height-card.module'
import { CvcScrollShadowsDirective } from '@app/directives/scroll-shadows/scroll-shadows.directive'
import { CvcFormErrorAlertComponent } from '@app/forms/components/form-error-alert/form-error-alert.component'
import { CvcFormLegendComponent } from '@app/forms/components/form-legend/form-legend.component'
import { CvcFormCardWrapper } from './form-card.wrapper'

const wrapperConfig: ConfigOption = {
  wrappers: [{ name: 'form-card', component: CvcFormCardWrapper }],
}

@NgModule({
  declarations: [CvcFormCardWrapper],
  imports: [
    CommonModule,
    FormsModule,
    FormlyModule.forChild(wrapperConfig),
    NzGridModule,
    NzCardModule,
    NzCheckboxModule,
    NzTypographyModule,
    NzTooltipModule,
    NzIconModule,
    CvcPipesModule,
    CvcAutoHeightCardModule,
    CvcScrollShadowsDirective,
    CvcFormErrorAlertComponent,
    CvcFormLegendComponent,
  ],
  exports: [CvcFormCardWrapper],
})
export class CvcFormCardModule {}

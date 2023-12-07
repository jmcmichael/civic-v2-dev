import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CvcFormSummaryComponent } from './form-summary.component'
import { ConfigOption, FormlyModule } from '@ngx-formly/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

const typeConfig: ConfigOption = {
  types: [
    {
      name: 'form-summary',
      component: CvcFormSummaryComponent,
    },
  ],
}

@NgModule({
  declarations: [CvcFormSummaryComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FormlyModule.forChild(typeConfig),
  ],
  exports: [CvcFormSummaryComponent],
})
export class CvcFormSummaryModule {}

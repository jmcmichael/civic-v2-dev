import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { CvcPipesModule } from '@app/core/pipes/pipes.module'
import { CvcEnumSelectModule } from '@app/forms2/components/enum-select/enum-select.module'
import { CvcFormFieldWrapperModule } from '@app/forms2/wrappers/form-field/form-field.module'
import { ReactiveComponentModule } from '@ngrx/component'
import { ConfigOption, FormlyModule } from '@ngx-formly/core'
import { NzRateModule } from 'ng-zorro-antd/rate'
import { CvcRatingSelectField } from './rating-select.type'

const typeConfig: ConfigOption = {
  types: [
    {
      name: 'rating-select',
      wrappers: ['form-field'],
      component: CvcRatingSelectField,
    },
  ],
}

@NgModule({
  declarations: [CvcRatingSelectField],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReactiveComponentModule,
    FormsModule,
    FormlyModule.forChild(typeConfig),
    NzRateModule,
    CvcPipesModule,
    CvcFormFieldWrapperModule, // for form-field wrapper
    CvcEnumSelectModule,
  ],
  exports: [CvcRatingSelectField],
})
export class CvcRatingSelectModule {}

import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { CvcPipesModule } from '@app/core/pipes/pipes.module'
import { CvcAttributeTagModule } from '@app/forms2/components/attribute-tag/attribute-tag.module'
import { CvcEnumSelectModule } from '@app/forms2/components/enum-select/enum-select.module'
import { CvcFormFieldWrapperModule } from '@app/forms2/wrappers/form-field/form-field.module'
import { ReactiveComponentModule } from '@ngrx/component'
import { ConfigOption, FormlyModule } from '@ngx-formly/core'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { CvcLevelSelectField } from './level-select.type'

const typeConfig: ConfigOption = {
  types: [
    {
      name: 'level-select',
      wrappers: ['form-field'],
      component: CvcLevelSelectField,
    },
  ],
}

@NgModule({
  declarations: [CvcLevelSelectField],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReactiveComponentModule,
    FormlyModule.forChild(typeConfig),
    NzTagModule,
    CvcPipesModule,
    CvcFormFieldWrapperModule, // for form-field wrapper
    CvcEnumSelectModule,
  ],
  exports: [CvcLevelSelectField],
})
export class CvcLevelSelectModule {}

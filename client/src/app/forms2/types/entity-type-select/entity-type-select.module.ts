import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CvcEntityTypeSelectField } from './entity-type-select.type'
import { ReactiveFormsModule } from '@angular/forms'
import { ReactiveComponentModule } from '@ngrx/component'
import { ConfigOption, FormlyModule } from '@ngx-formly/core'
import { FormlyNzFormFieldModule } from '@ngx-formly/ng-zorro-antd/form-field'
import { CvcEnumSelectModule } from '@app/forms2/components/enum-select/enum-select.module'
import { CvcAttributeTagModule } from '@app/components/shared/attribute-tag/attribute-tag.module'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { CvcPipesModule } from '@app/core/pipes/pipes.module'

const typeConfig: ConfigOption = {
  types: [
    {
      name: 'entity-type-select',
      wrappers: ['field-layout'],
      component: CvcEntityTypeSelectField,
    },
  ],
}

@NgModule({
  declarations: [CvcEntityTypeSelectField],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReactiveComponentModule,
    FormlyModule.forChild(typeConfig),
    FormlyNzFormFieldModule, // for form-field wrapper
    CvcAttributeTagModule,
    CvcEnumSelectModule,
  ],
  exports: [CvcEntityTypeSelectField],
})
export class CvcEntityTypeSelectModule {}

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CvcDirectionSelectField } from './direction-select.type'
import { ReactiveFormsModule } from '@angular/forms'
import { ReactiveComponentModule } from '@ngrx/component'
import { ConfigOption, FormlyModule } from '@ngx-formly/core'
import { FormlyNzFormFieldModule } from '@ngx-formly/ng-zorro-antd/form-field'
import { CvcEnumSelectModule } from '@app/forms2/components/enum-select/enum-select.module'
import { CvcAttributeTagModule } from '@app/forms2/components/attribute-tag/attribute-tag.module'

const typeConfig: ConfigOption = {
  types: [
    {
      name: 'direction-select',
      wrappers: ['field-layout'],
      component: CvcDirectionSelectField,
    },
  ],
}

@NgModule({
  declarations: [CvcDirectionSelectField],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReactiveComponentModule,
    FormlyModule.forChild(typeConfig),
    FormlyNzFormFieldModule, // for form-field wrapper
    CvcEnumSelectModule,
    CvcAttributeTagModule,
  ],
  exports: [CvcDirectionSelectField],
})
export class CvcDirectionSelectModule {}

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CvcInteractionSelectField } from './interaction-select.type'
import { ReactiveFormsModule } from '@angular/forms'
import { ReactiveComponentModule } from '@ngrx/component'
import { ConfigOption, FormlyModule } from '@ngx-formly/core'
import { FormlyNzFormFieldModule } from '@ngx-formly/ng-zorro-antd/form-field'
import { CvcEnumSelectModule } from '@app/forms2/components/enum-select/enum-select.module'
import { CvcAttributeTagModule } from '@app/forms2/components/attribute-tag/attribute-tag.module'

const typeConfig: ConfigOption = {
  types: [
    {
      name: 'interaction-select',
      wrappers: ['form-field'],
      component: CvcInteractionSelectField,
    },
  ],
}

@NgModule({
  declarations: [CvcInteractionSelectField],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReactiveComponentModule,
    FormlyModule.forChild(typeConfig),
    FormlyNzFormFieldModule, // for form-field wrapper
    CvcEnumSelectModule,
    CvcAttributeTagModule,
  ],
  exports: [CvcInteractionSelectField],
})
export class CvcInteractionSelectModule {}

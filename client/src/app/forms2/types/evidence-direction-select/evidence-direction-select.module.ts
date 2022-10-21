import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CvcEvidenceDirectionSelectField } from './evidence-direction-select.type'
import { ReactiveFormsModule } from '@angular/forms'
import { ReactiveComponentModule } from '@ngrx/component'
import { ConfigOption, FormlyModule } from '@ngx-formly/core'
import { FormlyNzFormFieldModule } from '@ngx-formly/ng-zorro-antd/form-field'
import { CvcEnumSelectModule } from '@app/forms2/components/enum-select/enum-select.module'
import { CvcAttributeTagModule } from '@app/components/shared/attribute-tag/attribute-tag.module'

const typeConfig: ConfigOption = {
  types: [
    {
      name: 'evidence-direction-select',
      wrappers: ['form-field'],
      component: CvcEvidenceDirectionSelectField,
    },
  ],
}

@NgModule({
  declarations: [CvcEvidenceDirectionSelectField],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReactiveComponentModule,
    FormlyModule.forChild(typeConfig),
    FormlyNzFormFieldModule, // for form-field wrapper
    CvcEnumSelectModule,
    CvcAttributeTagModule,
  ],
  exports: [CvcEvidenceDirectionSelectField],
})
export class CvcEvidenceDirectionSelectModule {}

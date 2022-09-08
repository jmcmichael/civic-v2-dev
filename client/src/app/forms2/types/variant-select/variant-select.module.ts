import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CvcVariantSelectField } from './variant-select.type'
import { ConfigOption, FormlyModule } from '@ngx-formly/core'
import { FormlyNzFormFieldModule } from '@ngx-formly/ng-zorro-antd/form-field'
import { ReactiveFormsModule } from '@angular/forms'
import { NzInputModule } from 'ng-zorro-antd/input'
import { ReactiveComponentModule } from '@ngrx/component'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete'
import { CvcEntityTagModule } from '@app/forms2/components/entity-tag/entity-tag.module'
import { CvcPipesModule } from '@app/core/pipes/pipes.module'
import { NzSpaceModule } from 'ng-zorro-antd/space'

const typeConfig: ConfigOption = {
  types: [
    {
      name: 'variant-select',
      wrappers: ['form-field'],
      component: CvcVariantSelectField,
    },
    {
      // no label, for use in repeat-field types
      name: 'variant-select-item',
      wrappers: ['form-field'],
      component: CvcVariantSelectField,
      defaultOptions: {
        props: {
          hideLabel: true,
        },
      },
    },
  ],
}

@NgModule({
  declarations: [CvcVariantSelectField],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReactiveComponentModule,
    FormlyModule.forChild(typeConfig),
    FormlyNzFormFieldModule, // for form-field wrapper
    NzSelectModule,
    NzInputModule,
    NzSpaceModule,
    NzFormModule,
    NzAutocompleteModule,

    CvcPipesModule,
    CvcEntityTagModule,
  ],
  exports: [CvcVariantSelectField],
})
export class CvcVariantSelectModule {}

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  CvcVariantSelectField,
  CvcVariantSelectFieldProps,
} from './variant-select.type'
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
import { CvcEntitySelectModule } from '@app/forms2/components/entity-select/entity-select.module'
import { NzTypographyModule } from 'ng-zorro-antd/typography'
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CvcVariantQuickAddForm } from './variant-quick-add/variant-quick-add.form'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzModalModule } from 'ng-zorro-antd/modal'
import { NzAlertModule } from 'ng-zorro-antd/alert'

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
          isRepeatItem: true,
          hideLabel: true,
          requireGene: false,
        },
      },
    },
  ],
}

@NgModule({
  declarations: [CvcVariantSelectField, CvcVariantQuickAddForm],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReactiveComponentModule,
    FormlyModule.forChild(typeConfig),
    FormlyNzFormFieldModule, // for form-field wrapper
    NzAlertModule,
    NzButtonModule,
    NzSelectModule,
    NzModalModule,
    NzInputModule,
    NzGridModule,
    NzSpaceModule,
    NzFormModule,
    NzAutocompleteModule,
    NzTypographyModule,

    CvcEntitySelectModule,
    CvcPipesModule,
    CvcEntityTagModule,
  ],
  exports: [CvcVariantSelectField, CvcVariantQuickAddForm],
})
export class CvcVariantSelectModule {}

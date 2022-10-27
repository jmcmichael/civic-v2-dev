import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { CvcPipesModule } from '@app/core/pipes/pipes.module'
import { CvcEntitySelectModule } from '@app/forms2/components/entity-select/entity-select.module'
import { CvcEntityTagModule } from '@app/forms2/components/entity-tag/entity-tag.module'
import { ReactiveComponentModule } from '@ngrx/component'
import { ConfigOption, FormlyModule } from '@ngx-formly/core'
import { FormlyNzFormFieldModule } from '@ngx-formly/ng-zorro-antd/form-field'
import { NzAlertModule } from 'ng-zorro-antd/alert'
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzModalModule } from 'ng-zorro-antd/modal'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzSpaceModule } from 'ng-zorro-antd/space'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { NzTypographyModule } from 'ng-zorro-antd/typography'
import { CvcDrugQuickAddForm } from './drug-quick-add/drug-quick-add.form'
import {
  CvcDrugSelectField,
  CvcDrugSelectFieldOptions,
} from './drug-select.type'

const typeConfig: ConfigOption = {
  types: [
    {
      name: 'drug-select',
      wrappers: ['form-field'],
      // wrappers: ['form-field'],
      component: CvcDrugSelectField,
    },
    {
      // no label, for use in repeat-field types
      name: 'drug-multi-select',
      wrappers: ['form-field'],
      component: CvcDrugSelectField,
      defaultOptions: <CvcDrugSelectFieldOptions>{
        props: {
          isMultiSelect: true,
        },
      },
    },
  ],
}

@NgModule({
  declarations: [CvcDrugSelectField, CvcDrugQuickAddForm],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReactiveComponentModule,
    FormlyModule.forChild(typeConfig),
    FormlyNzFormFieldModule, // for form-field wrapper
    NzAlertModule,
    NzButtonModule,
    NzSelectModule,
    NzPopoverModule,
    NzModalModule,
    NzIconModule,
    NzInputModule,
    NzGridModule,
    NzToolTipModule,
    NzSpaceModule,
    NzFormModule,
    NzAutocompleteModule,
    NzTypographyModule,
    NzTagModule,
    CvcEntitySelectModule,
    CvcPipesModule,
    CvcEntityTagModule,
  ],
  exports: [CvcDrugSelectField, CvcDrugQuickAddForm],
})
export class CvcDrugSelectModule {}

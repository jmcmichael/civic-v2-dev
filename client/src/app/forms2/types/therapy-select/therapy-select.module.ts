import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { CvcPipesModule } from '@app/core/pipes/pipes.module'
import { CvcEntitySelectModule } from '@app/forms2/components/entity-select/entity-select.module'
import { CvcEntityTagModule } from '@app/forms2/components/entity-tag/entity-tag.module'
import { CvcFormFieldWrapperModule } from '@app/forms2/wrappers/form-field/form-field.module'
import { LetDirective, PushPipe } from '@ngrx/component'
import { ConfigOption, FormlyModule } from '@ngx-formly/core'
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
import { CvcTherapyQuickAddForm } from './therapy-quick-add/therapy-quick-add.form'
import {
  CvcTherapySelectField,
  CvcTherapySelectFieldOptions,
} from './therapy-select.type'

const typeConfig: ConfigOption = {
  types: [
    {
      name: 'therapy-select',
      wrappers: ['form-field'],
      component: CvcTherapySelectField,
      defaultOptions: {
        props: {
          label: 'Therapy'
        }
      }
    },
    {
      // no label, for use in repeat-field types
      name: 'therapy-multi-select',
      wrappers: ['form-field'],
      component: CvcTherapySelectField,
      defaultOptions: <CvcTherapySelectFieldOptions>{
        props: {
          label: 'Therapies',
          isMultiSelect: true,
        },
      },
    },
  ],
}

@NgModule({
  declarations: [CvcTherapySelectField, CvcTherapyQuickAddForm],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LetDirective, PushPipe,
    FormlyModule.forChild(typeConfig),
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
    CvcFormFieldWrapperModule,
    CvcEntitySelectModule,
    CvcPipesModule,
    CvcEntityTagModule,
  ],
  exports: [CvcTherapySelectField, CvcTherapyQuickAddForm],
})
export class CvcTherapySelectModule {}

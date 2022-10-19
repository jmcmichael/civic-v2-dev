import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { CvcPipesModule } from '@app/core/pipes/pipes.module'
import { CvcEntitySelectModule } from '@app/forms2/components/entity-select/entity-select.module'
import { CvcEntityTagModule } from '@app/forms2/components/entity-tag/entity-tag.module'
import { ReactiveComponentModule } from '@ngrx/component'
import { ConfigOption, FieldTypeConfig, FormlyModule } from '@ngx-formly/core'
import { FormlyNzFormFieldModule } from '@ngx-formly/ng-zorro-antd/form-field'
import { NzAlertModule } from 'ng-zorro-antd/alert'
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { NzTypographyModule } from 'ng-zorro-antd/typography'
import { CvcGeneSelectField, CvcGeneSelectFieldProps } from './gene-select.type'

const typeConfig: ConfigOption = {
  types: [
    {
      name: 'gene-select',
      wrappers: ['field-layout'],
      component: CvcGeneSelectField,
    },
    {
      // for use in repeat-field types, label hidden
      name: 'gene-multi-select',
      wrappers: ['field-layout'],
      component: CvcGeneSelectField,
      defaultOptions: <Partial<FieldTypeConfig<CvcGeneSelectFieldProps>>>{
        props: {
          isMultiSelect: true,
        },
      },
    },
  ],
}

@NgModule({
  declarations: [CvcGeneSelectField],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReactiveComponentModule,
    FormlyModule.forChild(typeConfig),
    FormlyNzFormFieldModule, // for form-field wrapper
    NzAlertModule,
    NzButtonModule,
    NzSelectModule,
    NzIconModule,
    NzInputModule,
    NzToolTipModule,
    NzFormModule,
    NzAutocompleteModule,
    NzTypographyModule,
    NzTagModule,
    CvcEntitySelectModule,
    CvcPipesModule,
    CvcEntityTagModule,
  ],
  exports: [CvcGeneSelectField],
})
export class CvcGeneSelectModule {}

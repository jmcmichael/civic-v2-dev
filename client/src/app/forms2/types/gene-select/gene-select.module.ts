import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { CvcPipesModule } from '@app/core/pipes/pipes.module'
import { CvcEntitySelectModule } from '@app/forms2/components/entity-select/entity-select.module'
import { CvcEntityTagModule } from '@app/forms2/components/entity-tag/entity-tag.module'
import { ReactiveComponentModule } from '@ngrx/component'
import { ConfigOption, FormlyModule } from '@ngx-formly/core'
import { FormlyNzFormFieldModule } from '@ngx-formly/ng-zorro-antd/form-field'
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzTypographyModule } from 'ng-zorro-antd/typography'
import { CvcGeneSelectField, CvcGeneSelectFieldProps } from './gene-select.type'

const typeConfig: ConfigOption = {
  types: [
    {
      name: 'gene-select',
      wrappers: ['form-field'],
      component: CvcGeneSelectField,
    },
    {
      // for use in repeat-field types,
      name: 'gene-select-item',
      wrappers: ['form-field'],
      component: CvcGeneSelectField,
      defaultOptions: {
        props: <CvcGeneSelectFieldProps>{
          isRepeatItem: true,
          hideLabel: true,
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
    NzSelectModule,
    NzInputModule,
    NzFormModule,
    NzTypographyModule,
    NzAutocompleteModule,

    CvcEntitySelectModule,
    CvcEntityTagModule,
    CvcPipesModule,
  ],
  exports: [CvcGeneSelectField],
})
export class CvcGeneSelectModule {}

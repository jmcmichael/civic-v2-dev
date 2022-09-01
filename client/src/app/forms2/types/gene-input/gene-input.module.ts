import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { CvcPipesModule } from '@app/core/pipes/pipes.module'
import { CvcEntityTagModule } from '@app/forms2/components/entity-tag/entity-tag.module'
import { ReactiveComponentModule } from '@ngrx/component'
import { ConfigOption, FormlyModule } from '@ngx-formly/core'
import { FormlyNzFormFieldModule } from '@ngx-formly/ng-zorro-antd/form-field'
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzSpaceModule } from 'ng-zorro-antd/space'
import { NzTypographyModule } from 'ng-zorro-antd/typography'
import { CvcGeneInputField } from './gene-input.type'

const typeConfig: ConfigOption = {
  types: [
    {
      name: 'gene-input',
      wrappers: ['form-field'],
      component: CvcGeneInputField,
    },
  ],
}

@NgModule({
  declarations: [CvcGeneInputField],
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

    CvcPipesModule,
    CvcEntityTagModule,
  ],
  exports: [CvcGeneInputField],
})
export class CvcGeneInputModule {}

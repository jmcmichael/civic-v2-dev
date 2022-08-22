import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CvcGeneInputType } from './gene-input.type'
import { ConfigOption, FormlyModule } from '@ngx-formly/core'
import { FormlyNzFormFieldModule } from '@ngx-formly/ng-zorro-antd/form-field'
import { ReactiveFormsModule } from '@angular/forms'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzInputNumberModule } from 'ng-zorro-antd/input-number'

const typeConfig: ConfigOption = {
  types: [
    {
      name: 'gene-input',
      wrappers: ['form-field'],
      component: CvcGeneInputType,
    },
  ],
}

@NgModule({
  declarations: [CvcGeneInputType],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzInputModule,
    NzInputNumberModule,
    FormlyNzFormFieldModule,
    FormlyModule.forChild(typeConfig),
  ],
  exports: [CvcGeneInputType],
})
export class CvcGeneInputModule {}

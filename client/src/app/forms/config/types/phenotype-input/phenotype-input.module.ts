import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  PhenotypeInputType,
  PhenotypeInputTypeOption,
} from './phenotype-input.type'
import { CvcPhenotypeTagModule } from '@app/components/phenotypes/phenotype-tag/phenotype-tag.module'
import { ReactiveFormsModule } from '@angular/forms'
import { FormlyModule } from '@ngx-formly/core'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { LetDirective, PushPipe } from '@ngrx/component'
import { CvcPipesModule } from '@app/core/pipes/pipes.module'
import { CvcAutofocusModule } from '@app/directives/auto-focus/auto-focus.module'

// MultiFieldTypeOption,
@NgModule({
  declarations: [PhenotypeInputType],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LetDirective,
    PushPipe,
    FormlyModule.forChild({ types: [PhenotypeInputTypeOption] }),
    NzSelectModule,
    CvcPhenotypeTagModule,
    CvcPipesModule,
    CvcAutofocusModule,
  ],
})
export class CvcPhenotypeInputTypeModule {}

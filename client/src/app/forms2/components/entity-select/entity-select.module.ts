import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CvcPipesModule } from '@app/core/pipes/pipes.module';
import { ReactiveComponentModule } from '@ngrx/component';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyNzFormFieldModule } from '@ngx-formly/ng-zorro-antd/form-field';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CvcEntityTagModule } from '../entity-tag/entity-tag.module';
import { CvcEntitySelectComponent } from './entity-select.component';
import { EntitySelectOptionComponent } from './entity-select-option/entity-select-option.component';

@NgModule({
  declarations: [
    CvcEntitySelectComponent,
    EntitySelectOptionComponent
  ],
  imports: [
    CommonModule,
    ReactiveComponentModule,
    ReactiveFormsModule,
    FormlyModule.forChild(),
    FormlyNzFormFieldModule,
    NzIconModule,
    NzFormModule,
    NzSelectModule,
    NzInputModule,
    CvcPipesModule,
    CvcEntityTagModule,
  ],
  exports: [
    CvcEntitySelectComponent,
    EntitySelectOptionComponent,
  ]
})
export class CvcEntitySelectModule { }

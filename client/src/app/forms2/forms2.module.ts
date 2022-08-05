import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { ReactiveComponentModule } from '@ngrx/component';
import { FormlyNgZorroAntdModule } from '@ngx-formly/ng-zorro-antd';
import { CvcFormlyConfig2 } from './forms2.config';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReactiveComponentModule,
    FormlyModule.forRoot(CvcFormlyConfig2),
    FormlyNgZorroAntdModule,
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    FormlyModule,
    FormlyNgZorroAntdModule,
  ]
})
export class CvcForms2Module { }

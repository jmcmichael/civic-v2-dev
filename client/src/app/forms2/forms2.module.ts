import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReactiveComponentModule } from '@ngrx/component';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyNgZorroAntdModule } from '@ngx-formly/ng-zorro-antd';
import { CvcFormlyConfig2 } from './forms2.config';
import { CvcFormWrappersModule } from './wrappers/wrappers.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReactiveComponentModule,
    FormlyModule.forRoot(CvcFormlyConfig2),
    FormlyNgZorroAntdModule,
    CvcFormWrappersModule,
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    FormlyModule,
    FormlyNgZorroAntdModule,
  ]
})
export class CvcForms2Module { }

import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyNgZorroAntdModule } from '@ngx-formly/ng-zorro-antd';
import { environment } from 'environments/environment';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { CvcFormWrappersModule } from './wrappers/wrappers.module';

@NgModule({
  declarations: [],
  imports: [
    FormlyModule,
    ReactiveFormsModule,
    NzFormModule,
    FormlyNgZorroAntdModule,
    CvcFormWrappersModule,
    NgxJsonViewerModule,
    ...environment.devModules
  ],
  exports: [
    ReactiveFormsModule,
    FormlyModule,
    FormlyNgZorroAntdModule,
    CvcFormWrappersModule,
    NgxJsonViewerModule,
    ...environment.devModules
  ],
})
export class CvcForms2Module {}

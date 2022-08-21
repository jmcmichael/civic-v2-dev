import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyNgZorroAntdModule } from '@ngx-formly/ng-zorro-antd';
import { environment } from 'environments/environment';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { CvcFormTypesModule } from './types/form-types.module';
import { CvcFormWrappersModule } from './wrappers/form-wrappers.module';

@NgModule({
  declarations: [],
  imports: [
    FormlyModule,
    ReactiveFormsModule,
    NzFormModule,
    FormlyNgZorroAntdModule,
    CvcFormWrappersModule,
    NgxJsonViewerModule,
  ],
  exports: [
    ReactiveFormsModule,
    FormlyModule,
    FormlyNgZorroAntdModule,
    CvcFormWrappersModule,
    CvcFormTypesModule,
  ],
})
export class CvcForms2Module {}

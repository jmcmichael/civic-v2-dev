import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvcFieldsLayoutWrapper } from './fields-layout.wrapper';
import { ConfigOption, FormlyModule } from '@ngx-formly/core';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';

const wrapperConfig: ConfigOption = {
  wrappers: [{ name: 'fields-layout', component: CvcFieldsLayoutWrapper }],
};

@NgModule({
  declarations: [CvcFieldsLayoutWrapper],
  imports: [
    CommonModule,
    FormlyModule.forChild(wrapperConfig),
    NzGridModule,
    NzCardModule,
  ],
  exports: [CvcFieldsLayoutWrapper],
})
export class CvcFieldsLayoutModule {}

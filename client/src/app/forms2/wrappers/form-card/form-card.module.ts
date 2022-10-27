import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvcFormCardWrapper } from './form-card.wrapper';
import { ConfigOption, FormlyModule } from '@ngx-formly/core';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';

const wrapperConfig: ConfigOption = {
  wrappers: [{ name: 'form-card', component: CvcFormCardWrapper }],
};

@NgModule({
  declarations: [CvcFormCardWrapper],
  imports: [
    CommonModule,
    FormlyModule.forChild(wrapperConfig),
    NzGridModule,
    NzCardModule,
  ],
  exports: [CvcFormCardWrapper],
})
export class CvcFormCardModule {}

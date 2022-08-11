import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvcFormCardWrapper } from './form-card/form-card.wrapper';
import { NzCardModule } from 'ng-zorro-antd/card';
import { ConfigOption, FormlyModule } from '@ngx-formly/core';

const wrapperConfig: ConfigOption = {
  wrappers: [{ name: 'form-card', component: CvcFormCardWrapper }],
};

@NgModule({
  declarations: [CvcFormCardWrapper],
  imports: [
    CommonModule,
    NzCardModule,
    FormlyModule.forChild(wrapperConfig)
  ],
  exports: [CvcFormCardWrapper],
})
export class CvcFormWrappersModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvcFormCardWrapper } from './form-card.wrapper';
import { ConfigOption, FormlyModule } from '@ngx-formly/core';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';

const wrapperConfig: ConfigOption = {
  wrappers: [{ name: 'form-card', component: CvcFormCardWrapper }],
};

@NgModule({
  declarations: [CvcFormCardWrapper],
  imports: [
    CommonModule,
    FormsModule,
    FormlyModule.forChild(wrapperConfig),
    NzGridModule,
    NzCardModule,
    NzSelectModule,
  ],
  exports: [CvcFormCardWrapper],
})
export class CvcFormCardModule {}

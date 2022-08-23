import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvcEntityTagComponent } from './entity-tag.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';

@NgModule({
  declarations: [
    CvcEntityTagComponent
  ],
  imports: [
    CommonModule,
    NzIconModule,
    NzTagModule,
  ],
  exports: [
    CvcEntityTagComponent
  ]
})
export class CvcEntityTagModule { }

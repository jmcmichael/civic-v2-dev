import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvcStringTagComponent } from './string-tag.component';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { CvcPipesModule } from '@app/core/pipes/pipes.module';

@NgModule({
  declarations: [
    CvcStringTagComponent
  ],
  imports: [
    CommonModule,
    NzTagModule,
    NzTypographyModule,
    CvcPipesModule,
  ],
  exports: [
    CvcStringTagComponent
  ]
})
export class CvcStringTagModule { }

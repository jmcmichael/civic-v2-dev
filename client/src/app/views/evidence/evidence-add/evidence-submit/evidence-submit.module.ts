import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzCardModule } from 'ng-zorro-antd/card';
import { EvidenceSubmitPage } from './evidence-submit.page';
import { CvcEvidenceSubmitFormModule } from '@app/forms2/config/evidence-submit/evidence-submit.form.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [EvidenceSubmitPage],
  imports: [
    CommonModule,
    FormsModule,
    NzGridModule,
    NzSpaceModule,
    NzCardModule,
    NzSkeletonModule,
    CvcEvidenceSubmitFormModule,
  ]
})
export class EvidenceSubmitModule { }

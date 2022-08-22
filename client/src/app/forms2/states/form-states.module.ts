
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { XstateAngular } from 'xstate-angular';
import { EvidenceItemStateService } from './evidence-statechart/evidence-statechart.config';
import { EvidenceItemStateFacade } from './evidence-statechart/facades/evidence-statechart.form.facade';

@NgModule({
  imports: [CommonModule, RouterModule],
  providers: [
    EvidenceItemStateService,
    EvidenceItemStateFacade,
    XstateAngular,
  ],
})
export class CvcFormStatesModule {}

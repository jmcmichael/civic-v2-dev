import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { evidenceSubmitFormInitialModel, EvidenceSubmitFormModel } from '@app/forms2/models/evidence-submit-form.model';
import { EvidenceItemStateFacade } from '@app/forms2/states/evidence-statechart/evidence-statechart.facade';
import { EvidenceItemStateService } from '@app/forms2/states/evidence-statechart/evidence-statechart.service';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { evidenceSubmitFormFields } from './evidence-submit.form.config';

@Component({
  selector: 'cvc-evidence-submit-form',
  templateUrl: './evidence-submit.form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcEvidenceSubmitForm implements OnInit {
  model: EvidenceSubmitFormModel = evidenceSubmitFormInitialModel
  form: FormGroup = new FormGroup({})
  fields: FormlyFieldConfig[]
  options: FormlyFormOptions

  constructor(state: EvidenceItemStateFacade) {
    this.fields = evidenceSubmitFormFields
    this.options = {
      formState: state
    }
  }

  onSubmit(model: EvidenceSubmitFormModel) {
    console.log('------ Evidence Form Submitted ------')
    console.log(model);
  }

  ngOnInit(): void {
    // console.log('evidence-submit OnInit called.')
    // console.log(this.form)
  }

}

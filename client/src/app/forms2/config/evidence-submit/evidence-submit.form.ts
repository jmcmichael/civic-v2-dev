import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EvidenceState } from '@app/forms/config/states/evidence.state';
import { evidenceSubmitFormInitialModel, EvidenceSubmitFormModel } from '@app/forms2/models/evidence-submit-form.model';
import { EvidenceItemStateService } from '@app/forms2/states/evidence-statechart/evidence-statechart.config';
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

  constructor(state: EvidenceItemStateService) {
    this.fields = evidenceSubmitFormFields
    this.options = {
      formState: state.service
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

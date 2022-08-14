import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EvidenceState } from '@app/forms/config/states/evidence.state';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { evidenceSubmitFields, EvidenceSubmitFormModel } from './evidence-submit.form.config';

@Component({
  selector: 'cvc-evidence-submit-form',
  templateUrl: './evidence-submit.form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcEvidenceSubmitForm {
  model: EvidenceSubmitFormModel
  form: FormGroup = new FormGroup({})
  fields: FormlyFieldConfig[]
  options: FormlyFormOptions = { formState: new EvidenceState() }
  constructor() {
    this.model = { fields: {  } }
    this.fields = evidenceSubmitFields
  }

  onSubmit(model: EvidenceSubmitFormModel) {
    console.log('------ Evidence Form Submitted ------')
    console.log(model);
  }
}

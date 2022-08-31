import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { evidenceSubmitFormInitialModel, EvidenceSubmitModel } from '@app/forms2/models/evidence-submit.model';
import { EvidenceState } from '@app/forms2/states/evidence.state';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { evidenceSubmitFields } from './evidence-submit.form.config';

@Component({
  selector: 'cvc-evidence-submit-form',
  templateUrl: './evidence-submit.form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcEvidenceSubmitForm implements OnInit {
  model: EvidenceSubmitModel = evidenceSubmitFormInitialModel
  form: FormGroup = new FormGroup({})
  fields: FormlyFieldConfig[]
  options: FormlyFormOptions

  constructor() {
    this.model = evidenceSubmitFormInitialModel
    this.fields = evidenceSubmitFields
    this.options = { formState: new EvidenceState() }
  }

  onSubmit(model: EvidenceSubmitModel) {
    console.log('------ Evidence Form Submitted ------')
    console.log(model);
  }

  ngOnInit(): void {
    // console.log('evidence-submit OnInit called.')
    // console.log(this.form)
  }

}

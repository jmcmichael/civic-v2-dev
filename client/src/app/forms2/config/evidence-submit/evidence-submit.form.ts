import { ChangeDetectionStrategy, Component } from '@angular/core'
import { FormGroup } from '@angular/forms'
import {
  evidenceSubmitFormInitialModel,
  EvidenceSubmitModel,
} from '@app/forms2/models/evidence-submit.model'
import { EvidenceState } from '@app/forms2/states/evidence.state'
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core'
import { NzFormLayoutType } from 'ng-zorro-antd/form'
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject'
import { evidenceSubmitFields } from './evidence-submit.form.config'

@Component({
  selector: 'cvc-evidence-submit-form',
  templateUrl: './evidence-submit.form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcEvidenceSubmitForm {
  model: EvidenceSubmitModel = evidenceSubmitFormInitialModel
  form: FormGroup = new FormGroup({})
  fields: FormlyFieldConfig[]
  options: FormlyFormOptions

  formLayout$: BehaviorSubject<NzFormLayoutType>

  constructor() {
    this.model = evidenceSubmitFormInitialModel
    this.fields = evidenceSubmitFields
    this.options = {
      formState: new EvidenceState(),
    }
    this.formLayout$ = new BehaviorSubject<NzFormLayoutType>('horizontal')

    this.options.formState.formLayout$ = this.formLayout$
  }

  onSubmit(model: EvidenceSubmitModel) {
    console.log('------ Evidence Form Submitted ------')
    console.log(model)
  }
}

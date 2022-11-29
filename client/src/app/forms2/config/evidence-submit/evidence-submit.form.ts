import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core'
import { FormGroup } from '@angular/forms'
import {
  evidenceSubmitFormInitialModel,
  EvidenceSubmitModel,
} from '@app/forms2/models/evidence-submit.model'
import { EntityState } from '@app/forms2/states/entity.state'
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
export class CvcEvidenceSubmitForm implements OnDestroy {
  model: EvidenceSubmitModel = evidenceSubmitFormInitialModel
  form: FormGroup = new FormGroup({})
  fields: FormlyFieldConfig[]
  options: FormlyFormOptions
  state: EntityState = new EvidenceState()

  formLayout$: BehaviorSubject<NzFormLayoutType>

  constructor() {
    this.model = evidenceSubmitFormInitialModel
    this.fields = evidenceSubmitFields
    this.options = {
      formState: this.state,
    }
    this.formLayout$ = new BehaviorSubject<NzFormLayoutType>('vertical')

    this.options.formState.formLayout$ = this.formLayout$
  }

  onSubmit(model: EvidenceSubmitModel) {
    console.log('------ Evidence Form Submitted ------')
    console.log(model)
  }

  ngOnDestroy(): void {
    this.state.onDestroy()
  }
}

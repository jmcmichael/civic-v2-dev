import { ChangeDetectionStrategy, Component } from '@angular/core'
import { FormGroup } from '@angular/forms'
import {
  assertionSubmitFormInitialModel,
  AssertionSubmitModel,
} from '@app/forms2/models/assertion-submit.model'
import { AssertionState } from '@app/forms2/states/assertion.state'
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core'
import { NzFormLayoutType } from 'ng-zorro-antd/form'
import { assertionSubmitFields } from './assertion-submit.form.config'

@Component({
  selector: 'cvc-assertion-submit-form',
  templateUrl: './assertion-submit.form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvcAssertionSubmitForm {
  model: AssertionSubmitModel = assertionSubmitFormInitialModel
  form: FormGroup = new FormGroup({})
  fields: FormlyFieldConfig[]
  options: FormlyFormOptions

  formLayout: NzFormLayoutType
  constructor() {
    this.model = assertionSubmitFormInitialModel
    this.fields = assertionSubmitFields
    this.options = { formState: new AssertionState() }
    this.formLayout = 'horizontal'
  }

  onSubmit(model: AssertionSubmitModel) {
    console.log('------ Assertion Form Submitted ------')
    console.log(model)
  }
}

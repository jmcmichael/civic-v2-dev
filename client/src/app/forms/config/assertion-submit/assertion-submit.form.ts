import {
  FormMutationService,
  FormMutationState,
} from '@app/forms/utilities/form-mutation'
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { UntypedFormGroup } from '@angular/forms'
import { NetworkErrorsService } from '@app/core/services/network-errors.service'
import {
  assertionSubmitFormInitialModel,
  AssertionSubmitModel,
} from '@app/forms/models/assertion-submit.model'
import { AssertionState } from '@app/forms/states/assertion.state'
import { assertionFormModelToInput } from '@app/forms/utilities/assertion-to-model-fields'
import {
  SubmitAssertionGQL,
  SubmitAssertionMutation,
  SubmitAssertionMutationVariables,
} from './assertion-submit.query.gql.generated'
import { UntilDestroy } from '@ngneat/until-destroy'
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core'
import { assertionSubmitFields } from './assertion-submit.form.config'

@UntilDestroy()
@Component({
  selector: 'cvc-assertion-submit-form',
  templateUrl: './assertion-submit.form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CvcAssertionSubmitForm {
  model: AssertionSubmitModel
  form: UntypedFormGroup
  fields: FormlyFieldConfig[]
  state: AssertionState
  options: FormlyFormOptions

  private formMutation = inject(FormMutationService)

  mutationState?: FormMutationState
  newAssertionId?: number
  newAssertionUrl?: string

  constructor(
    private submitAssertionGQL: SubmitAssertionGQL,
    private networkErrorService: NetworkErrorsService
  ) {
    this.form = new UntypedFormGroup({})
    this.model = assertionSubmitFormInitialModel
    this.fields = assertionSubmitFields
    this.state = new AssertionState()
    this.options = { formState: this.state }
  }

  onSubmit(model: AssertionSubmitModel) {
    let input = assertionFormModelToInput(model)
    if (input) {
      this.mutationState = this.formMutation.mutate(
        this.submitAssertionGQL,
        { input: input },
        undefined,
        (data) => {
          this.newAssertionId = data.submitAssertion?.assertion.id
          this.newAssertionUrl = `/assertions/${this.newAssertionId}/summary`
        }
      )
    }
  }
}

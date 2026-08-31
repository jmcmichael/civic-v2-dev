import {
  FormMutationService,
  FormMutationState,
} from '@app/forms/utilities/form-mutation'
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  signal,
  inject,
} from '@angular/core'
import { UntypedFormGroup } from '@angular/forms'
import {
  assertionReviseFormInitialModel,
  AssertionReviseModel,
} from '@app/forms/models/assertion-revise.model'
import { AssertionState } from '@app/forms/states/assertion.state'
import {
  AssertionRevisableFieldsGQL,
  SuggestAssertionRevisionGQL,
  SuggestAssertionRevisionMutation,
  SuggestAssertionRevisionMutationVariables,
} from './assertion-revise.query.gql.generated'
import { Maybe } from '@app/generated/civic.apollo.types'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core'
import { assertionReviseFields } from './assertion-revise.form.config'
import {
  assertionFormModelToReviseInput,
  assertionToModelFields,
} from '@app/forms/utilities/assertion-to-model-fields'
import { setFormSubject } from '@app/forms/messages/form-titles'

@UntilDestroy()
@Component({
  selector: 'cvc-assertion-revise-form',
  templateUrl: './assertion-revise.form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CvcAssertionReviseForm implements OnInit, AfterViewInit {
  @Input() assertionId!: number

  readonly model = signal<AssertionReviseModel | undefined>(undefined)
  form: UntypedFormGroup
  fields: FormlyFieldConfig[]
  state: AssertionState
  options: FormlyFormOptions

  url?: string

  private formMutation = inject(FormMutationService)

  mutationState?: FormMutationState

  constructor(
    private revisableFieldsGQL: AssertionRevisableFieldsGQL,
    private submitRevisionsGQL: SuggestAssertionRevisionGQL
  ) {
    this.form = new UntypedFormGroup({})
    this.fields = assertionReviseFields
    this.state = new AssertionState()
    this.state.formMode = 'revise'
    this.options = { formState: this.state }
  }

  onSubmit(model: AssertionReviseModel) {
    if (!this.assertionId) {
      return
    }
    let input = assertionFormModelToReviseInput(this.assertionId, model)
    if (input) {
      this.mutationState = this.formMutation.mutate(this.submitRevisionsGQL, {
        input: input,
      })
    }
  }

  ngOnInit(): void {
    this.url = `/assertions/${this.assertionId}/revisions`
  }

  ngAfterViewInit(): void {
    this.revisableFieldsGQL
      .fetch({ variables: { assertionId: this.assertionId } })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: ({ data }) => {
          const assertion = data?.assertion
          if (assertion) {
            // the card title names what is being revised
            setFormSubject(this.fields, assertion.name)
            this.model.set({
              id: assertion.id,
              fields: assertionToModelFields(assertion),
            })
          }
        },
        error: (error) => {
          console.error('Error retrieving Assertion')
          console.error(error)
        },
      })
  }
}

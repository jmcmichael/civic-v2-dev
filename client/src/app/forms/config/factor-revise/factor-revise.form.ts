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
  FactorRevisableFieldsGQL,
  SuggestFactorRevisionGQL,
  SuggestFactorRevisionMutation,
  SuggestFactorRevisionMutationVariables,
} from './factor-revise.query.gql.generated'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { FormlyFieldConfig } from '@ngx-formly/core'
import {
  factorFormModelToReviseInput,
  factorToModelFields,
} from '@app/forms/utilities/factor-to-model-fields'
import { factorReviseFields } from './factor-revise.form.config'

import { NzFormModule } from 'ng-zorro-antd/form'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { CvcForms2Module } from '@app/forms/forms.module'
import { CvcFormSubmissionStatusDisplayModule } from '@app/forms/components/form-submission-status-display/form-submission-status-display.module'
import { FactorReviseModel } from '@app/forms/models/factor-revise.model'
import { setFormSubject } from '@app/forms/messages/form-titles'

@UntilDestroy()
@Component({
  selector: 'cvc-factor-revise-form',
  templateUrl: './factor-revise.form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NzFormModule,
    NzButtonModule,
    CvcForms2Module,
    CvcFormSubmissionStatusDisplayModule,
  ],
})
export class CvcFactorReviseForm implements OnInit, AfterViewInit {
  @Input() featureId!: number
  readonly model = signal<FactorReviseModel | undefined>(undefined)
  form: UntypedFormGroup
  fields: FormlyFieldConfig[]

  private formMutation = inject(FormMutationService)

  mutationState?: FormMutationState
  url?: string

  constructor(
    private revisableFieldsGQL: FactorRevisableFieldsGQL,
    private submitRevisionsGQL: SuggestFactorRevisionGQL
  ) {
    this.form = new UntypedFormGroup({})
    this.fields = factorReviseFields
  }

  ngOnInit() {
    this.url = `/features/${this.featureId}/revisions`
  }

  ngAfterViewInit(): void {
    this.revisableFieldsGQL
      .fetch({ variables: { featureId: this.featureId } })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: ({ data }) => {
          const feature = data?.feature
          if (feature) {
            // the card title names what is being revised
            setFormSubject(this.fields, feature.name)
            let fields = factorToModelFields(feature)
            if (fields) {
              this.model.set({
                id: feature.id,
                fields: fields,
              })
            }
          }
        },
        error: (error) => {
          console.error('Error retrieving Factor.')
          console.error(error)
        },
        complete: () => {},
      })
  }

  onSubmit(model: FactorReviseModel) {
    if (!this.featureId) {
      return
    }
    let input = factorFormModelToReviseInput(this.featureId, model)
    if (input) {
      this.mutationState = this.formMutation.mutate(this.submitRevisionsGQL, {
        input: input,
      })
    }
  }
}

import {
  FormMutationService,
  FormMutationState,
} from '@app/forms/utilities/form-mutation'
import { Component, ChangeDetectionStrategy, inject } from '@angular/core'
import { UntypedFormGroup } from '@angular/forms'
import { NetworkErrorsService } from '@app/core/services/network-errors.service'
import { VariantGroupSubmitModel } from '@app/forms/models/variant-group-submit.model'
import { variantGroupFormModelToInput } from '@app/forms/utilities/variant-group-to-model-fields'
import {
  SubmitVariantGroupGQL,
  SubmitVariantGroupMutation,
  SubmitVariantGroupMutationVariables,
} from './variantgroup-submit.query.gql.generated'
import { Maybe } from '@app/generated/civic.apollo.types'
import { UntilDestroy } from '@ngneat/until-destroy'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { variantgroupSuggestFields } from './variantgroup-submit.form.config'

@UntilDestroy()
@Component({
  selector: 'cvc-variantgroup-submit-form',
  templateUrl: './variantgroup-submit.form.html',
  styleUrls: ['./variantgroup-submit.form.less'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class CvcVariantgroupSubmitForm {
  model: VariantGroupSubmitModel
  form: UntypedFormGroup
  fields: FormlyFieldConfig[]

  private formMutation = inject(FormMutationService)

  mutationState?: FormMutationState
  newVariantGroupId: Maybe<number>
  newVariantGroupUrl: Maybe<string>

  constructor(
    private submitVariantGroupGQL: SubmitVariantGroupGQL,
    private networkErrorService: NetworkErrorsService
  ) {
    this.form = new UntypedFormGroup({})
    this.model = { fields: {} }
    this.fields = variantgroupSuggestFields
  }

  onSubmit(model: VariantGroupSubmitModel) {
    const input = variantGroupFormModelToInput(model)
    if (input) {
      this.mutationState = this.formMutation.mutate(
        this.submitVariantGroupGQL,
        { input: input },
        undefined,
        (data) => {
          this.newVariantGroupId = data.submitVariantGroup?.variantGroup.id
          this.newVariantGroupUrl = `/variant-groups/${this.newVariantGroupId}`
        }
      )
    }
  }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { MutatorWithState } from '@app/core/utilities/mutation-state-wrapper'
import { CvcFormSubmissionStatusDisplayModule } from '@app/forms/components/form-submission-status-display/form-submission-status-display.module'
import { CvcQuickAddFormBase } from '@app/forms/select/quick-add-form.base'
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzGridModule } from 'ng-zorro-antd/grid'
import {
  QuickAddDiseaseGQL,
  QuickAddDiseaseMutation,
  QuickAddDiseaseMutationVariables,
} from './disease-quick-add.query.gql.generated'

type DiseaseQuickAddModel = {
  name?: string
  doid?: string
}

@Component({
  selector: 'cvc-disease-quick-add-form',
  standalone: true,
  templateUrl: './disease-quick-add.form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormlyModule,
    NzButtonModule,
    NzFormModule,
    NzGridModule,
    CvcFormSubmissionStatusDisplayModule,
  ],
})
export class CvcDiseaseQuickAddForm extends CvcQuickAddFormBase<
  DiseaseQuickAddModel,
  number
> {
  model: DiseaseQuickAddModel = { name: '' }

  private readonly query = inject(QuickAddDiseaseGQL)

  addDiseaseMutator = new MutatorWithState<
    QuickAddDiseaseGQL,
    QuickAddDiseaseMutation,
    QuickAddDiseaseMutationVariables
  >(this.errors)

  fields: FormlyFieldConfig[] = [
    {
      key: 'doid',
      type: 'base-input',
      props: {
        label: 'DOID',
        keydown: (_k, e) => {
          if (e.code === 'Tab') {
            e.stopPropagation()
          }
        },
      },
    },
    {
      key: 'name',
      props: {
        hidden: true,
        required: true,
      },
    },
  ]

  onSubmit(model: DiseaseQuickAddModel) {
    if (!model.name) {
      console.error(
        `disease-quick-add form onSubmit requires model with valid name.`
      )
      return
    }
    this.mutationState = this.addDiseaseMutator.mutate(
      this.query,
      { name: model.name, doid: model.doid },
      {},
      (data) => {
        if (data.addDisease) {
          if (data.addDisease.new) {
            this.successMessage = `New Disease ${data.addDisease.disease.name} added.`
          } else {
            this.successMessage = `Existing Disease ${data.addDisease.disease.name} with DOID ${data.addDisease.disease.doid} found. `
          }
          this.cvcOnCreate.next(data.addDisease.disease.id)
        }
      }
    )
  }
}

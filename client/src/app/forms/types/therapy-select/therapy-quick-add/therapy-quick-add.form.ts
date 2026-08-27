import {
  FormMutationService,
  FormMutationState,
} from '@app/forms/utilities/form-mutation'
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { CvcFormSubmissionStatusDisplayModule } from '@app/forms/components/form-submission-status-display/form-submission-status-display.module'
import { CvcQuickAddFormBase } from '@app/forms/select/quick-add-form.base'
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzGridModule } from 'ng-zorro-antd/grid'
import {
  QuickAddTherapyGQL,
  QuickAddTherapyMutation,
  QuickAddTherapyMutationVariables,
} from './therapy-quick-add.query.gql.generated'

type TherapyQuickAddModel = {
  name?: string
  ncitId?: string
}

@Component({
  selector: 'cvc-therapy-quick-add-form',
  standalone: true,
  templateUrl: './therapy-quick-add.form.html',
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
export class CvcTherapyQuickAddForm extends CvcQuickAddFormBase<
  TherapyQuickAddModel,
  number
> {
  model: TherapyQuickAddModel = { name: '' }

  private readonly query = inject(QuickAddTherapyGQL)

  fields: FormlyFieldConfig[] = [
    {
      key: 'ncitId',
      type: 'base-input',
      props: {
        label: 'NCIt ID',
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

  onSubmit(model: TherapyQuickAddModel) {
    if (!model.name) {
      console.error(
        `therapy-quick-add form onSubmit requires model with valid name.`
      )
      return
    }
    this.mutationState = this.formMutation.mutate(
      this.query,
      { name: model.name, ncitId: model.ncitId },
      {},
      (data) => {
        if (!data.addTherapy) return
        const therapy = data.addTherapy.therapy
        this.successMessage = data.addTherapy.new
          ? `New Therapy ${therapy.name} added.`
          : `Existing Therapy ${therapy.name} found.`
        this.cvcOnCreate.next(therapy.id)
      }
    )
  }
}

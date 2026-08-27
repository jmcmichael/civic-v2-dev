import {
  FormMutationService,
  FormMutationState,
} from '@app/forms/utilities/form-mutation'
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
  signal,
} from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { CvcFormSubmissionStatusDisplayModule } from '@app/forms/components/form-submission-status-display/form-submission-status-display.module'
import { CvcQuickAddFormBase } from '@app/forms/select/quick-add-form.base'
import {
  CreateableFeatureTypes,
  FeatureInstanceTypes,
  Maybe,
} from '@app/generated/civic.apollo.types'
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core'
import { NzGridModule } from 'ng-zorro-antd/grid'
import {
  QuickAddFeatureGQL,
  QuickAddFeatureMutation,
  QuickAddFeatureMutationVariables,
} from './feature-quick-add.query.gql.generated'

type FeatureQuickAddModel = Partial<QuickAddFeatureMutationVariables>

export type FeatureIdWithCreationStatus = {
  id: number
  new: boolean
}

@Component({
  selector: 'cvc-feature-quick-add-form',
  standalone: true,
  templateUrl: './feature-quick-add.form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CvcFormSubmissionStatusDisplayModule,
    FormlyModule,
    NzGridModule,
  ],
})
export class CvcFeatureQuickAddForm extends CvcQuickAddFormBase<
  FeatureQuickAddModel,
  FeatureIdWithCreationStatus
> {
  @Input()
  set cvcFeatureType(type: Maybe<FeatureInstanceTypes>) {
    //TODO - this is hacky, maybe need to rework the types on the backend
    const creatable = Object.values(CreateableFeatureTypes).includes(
      type as unknown as CreateableFeatureTypes
    )
    if (creatable) {
      this.model = {
        ...this.model,
        featureType: type as unknown as CreateableFeatureTypes,
      }
    }
    this.showForm.set(creatable)
  }

  model: FeatureQuickAddModel = { name: '' }

  /** quick-add only applies to feature types a curator may create */
  readonly showForm = signal(false)
  readonly formMessage = signal<Maybe<string>>(
    'Feature does not exist, create it?'
  )

  minNameLength = 3

  private readonly query = inject(QuickAddFeatureGQL)

  fields: FormlyFieldConfig[] = [
    {
      key: 'featureType',
      hide: true,
      props: {
        required: true,
      },
    },
    {
      key: 'name',
      hide: true,
      props: {
        minLength: this.minNameLength,
        required: true,
      },
    },
    {
      key: 'organizationId',
      type: 'org-submit-button',
      props: {
        submitLabel: 'Add Feature',
      },
    },
  ]

  protected override onSearchString(str: string): void {
    this.formMessage.set(
      str.length < this.minNameLength
        ? `New Feature name must be at least ${this.minNameLength} characters.`
        : `Feature '${str}' does not exist, create it?`
    )
  }

  onSubmit(model: FeatureQuickAddModel) {
    if (!(model.name && model.featureType)) {
      console.error(
        `feature-quick-add form onSubmit requires model with valid name and featureType.`
      )
      return
    }
    this.mutationState = this.formMutation.mutate(
      this.query,
      {
        name: model.name,
        featureType: model.featureType,
        organizationId: model.organizationId,
      },
      {},
      (data) => {
        if (!data.createFeature) return
        this.formMessage.set(undefined)
        this.cvcOnCreate.next({
          id: data.createFeature.feature.id,
          new: data.createFeature.new,
        })
      }
    )
  }
}

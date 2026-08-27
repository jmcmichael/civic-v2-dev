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
import { Maybe } from '@app/generated/civic.apollo.types'
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { VariantIdWithCreationStatus } from '../variant-select.type'
import {
  QuickAddVariantGQL,
  QuickAddVariantMutation,
  QuickAddVariantMutationVariables,
} from './variant-quick-add.query.gql.generated'

type VariantQuickAddModel = Partial<QuickAddVariantMutationVariables>

@Component({
  selector: 'cvc-variant-quick-add-form',
  standalone: true,
  templateUrl: './variant-quick-add.form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormlyModule,
    NzGridModule,
    CvcFormSubmissionStatusDisplayModule,
  ],
})
export class CvcVariantQuickAddForm extends CvcQuickAddFormBase<
  VariantQuickAddModel,
  VariantIdWithCreationStatus
> {
  @Input()
  set cvcFeatureId(id: Maybe<number>) {
    if (!id) return
    this.model = { ...this.model, featureId: id }
  }

  model: VariantQuickAddModel = { name: '' }

  /** the inline hint above the form; empty once a variant is created */
  readonly formMessage = signal<Maybe<string>>(
    'Variant does not exist, create it?'
  )

  minNameLength = 3

  private readonly query = inject(QuickAddVariantGQL)

  fields: FormlyFieldConfig[] = [
    {
      key: 'featureId',
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
        submitLabel: 'Add Variant',
      },
    },
  ]

  protected override onSearchString(str: string): void {
    this.formMessage.set(
      str.length < this.minNameLength
        ? `New Variant name must be at least ${this.minNameLength} characters.`
        : `Variant '${str}' does not exist, create it?`
    )
  }

  onSubmit(model: VariantQuickAddModel) {
    if (!(model.name && model.featureId)) {
      console.error(
        `variant-quick-add form onSubmit requires model with valid name and featureId.`
      )
      return
    }
    this.mutationState = this.formMutation.mutate(
      this.query,
      {
        name: model.name,
        featureId: model.featureId,
        organizationId: model.organizationId,
      },
      {},
      (data) => {
        if (!data.createVariant) return
        this.formMessage.set(undefined)
        this.cvcOnCreate.next({
          id: data.createVariant.variant.id,
          new: data.createVariant.new,
        })
      }
    )
  }
}

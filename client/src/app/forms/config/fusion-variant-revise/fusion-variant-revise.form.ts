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
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { FusionVariantReviseModel } from '@app/forms/models/fusion-variant-revise.model'
import {
  FusionVariantRevisableFieldsGQL,
  SuggestFusionVariantRevisionGQL,
  SuggestFusionVariantRevisionMutation,
  SuggestFusionVariantRevisionMutationVariables,
} from './fusion-variant-revise.query.gql.generated'
import { FusionPartnerStatus } from '@app/generated/civic.apollo.types'
import { fusionVariantReviseFields } from './fusion-variant-revise.form.config'
import {
  fusionVariantFormModelToReviseInput,
  fusionVariantToModelFields,
} from '@app/forms/utilities/fusion-variant-to-model-fields'
import { setFormSubject } from '@app/forms/messages/form-titles'

@UntilDestroy()
@Component({
  selector: 'cvc-fusion-variant-revise-form',
  templateUrl: './fusion-variant-revise.form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CvcFusionVariantReviseForm implements OnInit, AfterViewInit {
  @Input() variantId!: number
  readonly model = signal<FusionVariantReviseModel | undefined>(undefined)
  form: UntypedFormGroup
  fields?: FormlyFieldConfig[]

  private formMutation = inject(FormMutationService)

  mutationState?: FormMutationState
  url?: string

  constructor(
    private revisableFieldsGQL: FusionVariantRevisableFieldsGQL,
    private submitRevisionsGQL: SuggestFusionVariantRevisionGQL
  ) {
    this.form = new UntypedFormGroup({})
  }

  ngOnInit() {
    this.url = `/variants/${this.variantId}/revisions`
  }

  ngAfterViewInit(): void {
    this.revisableFieldsGQL
      .fetch({ variables: { variantId: this.variantId } })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: ({ data }) => {
          const variant = data?.variant
          if (
            variant &&
            variant.__typename == 'FusionVariant' &&
            variant.feature.featureInstance.__typename == 'Fusion'
          ) {
            const fivePrimeDisabled =
              variant.feature.featureInstance.fivePrimePartnerStatus !=
              FusionPartnerStatus.Known
            const threePrimeDisabled =
              variant.feature.featureInstance.threePrimePartnerStatus !=
              FusionPartnerStatus.Known
            // fields must be assigned before the model signal fires the repaint
            this.fields = fusionVariantReviseFields(
              fivePrimeDisabled,
              threePrimeDisabled
            )
            // after the reassignment above, or the subject lands on the
            // config this form is about to replace
            setFormSubject(this.fields, variant.name)
            this.model.set({
              id: variant.id,
              fields: fusionVariantToModelFields(variant),
            })
          }
        },
        error: (error) => {
          console.error('Error retrieving Variant.')
          console.error(error)
        },
        complete: () => {},
      })
  }

  onSubmit(model: FusionVariantReviseModel) {
    if (!this.variantId) {
      return
    }
    let input = fusionVariantFormModelToReviseInput(this.variantId, model)
    if (input) {
      this.mutationState = this.formMutation.mutate(this.submitRevisionsGQL, {
        input: input,
      })
    }
  }
}

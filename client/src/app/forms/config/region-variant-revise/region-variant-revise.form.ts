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
import { NetworkErrorsService } from '@app/core/services/network-errors.service'
import { RegionVariantReviseModel } from '@app/forms/models/region-variant-revise.model'
import {
  RegionVariantRevisableFieldsGQL,
  SuggestRegionVariantRevisionGQL,
  SuggestRegionVariantRevisionMutation,
  SuggestRegionVariantRevisionMutationVariables,
} from './region-variant-revise.query.gql.generated'
import { regionVariantReviseFields } from './region-variant-revise.form.config'
import {
  regionVariantFormModelToReviseInput,
  regionVariantToModelFields,
} from '@app/forms/utilities/region-variant-to-model-fields'

@UntilDestroy()
@Component({
  selector: 'cvc-region-variant-revise-form',
  templateUrl: './region-variant-revise.form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CvcRegionVariantReviseForm implements OnInit, AfterViewInit {
  @Input() variantId!: number
  readonly model = signal<RegionVariantReviseModel | undefined>(undefined)
  form: UntypedFormGroup
  fields: FormlyFieldConfig[]

  private formMutation = inject(FormMutationService)

  mutationState?: FormMutationState
  url?: string

  constructor(
    private revisableFieldsGQL: RegionVariantRevisableFieldsGQL,
    private submitRevisionsGQL: SuggestRegionVariantRevisionGQL,
    private networkErrorService: NetworkErrorsService
  ) {
    this.form = new UntypedFormGroup({})
    this.fields = regionVariantReviseFields
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
          if (variant && variant.__typename == 'RegionVariant') {
            this.model.set({
              id: variant.id,
              fields: regionVariantToModelFields(variant),
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

  onSubmit(model: RegionVariantReviseModel) {
    if (!this.variantId) {
      return
    }
    let input = regionVariantFormModelToReviseInput(this.variantId, model)
    if (input) {
      this.mutationState = this.formMutation.mutate(this.submitRevisionsGQL, {
        input: input,
      })
    }
  }
}

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
import { FactorVariantReviseModel } from '@app/forms/models/factor-variant-revise.model'
import {
  FactorVariantRevisableFieldsGQL,
  SuggestFactorVariantRevisionGQL,
  SuggestFactorVariantRevisionMutation,
  SuggestFactorVariantRevisionMutationVariables,
} from './factor-variant-revise.query.gql.generated'
import { factorVariantReviseFields } from './factor-variant-revise.form.config'
import {
  factorVariantFormModelToReviseInput,
  factorVariantToModelFields,
} from '@app/forms/utilities/factor-variant-to-model-fields'
import { setFormSubject } from '@app/forms/messages/form-titles'

@UntilDestroy()
@Component({
  selector: 'cvc-factor-variant-revise-form',
  templateUrl: './factor-variant-revise.form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CvcFactorVariantReviseForm implements OnInit, AfterViewInit {
  @Input() variantId!: number
  readonly model = signal<FactorVariantReviseModel | undefined>(undefined)
  form: UntypedFormGroup
  fields: FormlyFieldConfig[]

  private formMutation = inject(FormMutationService)

  mutationState?: FormMutationState
  url?: string

  constructor(
    private revisableFieldsGQL: FactorVariantRevisableFieldsGQL,
    private submitRevisionsGQL: SuggestFactorVariantRevisionGQL
  ) {
    this.form = new UntypedFormGroup({})
    this.fields = factorVariantReviseFields
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
          if (variant && variant.__typename == 'FactorVariant') {
            // the card title names what is being revised
            setFormSubject(this.fields, variant.name)
            this.model.set({
              id: variant.id,
              fields: factorVariantToModelFields(variant),
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

  onSubmit(model: FactorVariantReviseModel) {
    if (!this.variantId) {
      return
    }
    let input = factorVariantFormModelToReviseInput(this.variantId, model)
    if (input) {
      this.mutationState = this.formMutation.mutate(this.submitRevisionsGQL, {
        input: input,
      })
    }
  }
}

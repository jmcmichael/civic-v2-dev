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
  RegionRevisableFieldsGQL,
  SuggestRegionRevisionGQL,
  SuggestRegionRevisionMutation,
  SuggestRegionRevisionMutationVariables,
} from './region-revise.query.gql.generated'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { RegionReviseModel } from '@app/forms/models/region-revise.model'
import {
  regionFormModelToReviseInput,
  regionToModelFields,
} from '@app/forms/utilities/region-to-model-fields'
import { regionReviseFields } from './region-revise.form.config'

@UntilDestroy()
@Component({
  selector: 'cvc-region-revise-form',
  templateUrl: './region-revise.form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CvcRegionReviseForm implements OnInit, AfterViewInit {
  @Input() featureId!: number
  readonly model = signal<RegionReviseModel | undefined>(undefined)
  form: UntypedFormGroup
  fields: FormlyFieldConfig[]

  private formMutation = inject(FormMutationService)

  mutationState?: FormMutationState
  url?: string

  constructor(
    private revisableFieldsGQL: RegionRevisableFieldsGQL,
    private submitRevisionsGQL: SuggestRegionRevisionGQL
  ) {
    this.form = new UntypedFormGroup({})
    this.fields = regionReviseFields
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
            this.model.set({
              id: feature.id,
              fields: regionToModelFields(feature),
            })
          }
        },
        error: (error) => {
          console.error('Error retrieving Region.')
          console.error(error)
        },
        complete: () => {},
      })
  }

  onSubmit(model: RegionReviseModel) {
    if (!this.featureId) {
      return
    }
    let input = regionFormModelToReviseInput(this.featureId, model)
    if (input) {
      this.mutationState = this.formMutation.mutate(this.submitRevisionsGQL, {
        input: input,
      })
    }
  }
}

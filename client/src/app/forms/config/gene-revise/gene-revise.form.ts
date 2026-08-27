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
  GeneRevisableFieldsGQL,
  SuggestGeneRevisionGQL,
  SuggestGeneRevisionMutation,
  SuggestGeneRevisionMutationVariables,
} from './gene-revise.query.gql.generated'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { NetworkErrorsService } from '@app/core/services/network-errors.service'
import { GeneReviseModel } from '@app/forms/models/gene-revise.model'
import {
  geneFormModelToReviseInput,
  geneToModelFields,
} from '@app/forms/utilities/gene-to-model-fields'
import { geneReviseFields } from './gene-revise.form.config'

@UntilDestroy()
@Component({
  selector: 'cvc-gene-revise-form',
  templateUrl: './gene-revise.form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CvcGeneReviseForm implements OnInit, AfterViewInit {
  @Input() featureId!: number
  readonly model = signal<GeneReviseModel | undefined>(undefined)
  form: UntypedFormGroup
  fields: FormlyFieldConfig[]

  private formMutation = inject(FormMutationService)

  mutationState?: FormMutationState
  url?: string

  constructor(
    private revisableFieldsGQL: GeneRevisableFieldsGQL,
    private submitRevisionsGQL: SuggestGeneRevisionGQL,
    private networkErrorService: NetworkErrorsService
  ) {
    this.form = new UntypedFormGroup({})
    this.fields = geneReviseFields
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
              fields: geneToModelFields(feature),
            })
          }
        },
        error: (error) => {
          console.error('Error retrieving Gene.')
          console.error(error)
        },
        complete: () => {},
      })
  }

  onSubmit(model: GeneReviseModel) {
    if (!this.featureId) {
      return
    }
    let input = geneFormModelToReviseInput(this.featureId, model)
    if (input) {
      this.mutationState = this.formMutation.mutate(this.submitRevisionsGQL, {
        input: input,
      })
    }
  }
}

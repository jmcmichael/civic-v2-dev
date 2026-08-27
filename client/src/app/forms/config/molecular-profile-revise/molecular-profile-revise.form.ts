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
  MolecularProfileRevisableFieldsGQL,
  SuggestMolecularProfileRevisionGQL,
  SuggestMolecularProfileRevisionMutation,
  SuggestMolecularProfileRevisionMutationVariables,
} from './molecular-profile-revise.query.gql.generated'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core'
import { NetworkErrorsService } from '@app/core/services/network-errors.service'
import { MolecularProfileReviseModel } from '@app/forms/models/molecular-profile-revise.model'
import {
  molecularProfileFormModelToReviseInput,
  molecularProfileToModelFields,
} from '@app/forms/utilities/molecular-profile-to-model-fields'
import { molecularProfileReviseFields } from './molecular-profile-revise.form.config'

@UntilDestroy()
@Component({
  selector: 'cvc-mp-revise-form',
  templateUrl: './molecular-profile-revise.form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CvcMolecularProfileReviseForm implements OnInit, AfterViewInit {
  @Input() molecularProfileId!: number
  readonly model = signal<MolecularProfileReviseModel | undefined>(undefined)
  form: UntypedFormGroup
  fields: FormlyFieldConfig[]
  options: FormlyFormOptions

  private formMutation = inject(FormMutationService)

  mutationState?: FormMutationState
  url?: string

  constructor(
    private revisableFieldsGQL: MolecularProfileRevisableFieldsGQL,
    private submitRevisionsGQL: SuggestMolecularProfileRevisionGQL,
    networkErrorService: NetworkErrorsService
  ) {
    this.form = new UntypedFormGroup({})
    this.options = { formState: { isSimpleMp: undefined } }

    this.fields = molecularProfileReviseFields
  }

  ngOnInit(): void {
    this.url = `/molecular-profiles/${this.molecularProfileId}/revisions`
  }

  ngAfterViewInit(): void {
    this.revisableFieldsGQL
      .fetch({ variables: { molecularProfileId: this.molecularProfileId } })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: ({ data }) => {
          const molecularProfile = data?.molecularProfile
          if (molecularProfile) {
            this.options.formState.isSimpleMp = !molecularProfile.isComplex

            this.model.set({
              id: molecularProfile.id,
              fields: molecularProfileToModelFields(molecularProfile),
            })
          }
        },
        error: (error) => {
          console.error('Error retrieving MolecularProfile.')
          console.error(error)
        },
        complete: () => {},
      })
  }

  onSubmit(model: MolecularProfileReviseModel) {
    if (!this.molecularProfileId) {
      return
    }
    let input = molecularProfileFormModelToReviseInput(
      this.molecularProfileId,
      model
    )
    if (input) {
      this.mutationState = this.formMutation.mutate(this.submitRevisionsGQL, {
        input: input,
      })
    }
  }
}

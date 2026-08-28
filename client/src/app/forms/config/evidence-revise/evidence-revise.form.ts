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
import { EvidenceReviseModel } from '@app/forms/models/evidence-revise.model'
import { EvidenceState } from '@app/forms/states/evidence.state'
import {
  evidenceFormModelToReviseInput,
  evidenceToModelFields,
} from '@app/forms/utilities/evidence-to-model-fields'
import {
  EvidenceItemRevisableFieldsGQL,
  SuggestEvidenceItemRevisionGQL,
  SuggestEvidenceItemRevisionMutation,
  SuggestEvidenceItemRevisionMutationVariables,
} from './evidence-revise.query.gql.generated'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core'
import { evidenceReviseFields } from './evidence-revise.form.config'

@UntilDestroy()
@Component({
  selector: 'cvc-evidence-revise-form',
  templateUrl: './evidence-revise.form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CvcEvidenceReviseForm implements OnInit, AfterViewInit {
  @Input() evidenceId!: number
  readonly model = signal<EvidenceReviseModel | undefined>(undefined)
  form: UntypedFormGroup
  fields: FormlyFieldConfig[]
  state: EvidenceState
  options: FormlyFormOptions

  url?: string

  private formMutation = inject(FormMutationService)

  mutationState?: FormMutationState

  constructor(
    private revisableFieldsGQL: EvidenceItemRevisableFieldsGQL,
    private submitRevisionsGQL: SuggestEvidenceItemRevisionGQL
  ) {
    this.form = new UntypedFormGroup({})
    this.fields = evidenceReviseFields
    this.state = new EvidenceState()
    this.state.formMode = 'revise'
    this.options = { formState: this.state }
  }

  ngOnInit() {
    this.url = `/evidence/${this.evidenceId}/revisions`
    // the full-page card owns the page title; the entity name is only
    // known here, so patch it onto the card wrapper's config
    const cardField = this.fields[0]?.fieldGroup?.find((f) =>
      f.wrappers?.includes('form-card')
    )
    if (cardField?.props) {
      cardField.props.formTitle = {
        action: 'REVISE',
        icon: 'civic-evidence',
        entityType: 'EvidenceItem',
        name: `EID${this.evidenceId}`,
      }
    }
  }

  ngAfterViewInit(): void {
    this.revisableFieldsGQL
      .fetch({ variables: { evidenceId: this.evidenceId } })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: ({ data }) => {
          const evidenceItem = data?.evidenceItem
          if (evidenceItem) {
            this.model.set({
              id: evidenceItem.id,
              fields: evidenceToModelFields(evidenceItem),
            })
          }
        },
        error: (error) => {
          console.error('Error retrieving evidenceItem.')
          console.error(error)
        },
      })
  }

  onSubmit(model: EvidenceReviseModel) {
    if (!this.evidenceId) {
      return
    }

    let input = evidenceFormModelToReviseInput(this.evidenceId, model)
    if (input) {
      this.mutationState = this.formMutation.mutate(this.submitRevisionsGQL, {
        input: input,
      })
    }
  }
}

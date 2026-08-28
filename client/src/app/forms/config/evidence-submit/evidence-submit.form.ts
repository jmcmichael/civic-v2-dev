import {
  FormMutationService,
  FormMutationState,
} from '@app/forms/utilities/form-mutation'
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  signal,
  inject,
} from '@angular/core'
import { UntypedFormGroup } from '@angular/forms'
import { EvidenceSubmitModel } from '@app/forms/models/evidence-submit.model'
import { EvidenceState } from '@app/forms/states/evidence.state'
import {
  evidenceToModelFields,
  evidenceFormModelToInput,
} from '@app/forms/utilities/evidence-to-model-fields'
import { print } from 'graphql'
import { EvidenceItemRevisableFieldsGQL } from '@app/forms/config/evidence-revise/evidence-revise.query.gql.generated'
import {
  SubmitEvidenceItemGQL,
  SubmitEvidenceItemMutation,
  SubmitEvidenceItemMutationVariables,
} from './evidence-submit.query.gql.generated'
import {
  ExistingEvidenceCountGQL,
  ExistingEvidenceCountQuery,
  ExistingEvidenceCountQueryVariables,
  FullyCuratedSourceGQL,
  FullyCuratedSourceQuery,
  FullyCuratedSourceQueryVariables,
} from './existing-evidence-count.gql.generated'
import { Maybe } from '@app/generated/civic.apollo.types'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core'
import { evidenceSubmitFields } from './evidence-submit.form.config'
import { QueryRef } from 'apollo-angular'
import { Observable, filter, map, Subscription } from 'rxjs'
import { isNonNulled } from 'rxjs-etc'
import { ActivatedRoute } from '@angular/router'

@UntilDestroy()
@Component({
  selector: 'cvc-evidence-submit-form',
  templateUrl: './evidence-submit.form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CvcEvidenceSubmitForm implements OnDestroy, AfterViewInit, OnInit {
  readonly model = signal<EvidenceSubmitModel | undefined>(undefined)
  form: UntypedFormGroup
  fields: FormlyFieldConfig[]
  state: EvidenceState
  options: FormlyFormOptions

  private formMutation = inject(FormMutationService)

  mutationState?: FormMutationState
  newEvidenceId: Maybe<number>
  newEvidenceUrl?: string

  selectedSourceId?: number
  selectedMpId?: number

  countQueryRef?: QueryRef<
    ExistingEvidenceCountQuery,
    ExistingEvidenceCountQueryVariables
  >
  curatedQueryRef?: QueryRef<
    FullyCuratedSourceQuery,
    FullyCuratedSourceQueryVariables
  >
  existingEvidenceId?: number
  routeSub: Subscription

  existingEvidenceCount$?: Observable<number>
  fullyCuratedSource$?: Observable<Maybe<boolean>>

  constructor(
    private revisableFieldsGQL: EvidenceItemRevisableFieldsGQL,
    private submitEvidenceGQL: SubmitEvidenceItemGQL,
    private existingEvidenceGQL: ExistingEvidenceCountGQL,
    private fullyCuratedSourceGQL: FullyCuratedSourceGQL,
    private route: ActivatedRoute
  ) {
    this.form = new UntypedFormGroup({})
    this.fields = evidenceSubmitFields
    this.state = new EvidenceState()
    this.options = { formState: this.state }
    this.routeSub = this.route.queryParams.subscribe((params) => {
      if (params.existingEvidenceId) {
        this.existingEvidenceId = +params.existingEvidenceId
        this.state.formMode = 'clone'
      } else {
        this.model.set({ fields: {} })
      }
    })
  }

  ngOnInit(): void {
    // the full-page card owns the page title; submit forms have no entity
    // id, so the name is the entity type itself
    const cardField = this.fields[0]?.fieldGroup?.find((f) =>
      f.wrappers?.includes('form-card')
    )
    if (cardField?.props) {
      cardField.props.formTitle = {
        action: 'ADD',
        icon: 'civic-evidence',
        entityType: 'EvidenceItem',
        name: 'Evidence Item',
      }
    }

    this.countQueryRef = this.existingEvidenceGQL.watch({
      variables: {
        molecularProfileId: 0,
        sourceId: 0,
      },
    })
    this.curatedQueryRef = this.fullyCuratedSourceGQL.watch({
      variables: { sourceId: 0 },
    })

    this.existingEvidenceCount$ = this.countQueryRef?.valueChanges.pipe(
      map((c) => c.data?.evidenceItems?.totalCount),
      filter(isNonNulled),
      untilDestroyed(this)
    )
    this.fullyCuratedSource$ = this.curatedQueryRef?.valueChanges.pipe(
      map((c) => c.data?.source?.fullyCurated),
      untilDestroyed(this)
    )
  }

  ngAfterViewInit(): void {
    if (this.existingEvidenceId) {
      this.revisableFieldsGQL
        .fetch({ variables: { evidenceId: this.existingEvidenceId } })
        .pipe(untilDestroyed(this))
        .subscribe({
          next: ({ data }) => {
            const evidenceItem = data?.evidenceItem
            if (evidenceItem) {
              const fields = evidenceToModelFields(evidenceItem)
              //clear statement on cloned EIDs
              fields.description = undefined
              this.model.set({ fields })
            }
          },
          error: (error) => {
            console.error('Error retrieving evidenceItem.')
            console.error(error)
          },
          complete: () => {},
        })
    } else {
    }
  }

  // the submission preview's Copy GraphQL: the request as it would be
  // sent right now
  graphqlPreview = () => ({
    query: print(this.submitEvidenceGQL.document),
    variables: {
      input: this.model() ? evidenceFormModelToInput(this.model()!) : undefined,
    },
  })

  onSubmit(model: EvidenceSubmitModel) {
    const input = evidenceFormModelToInput(model)
    if (input) {
      this.mutationState = this.formMutation.mutate(
        this.submitEvidenceGQL,
        { input: input },
        undefined,
        (data) => {
          this.newEvidenceId = data.submitEvidence?.evidenceItem.id
          this.newEvidenceUrl = `/evidence/${this.newEvidenceId}/summary`
        }
      )
    }
  }

  onModelChange(newModel: EvidenceSubmitModel) {
    if (newModel.fields.sourceId && newModel.fields.molecularProfileId) {
      if (
        newModel.fields.sourceId != this.selectedSourceId ||
        newModel.fields.molecularProfileId != this.selectedMpId
      ) {
        this.selectedSourceId = newModel.fields.sourceId
        this.selectedMpId = newModel.fields.molecularProfileId
        this.countQueryRef?.refetch({
          molecularProfileId: newModel.fields.molecularProfileId,
          sourceId: newModel.fields.sourceId,
        })
      }
    } else {
      this.countQueryRef?.refetch({ molecularProfileId: 0, sourceId: 0 })
    }

    if (newModel.fields.sourceId) {
      if (newModel.fields.sourceId != this.selectedSourceId) {
        this.selectedSourceId = newModel.fields.sourceId
        this.curatedQueryRef?.refetch({ sourceId: this.selectedSourceId })
      }
    } else {
      this.selectedSourceId = undefined
      this.curatedQueryRef?.refetch({ sourceId: 0 })
    }
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe()
  }
}

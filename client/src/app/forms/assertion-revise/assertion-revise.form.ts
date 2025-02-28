import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core'
import { AbstractControl, UntypedFormGroup } from '@angular/forms'
import { NetworkErrorsService } from '@app/core/services/network-errors.service'
import { MutatorWithState } from '@app/core/utilities/mutation-state-wrapper'
import {
  AcmgCode,
  AmpLevel,
  AssertionSignificance,
  AssertionDetailGQL,
  AssertionDirection,
  AssertionRevisableFieldsGQL,
  AssertionType,
  ClingenCode,
  Maybe,
  ModeratedEntities,
  NccnGuideline,
  Organization,
  RevisableAssertionFieldsFragment,
  RevisionsGQL,
  RevisionStatus,
  SuggestAssertionRevisionGQL,
  SuggestAssertionRevisionInput,
  SuggestAssertionRevisionMutation,
  SuggestAssertionRevisionMutationVariables,
  TherapyInteraction,
  VariantOrigin,
} from '@app/generated/civic.apollo'
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core'
import { Subject } from 'rxjs'
import { AssertionState } from '../config/states/assertion.state'
import {
  FormDisease,
  FormTherapy,
  FormEvidence,
  FormMolecularProfile,
  FormPhenotype,
} from '../forms.interfaces'
import * as fmt from '@app/forms/config/utilities/input-formatters'
import { takeUntil } from 'rxjs/operators'

interface FormModel {
  fields: {
    id: number
    description: string
    summary: string
    molecularProfile: FormMolecularProfile
    variantOrigin: VariantOrigin
    evidenceType: AssertionType
    significance: AssertionSignificance
    disease: Maybe<FormDisease>[]
    evidenceDirection: AssertionDirection
    phenotypes: FormPhenotype[]
    therapies: FormTherapy[]
    therapyInteractionType: Maybe<TherapyInteraction>
    ampLevel: Maybe<AmpLevel>
    evidenceItems: FormEvidence[]
    nccnGuideline: Maybe<NccnGuideline>
    nccnGuidelineVersion: Maybe<string>
    acmgCodes: AcmgCode[]
    clingenCodes: ClingenCode[]
    fdaCompanionTest: Maybe<boolean>
    fdaRegulatoryApproval: Maybe<boolean>
    comment: Maybe<string>
    organization: Maybe<Organization>
  }
}

@Component({
  selector: 'cvc-assertion-revise-form',
  templateUrl: './assertion-revise.form.html',
  styleUrls: ['./assertion-revise.form.less'],
})
export class AssertionReviseForm implements OnDestroy, AfterViewInit {
  @Input() assertionId: Maybe<number>
  private destroy$ = new Subject<void>()

  formModel?: FormModel
  formGroup: UntypedFormGroup = new UntypedFormGroup({})
  formFields: FormlyFieldConfig[]
  formOptions: FormlyFormOptions = { formState: new AssertionState() }

  suggestAssertionRevisionMutator: MutatorWithState<
    SuggestAssertionRevisionGQL,
    SuggestAssertionRevisionMutation,
    SuggestAssertionRevisionMutationVariables
  >

  success: boolean = false
  noNewRevisions: boolean = false
  errorMessages: string[] = []
  loading: boolean = true

  constructor(
    private suggestAssertionRevisionGQL: SuggestAssertionRevisionGQL,
    private networkErrorService: NetworkErrorsService,
    private revisableFieldsGQL: AssertionRevisableFieldsGQL,
    private assertionDetailGQL: AssertionDetailGQL,
    private revisionsGQL: RevisionsGQL
  ) {
    let eidCallback = (eids: FormEvidence[]) => {
      this.formModel!.fields.evidenceItems = eids
    }

    let fdaApprovalCallback = (newVal: boolean | undefined) => {
      this.formModel!.fields.fdaRegulatoryApproval = newVal
    }

    let fdaCompanionCallback = (newVal: boolean | undefined) => {
      this.formModel!.fields.fdaCompanionTest = newVal
    }

    this.suggestAssertionRevisionMutator = new MutatorWithState(
      networkErrorService
    )

    this.formFields = [
      {
        key: 'fields',
        wrappers: ['form-container'],
        templateOptions: {
          label: 'Suggest Assertion Revision Form',
        },
        fieldGroup: [
          {
            key: 'molecularProfile',
            type: 'molecular-profile-input',
            templateOptions: {
              label: 'Molecular Profile',
              helpText:
                'A single variant (Simple Molecular Profile) or a combination of variants (Complex Molecular Profile) relevant to the curated evidence.',
              required: true,
              nzSelectedIndex: 2,
              allowCreate: false,
            },
          },
          {
            key: 'variantOrigin',
            type: 'variant-origin-select',
            templateOptions: {
              required: true,
            },
          },
          {
            key: 'disease',
            type: 'disease-array',
            templateOptions: {
              maxCount: 1,
              allowCreate: false,
            },
          },
          {
            key: 'evidenceType',
            type: 'evidence-type-select',
            templateOptions: {
              label: 'Assertion Type',
              required: true,
            },
          },
          {
            key: 'evidenceDirection',
            type: 'evidence-direction-select',
            templateOptions: {
              label: 'Assertion Direction',
              required: true,
            },
          },
          {
            key: 'significance',
            type: 'significance-select',
            templateOptions: {
              required: true,
            },
          },
          {
            key: 'therapies',
            type: 'therapy-array',
            templateOptions: {
              allowCreate: false,
            },
          },
          {
            key: 'therapyInteractionType',
            type: 'therapy-interaction-select',
            templateOptions: {},
          },
          {
            key: 'ampLevel',
            type: 'amp-level-input',
            templateOptions: {},
          },
          {
            key: 'acmgCodes',
            type: 'acmg-code-array',
            templateOptions: {
              label: 'ACMG/AMP Code(s)',
            },
          },
          {
            key: 'clingenCodes',
            type: 'clingen-code-array',
          },
          {
            key: 'phenotypes',
            type: 'phenotype-array',
            templateOptions: {},
          },
          {
            key: 'nccnGuideline',
            type: 'nccn-guideline-input',
            templateOptions: {},
          },
          {
            key: 'nccnGuidelineVersion',
            type: 'nccn-version-input',
            templateOptions: {},
          },
          {
            key: 'fdaRegulatoryApproval',
            type: 'fda-approval-checkbox',
            templateOptions: {
              modelCallback: fdaApprovalCallback,
            },
          },
          {
            key: 'fdaCompanionTest',
            type: 'fda-test-checkbox',
            templateOptions: {
              modelCallback: fdaCompanionCallback,
            },
          },
          {
            key: 'summary',
            type: 'cvc-textarea',
            templateOptions: {
              label: 'Assertion Summary',
              helpText: 'A short, one sentence summary of this new assertion',
              placeholder: 'No description provided',
              required: true,
            },
          },
          {
            key: 'description',
            type: 'cvc-textarea',
            wrappers: ['form-field'],
            templateOptions: {
              label: 'Assertion Statement',
              helpText:
                'A complete, original description of this new assertion, limited to one paragraph',
              placeholder: 'No description provided',
              required: true,
            },
          },
          {
            key: 'evidenceItems',
            type: 'multi-field',
            wrappers: ['form-field', 'evidence-manager'],
            templateOptions: {
              label: 'Evidence Items',
              helpText: 'Evidence Items that support the assertion.',
              addText: 'Add Evidence by ID',
              required: true,
              eidCallback: eidCallback,
            },
            fieldArray: {
              type: 'evidence-input',
              templateOptions: {
                required: true,
              },
            },
          },
          {
            key: 'comment',
            type: 'comment-textarea',
            templateOptions: {
              label: 'Comment',
              helpText:
                "Please provide any additional comments you wish to make about this evidence item. This comment will appear as the first comment in this item's comment thread.",
              placeholder: 'Please enter a comment describing your revision.',
              required: true,
              minLength: 10,
            },
          },
          {
            key: 'cancel',
            type: 'cancel-button',
            templateOptions: {
              redirectPath: '../..',
            },
          },
          {
            key: 'organization',
            type: 'org-submit-button',
            templateOptions: {
              submitLabel: 'Submit Assertion Revision',
              submitSize: 'large',
            },
          },
        ],
      },
    ]
  }

  toReviseInput(model: Maybe<FormModel>): Maybe<SuggestAssertionRevisionInput> {
    if (model) {
      const fields = model.fields
      return {
        id: fields.id,
        comment: fields.comment!,
        organizationId: fields.organization?.id,
        fields: {
          description: fmt.toNullableString(fields.description),
          summary: fmt.toNullableString(fields.summary),
          molecularProfileId: fields.molecularProfile.id,
          variantOrigin: fields.variantOrigin,
          assertionType: fields.evidenceType,
          significance: fields.significance,
          diseaseId: fmt.toNullableInput(fields.disease[0]?.id),
          assertionDirection: fields.evidenceDirection,
          phenotypeIds: fields.phenotypes.map((p) => p.id),
          therapyIds: fields.therapies.map((d) => d.id),
          therapyInteractionType: fmt.toNullableInput(
            fields.therapyInteractionType
          ),
          ampLevel: fmt.toNullableInput(fields.ampLevel),
          nccnGuidelineId: fmt.toNullableInput(fields.nccnGuideline?.id),
          nccnGuidelineVersion: fmt.toNullableString(
            fields.nccnGuidelineVersion
          ),
          acmgCodeIds: fields.acmgCodes.map((c) => c.id),
          clingenCodeIds: fields.clingenCodes.map((c) => c.id),
          fdaCompanionTest: fmt.toNullableInput(fields.fdaCompanionTest),
          fdaRegulatoryApproval: fmt.toNullableInput(
            fields.fdaRegulatoryApproval
          ),
          evidenceItemIds: fields.evidenceItems.map((e) => e.id),
        },
      }
    }
    return undefined
  }

  toFormModel(fields: RevisableAssertionFieldsFragment): FormModel {
    return {
      fields: {
        id: fields.id,
        description: fields.description,
        summary: fields.summary,
        molecularProfile: fields.molecularProfile,
        variantOrigin: fields.variantOrigin,
        evidenceType: fields.assertionType,
        significance: fields.significance,
        disease: [fields.disease],
        evidenceDirection: fields.assertionDirection,
        phenotypes: fields.phenotypes,
        therapies: fields.therapies,
        therapyInteractionType: fields.therapyInteractionType,
        ampLevel: fields.ampLevel,
        evidenceItems: fields.evidenceItems,
        nccnGuideline: fields.nccnGuideline,
        nccnGuidelineVersion: fields.nccnGuidelineVersion,
        acmgCodes: fields.acmgCodes,
        clingenCodes: fields.clingenCodes,
        fdaCompanionTest: fields.fdaCompanionTest,
        fdaRegulatoryApproval: fields.regulatoryApproval,
        comment: this.formModel?.fields.comment,
        organization: this.formModel?.fields.organization,
      },
    }
  }

  reviseAssertion = (model: FormModel): void => {
    let input = this.toReviseInput(model)
    if (input) {
      let state = this.suggestAssertionRevisionMutator.mutate(
        this.suggestAssertionRevisionGQL,
        {
          input: input,
        },
        {
          refetchQueries: [
            {
              query: this.assertionDetailGQL.document,
              variables: { assertionId: this.assertionId },
            },
            {
              query: this.revisionsGQL.document,
              variables: {
                subject: {
                  id: this.assertionId,
                  entityType: ModeratedEntities.Assertion,
                },
                status: RevisionStatus.New,
              },
            },
          ],
        },
        (data) => {
          if (
            data.suggestAssertionRevision?.results.every(
              (r) => r.newlyCreated == false
            )
          ) {
            this.noNewRevisions = true
            this.success = false
          }
        }
      )

      state.submitSuccess$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
        if (res) {
          this.success = true
        }
      })

      state.submitError$.pipe(takeUntil(this.destroy$)).subscribe((errs) => {
        if (errs) {
          this.errorMessages = errs
          this.success = false
        }
      })

      state.isSubmitting$
        .pipe(takeUntil(this.destroy$))
        .subscribe((loading) => {
          this.loading = loading
        })
    }
  }

  ngAfterViewInit(): void {
    // fetch latest revisable field values, update form fields
    if (this.assertionId) {
      this.revisableFieldsGQL
        .fetch({ assertionId: this.assertionId })
        .subscribe(
          // response
          ({ data: { assertion } }) => {
            if (assertion) {
              this.formModel = this.toFormModel(assertion)
              this.loading = false
            }
          },
          // error
          (error) => {
            console.error('Error retrieving assertion.')
            console.error(error)
          },
          // complete
          () => {
            if (this.formOptions.updateInitialValue) {
              this.formOptions.updateInitialValue()
            }
            // this.formGroup.updateValueAndValidity();
            // prompt fields to display any errors that exist in loaded evidenceItem
            this.formGroup.markAllAsTouched()
            // mark comment field as untouched, we don't want to show an error before the user interacts with the field
            const commentFc: AbstractControl | null =
              this.formGroup.get('fields.comment')
            if (commentFc) {
              commentFc.markAsUntouched()
            }
          }
        )
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}

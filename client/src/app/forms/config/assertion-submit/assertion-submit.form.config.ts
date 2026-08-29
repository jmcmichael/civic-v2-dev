import { assertionSubmitFormInitialModel } from '@app/forms/models/assertion-submit.model'
import { AssertionFields } from '@app/forms/models/assertion-fields.model'
import { CvcFdaCompanionTestCheckboxFieldOptions } from '@app/forms/types/fda-companion-test-checkbox/fda-companion-test-checkbox.type'
import { CvcFdaRegulatoryApprovalCheckboxFieldOptions } from '@app/forms/types/fda-regulatory-approval-checkbox/fda-regulatory-approval-checkbox.type'
import { CvcInteractionSelectFieldOptions } from '@app/forms/types/interaction-select/interaction-select.type'
import { CvcNccnGuidelineSelectFieldOptions } from '@app/forms/types/nccn-guideline-select/nccn-guideline-select.type'
import { CvcNccnGuidelineVersionFieldOptions } from '@app/forms/types/nccn-guideline-version-input/nccn-guideline-version-input.type'
import { CvcOrgSubmitButtonFieldConfig } from '@app/forms/types/org-submit-button/org-submit-button.type'
import { CvcOriginSelectFieldOptions } from '@app/forms/types/origin-select/origin-select.type'
import { CvcPhenotypeSelectFieldOptions } from '@app/forms/types/phenotype-select/phenotype-select.type'
import { CvcTherapySelectFieldOptions } from '@app/forms/types/therapy-select/therapy-select.type'
import { assertionRequiresEvidenceItems } from '@app/forms/utilities/assertion-requires-evidence-items'
import assignFieldConfigDefaultValues from '@app/forms/utilities/assign-field-default-values'
import { CvcFormCardWrapperProps } from '@app/forms/wrappers/form-card/form-card.wrapper'
import { CvcFormLayoutWrapperProps } from '@app/forms/wrappers/form-layout/form-layout.wrapper'
import { FormlyFieldConfig } from '@ngx-formly/core'

const formFieldConfig: FormlyFieldConfig[] = [
  {
    wrappers: ['form-layout'],
    props: <CvcFormLayoutWrapperProps>{
      showDevPanel: false,
    },
    fieldGroup: [
      {
        key: 'clientMutationId',
        props: {
          hidden: true,
        },
      },
      {
        // keyless: groups the card contents without nesting the model
        wrappers: ['form-card'],
        props: <CvcFormCardWrapperProps>{
          formCardOptions: { title: 'New Assertion' },
        },
        fieldGroup: [
          {
            key: 'fields',
            fieldGroup: [
              {
                wrappers: ['row'],
                fieldGroup: [
                  {
                    key: 'molecularProfileId',
                    type: 'molecular-profile-select',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { span: 24 },
                      required: true,
                      watchVariantMolecularProfileId: true,
                    },
                  },
                ],
              },
              {
                wrappers: ['row'],
                fieldGroup: [
                  {
                    key: 'assertionType',
                    type: 'type-select',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { xs: 24, lg: 12, xl: 8, xxl: 6 },
                      required: true,
                    },
                  },
                  {
                    key: 'assertionDirection',
                    type: 'direction-select',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { xs: 24, lg: 12, xl: 8, xxl: 6 },
                      required: true,
                    },
                  },
                  {
                    key: 'significance',
                    type: 'significance-select',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { xs: 24, lg: 12, xl: 8, xxl: 6 },
                      required: true,
                    },
                  },
                  {
                    key: 'diseaseId',
                    type: 'disease-select',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { xs: 24, lg: 12, xl: 8, xxl: 6 },
                    },
                  },
                  <CvcTherapySelectFieldOptions>{
                    key: 'therapyIds',
                    type: 'therapy-multi-select',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { xs: 24, lg: 12, xl: 8, xxl: 6 },
                    },
                  },
                  <CvcInteractionSelectFieldOptions>{
                    key: 'therapyInteractionType',
                    type: 'interaction-select',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { xs: 24, lg: 12, xl: 8, xxl: 6 },
                    },
                  },
                  <CvcOriginSelectFieldOptions>{
                    key: 'variantOrigin',
                    type: 'origin-select',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { xs: 24, lg: 12, xl: 8, xxl: 6 },
                      required: true,
                    },
                  },
                  <CvcPhenotypeSelectFieldOptions>{
                    key: 'phenotypeIds',
                    type: 'phenotype-multi-select',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { xs: 24, lg: 12, xl: 8, xxl: 6 },
                    },
                  },
                  {
                    key: 'ampLevel',
                    type: 'amp-category-select',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { xs: 24, lg: 12, xl: 8, xxl: 6 },
                      colSpan: 8,
                    },
                  },
                  {
                    key: 'acmgCodeIds',
                    type: 'acmg-code-multi-select',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { xs: 24, lg: 12, xl: 8, xxl: 6 },
                      colSpan: 8,
                    },
                  },
                  {
                    key: 'clingenCodeIds',
                    type: 'clingen-code-multi-select',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { xs: 24, lg: 12, xl: 8, xxl: 6 },
                      colSpan: 8,
                    },
                  },
                ],
              },
              {
                wrappers: ['row'],
                fieldGroup: [
                  <CvcNccnGuidelineSelectFieldOptions>{
                    key: 'nccnGuidelineId',
                    type: 'nccn-guideline-select',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { xs: 24, lg: 12, xl: 12, xxl: 6 },
                    },
                  },
                  <CvcNccnGuidelineVersionFieldOptions>{
                    key: 'nccnGuidelineVersion',
                    type: 'nccn-guideline-version-input',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { xs: 24, lg: 12, xl: 12, xxl: 6 },
                    },
                  },
                  <CvcFdaRegulatoryApprovalCheckboxFieldOptions>{
                    key: 'fdaRegulatoryApproval',
                    type: 'fda-regulatory-approval-checkbox',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { xs: 24, lg: 12, xl: 12, xxl: 6 },
                    },
                  },
                  <CvcFdaCompanionTestCheckboxFieldOptions>{
                    key: 'fdaCompanionTest',
                    type: 'fda-companion-test-checkbox',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { xs: 24, lg: 12, xl: 12, xxl: 6 },
                    },
                  },
                ],
              },
              {
                wrappers: ['row'],
                fieldGroup: [
                  {
                    key: 'evidenceItemIds',
                    type: 'evidence-multi-select',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { xs: 24 },
                      required: true,
                      isMultiSelect: true,
                    },
                    expressions: {
                      'props.required': (field: FormlyFieldConfig) =>
                        assertionRequiresEvidenceItems(
                          field.model as AssertionFields
                        ),
                    },
                  },
                  {
                    key: 'summary',
                    type: 'textarea',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { md: 24, lg: 8 },
                      tooltip: 'A short, one sentence summary of the Assertion',
                      placeholder: 'Enter an Assertion Summary',
                      label: 'Assertion Summary',
                      required: true,
                    },
                  },
                  {
                    key: 'description',
                    type: 'base-textarea',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { md: 24, lg: 16 },
                      tooltip:
                        'A complete, original description of this Assertion. Limited to one paragraph. Reference other CIViC entities using curies, e.g., civic.eid:123 (Evidence Item) or civic.aid:123 (Assertion).',
                      placeholder: 'Enter an Assertion Statement',
                      label: 'Assertion Statement',
                      required: true,
                      rows: 5,
                    },
                  },
                ],
              },
            ],
          },
          {
            wrappers: ['row'],
            fieldGroup: [
              {
                key: 'comment',
                type: 'base-textarea',
                wrappers: ['col', 'form-field'],
                props: {
                  col: { span: 24 },
                  label: 'Comment',
                  required: true,
                },
              },
            ],
          },
          {
            wrappers: ['row'],
            props: { formFooter: true },
            fieldGroup: [
              {
                type: 'cvc-cancel-button',
                wrappers: ['col'],
                props: { col: { flex: 'none' } },
              },
              <CvcOrgSubmitButtonFieldConfig>{
                key: 'organizationId',
                type: 'org-submit-button',
                wrappers: ['col'],
                props: {
                  col: { flex: 'auto' },
                  submitLabel: 'Submit Assertion',
                  align: 'right',
                },
              },
            ],
          },
        ],
      },
    ],
  },
]

export const assertionSubmitFields: FormlyFieldConfig[] =
  assignFieldConfigDefaultValues(
    formFieldConfig,
    assertionSubmitFormInitialModel
  )

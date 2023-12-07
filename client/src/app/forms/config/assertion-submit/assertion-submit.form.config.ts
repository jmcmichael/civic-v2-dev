import { assertionSubmitFormInitialModel } from '@app/forms/models/assertion-submit.model'
import { CvcFdaCompanionTestCheckboxFieldOptions } from '@app/forms/types/fda-companion-test-checkbox/fda-companion-test-checkbox.type'
import { CvcFdaRegulatoryApprovalCheckboxFieldOptions } from '@app/forms/types/fda-regulatory-approval-checkbox/fda-regulatory-approval-checkbox.type'
import { CvcInteractionSelectFieldOptions } from '@app/forms/types/interaction-select/interaction-select.type'
import { CvcNccnGuidelineSelectFieldOptions } from '@app/forms/types/nccn-guideline-select/nccn-guideline-select.type'
import { CvcNccnGuidelineVersionFieldOptions } from '@app/forms/types/nccn-guideline-version-input/nccn-guideline-version-input.type'
import { CvcOrgSubmitButtonFieldConfig } from '@app/forms/types/org-submit-button/org-submit-button.type'
import { CvcOriginSelectFieldOptions } from '@app/forms/types/origin-select/origin-select.type'
import { CvcPhenotypeSelectFieldOptions } from '@app/forms/types/phenotype-select/phenotype-select.type'
import { CvcTherapySelectFieldOptions } from '@app/forms/types/therapy-select/therapy-select.type'
import assignFieldConfigDefaultValues from '@app/forms/utilities/assign-field-default-values'
import { CvcFormCardWrapperProps } from '@app/forms/wrappers/form-card/form-card.wrapper'
import { CvcFormLayoutWrapperProps } from '@app/forms/wrappers/form-layout/form-layout.wrapper'
import { CvcFormRowWrapperProps } from '@app/forms/wrappers/form-row/form-row.wrapper'
import { FormlyFieldConfig } from '@ngx-formly/core'

const formFieldConfig: FormlyFieldConfig[] = [
  {
    wrappers: ['form-layout'],
    props: <CvcFormLayoutWrapperProps>{
      showDevPanel: true,
    },
    fieldGroup: [
      {
        key: 'clientMutationId',
        props: {
          hidden: true,
        },
      },
      {
        key: 'fields',
        wrappers: ['form-card'],
        props: <CvcFormCardWrapperProps>{
          formCardOptions: { title: 'New Assertion' },
        },
        fieldGroup: [
          {
            wrappers: ['form-row'],
            props: <CvcFormRowWrapperProps>{
              formRowOptions: {
                // molecular profile full-width at all breakpoints
                span: 24,
              },
            },
            fieldGroup: [
              {
                key: 'molecularProfileId',
                type: 'molecular-profile-select',
                props: {
                  required: true,
                  watchVariantMolecularProfileId: true,
                },
              },
            ],
          },
          {
            wrappers: ['form-row'],
            props: <CvcFormRowWrapperProps>{
              formRowOptions: {
                // fields full width at sm, md breakpoints
                // two across at lg
                // three across at xl
                // four across at xxl
                responsive: { xs: 24, lg: 12, xl: 8, xxl: 6 },
              },
            },
            fieldGroup: [
              {
                key: 'assertionType',
                type: 'type-select',
                props: {
                  required: true,
                },
              },
              {
                key: 'assertionDirection',
                type: 'direction-select',
                props: {
                  required: true,
                },
              },
              {
                key: 'significance',
                type: 'significance-select',
                props: {
                  required: true,
                },
              },
              {
                key: 'diseaseId',
                type: 'disease-select',
              },
              <CvcTherapySelectFieldOptions>{
                key: 'therapyIds',
                type: 'therapy-multi-select',
              },
              <CvcInteractionSelectFieldOptions>{
                key: 'therapyInteractionType',
                type: 'interaction-select',
              },
              <CvcOriginSelectFieldOptions>{
                key: 'variantOrigin',
                type: 'origin-select',
                props: {
                  required: true,
                },
              },
              <CvcPhenotypeSelectFieldOptions>{
                key: 'phenotypeIds',
                type: 'phenotype-multi-select',
              },
              {
                key: 'ampLevel',
                type: 'amp-category-select',
              },
              {
                key: 'acmgCodeIds',
                type: 'acmg-code-multi-select',
              },
              {
                key: 'clingenCodeIds',
                type: 'clingen-code-multi-select',
              },
              <CvcNccnGuidelineSelectFieldOptions>{
                key: 'nccnGuidelineId',
                type: 'nccn-guideline-select',
              },
              <CvcNccnGuidelineVersionFieldOptions>{
                key: 'nccnGuidelineVersion',
                type: 'nccn-guideline-version-input',
              },
              <CvcFdaRegulatoryApprovalCheckboxFieldOptions>{
                key: 'fdaRegulatoryApproval',
                type: 'fda-regulatory-approval-checkbox',
              },
              <CvcFdaCompanionTestCheckboxFieldOptions>{
                key: 'fdaCompanionTest',
                type: 'fda-companion-test-checkbox',
              },
            ],
          },
          {
            wrappers: ['form-row'],
            props: <CvcFormRowWrapperProps>{
              formRowOptions: {
                responsiveIndexed: [
                  // evidence-multi-select full width at all breakpoints
                  {
                    xs: 24,
                  },
                  // summary full width up to lg breakpoint,
                  // 1/3 width at lg and above
                  {
                    md: 24,
                    lg: 8,
                  },
                  // description full width up to lg breakpoint,
                  // 2/3 width at lg and above
                  {
                    md: 24,
                    lg: 16,
                  },
                ],
              },
            },
            fieldGroup: [
              {
                key: 'evidenceItemIds',
                type: 'evidence-multi-select',
                props: {
                  required: true,
                  isMultiSelect: true,
                },
              },
              {
                key: 'summary',
                type: 'textarea',
                wrappers: ['form-field'],
                props: {
                  tooltip: 'A short, one sentence summary of the Assertion',
                  placeholder: 'Enter an Assertion Summary',
                  label: 'Assertion Summary',
                  required: true,
                },
              },
              {
                key: 'description',
                type: 'base-textarea',
                wrappers: ['form-field'],
                props: {
                  tooltip:
                    'A complete, original description of this Assertion. Limited to one paragraph.',
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
        wrappers: ['form-row'],
        props: <CvcFormRowWrapperProps>{
          formRowOptions: {
            // comment full width at all breakpoint
            // cancel, submit buttons 1/2 width at all breakpoints
            spanIndexed: [24, 12, 12],
          },
        },
        fieldGroup: [
          {
            key: 'comment',
            type: 'base-textarea',
            props: {
              label: 'Comment',
              required: true,
            },
          },
          {
            type: 'cvc-cancel-button',
          },
          <CvcOrgSubmitButtonFieldConfig>{
            key: 'organizationId',
            type: 'org-submit-button',
            props: {
              submitLabel: 'Submit Assertion',
              align: 'right',
            },
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

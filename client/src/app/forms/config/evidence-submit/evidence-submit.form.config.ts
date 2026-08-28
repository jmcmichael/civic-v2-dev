import { evidenceSubmitFormInitialModel } from '@app/forms/models/evidence-submit.model'
import { CvcDirectionSelectFieldOptions } from '@app/forms/types/direction-select/direction-select.type'
import { CvcDiseaseSelectFieldOptions } from '@app/forms/types/disease-select/disease-select.type'
import { CvcInteractionSelectFieldOptions } from '@app/forms/types/interaction-select/interaction-select.type'
import { CvcLevelSelectFieldOptions } from '@app/forms/types/level-select/level-select.type'
import { CvcMolecularProfileSelectFieldConfig } from '@app/forms/types/molecular-profile-select/molecular-profile-select.type'
import { CvcOrgSubmitButtonFieldConfig } from '@app/forms/types/org-submit-button/org-submit-button.type'
import { CvcOriginSelectFieldOptions } from '@app/forms/types/origin-select/origin-select.type'
import { CvcPhenotypeSelectFieldOptions } from '@app/forms/types/phenotype-select/phenotype-select.type'
import { CvcRatingFieldOptions } from '@app/forms/types/rating/rating.type'
import { CvcSignificanceSelectFieldOptions } from '@app/forms/types/significance-select/significance-select.type'
import {
  CvcSourceSelectFieldConfig,
  CvcSourceSelectFieldOptions,
} from '@app/forms/types/source-select/source-select.type'
import { CvcTherapySelectFieldOptions } from '@app/forms/types/therapy-select/therapy-select.type'
import { CvcEntityTypeSelectFieldConfig } from '@app/forms/types/type-select/type-select.type'
import assignFieldConfigDefaultValues from '@app/forms/utilities/assign-field-default-values'
import { CvcFormCardWrapperProps } from '@app/forms/wrappers/form-card/form-card.wrapper'
import { CvcFormLayoutWrapperProps } from '@app/forms/wrappers/form-layout/form-layout.wrapper'
import { FormlyFieldConfig } from '@ngx-formly/core'

const formFieldConfig: FormlyFieldConfig[] = [
  {
    // form-layout contains the form itself and and a hideable dev panel
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
          formCardOptions: { title: 'New Evidence Item' },
          formInstructions:
            'Provide the source and clinical details supporting this evidence, then submit for editor review. Required fields must be complete before the form can be submitted — the Field States legend above tracks each field as you work.',
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
                      tooltip:
                        'A single variant (Simple Molecular Profile) or a combination of variants (Complex Molecular Profile) relevant to the curated evidence.',
                      watchVariantMolecularProfileId: true,
                    },
                  },
                  <CvcSourceSelectFieldConfig>{
                    key: 'sourceId',
                    type: 'source-select',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { span: 24 },
                      required: true,
                    },
                  },
                ],
              },
              {
                wrappers: ['row'],
                fieldGroup: [
                  <CvcEntityTypeSelectFieldConfig>{
                    key: 'evidenceType',
                    type: 'type-select',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { xs: 24, lg: 12, xl: 8, xxl: 6 },
                      required: true,
                    },
                  },
                  <CvcDirectionSelectFieldOptions>{
                    key: 'evidenceDirection',
                    type: 'direction-select',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { xs: 24, lg: 12, xl: 8, xxl: 6 },
                      required: true,
                    },
                  },
                  <CvcSignificanceSelectFieldOptions>{
                    key: 'significance',
                    type: 'significance-select',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { xs: 24, lg: 12, xl: 8, xxl: 6 },
                      required: true,
                    },
                  },
                  <CvcDiseaseSelectFieldOptions>{
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
                  <CvcLevelSelectFieldOptions>{
                    key: 'evidenceLevel',
                    type: 'level-select',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { xs: 24, lg: 12, xl: 8, xxl: 6 },
                      required: true,
                    },
                  },
                  <CvcRatingFieldOptions>{
                    key: 'rating',
                    type: 'rating',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { xs: 24, lg: 12, xl: 8, xxl: 6 },
                      required: true,
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
                ],
              },
              {
                wrappers: ['row'],
                fieldGroup: [
                  {
                    key: 'description',
                    type: 'base-textarea',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { span: 24 },
                      tooltip:
                        'Your original description of evidence from published literature detailing the association or lack of association between a variant and its predictive, prognostic, diagnostic, predisposing, functional or oncogenic value. Reference other CIViC entities using curies, e.g., civic.eid:123 (Evidence Item) or civic.aid:123 (Assertion).',
                      placeholder: 'Enter an Evidence Statement',
                      description:
                        'Data constituting personal or identifying information should not be entered (e.g. <a href="https://www.hipaajournal.com/what-is-protected-health-information/" target="_blank">protected health information (PHI) as defined by HIPAA</a> in the U.S. and/or comparable laws in your jurisdiction).',
                      label: 'Evidence Statement',
                      required: true,
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
                  required: false,
                  minLength: 10,
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
                props: { col: { flex: 'none' }, size: 'large' },
              },
              <CvcOrgSubmitButtonFieldConfig>{
                key: 'organizationId',
                type: 'org-submit-button',
                wrappers: ['col'],
                props: {
                  col: { flex: 'auto' },
                  submitLabel: 'Submit Evidence Item',
                  align: 'right',
                  size: 'large',
                },
              },
            ],
          },
        ],
      },
    ],
  },
]
export const evidenceSubmitFields: FormlyFieldConfig[] =
  assignFieldConfigDefaultValues(
    formFieldConfig,
    evidenceSubmitFormInitialModel
  )

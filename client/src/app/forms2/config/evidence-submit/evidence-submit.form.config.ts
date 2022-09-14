import { evidenceSubmitFormInitialModel } from '@app/forms2/models/evidence-submit.model'
import { CvcBaseInputFieldConfig } from '@app/forms2/types/base-input/base-input.component'
import { CvcClinicalSignificanceSelectFieldConfig } from '@app/forms2/types/clinical-significance-select/clinical-significance-select.type'
import { CvcEvidenceDirectionSelectFieldConfig } from '@app/forms2/types/evidence-direction-select/evidence-direction-select.type'
import { CvcEvidenceTypeSelectFieldConfig } from '@app/forms2/types/evidence-type-select/evidence-type-select.type'
import { CvcGeneSelectFieldConfig } from '@app/forms2/types/gene-select/gene-select.type'
import { CvcRepeatFieldConfig } from '@app/forms2/types/repeat-field/repeat-field.type'
import { CvcVariantSelectFieldConfig } from '@app/forms2/types/variant-select/variant-select.type'
import assignFieldConfigDefaultValues from '@app/forms2/utilities/assign-field-default-values'
import { CvcFieldsLayoutWrapperProps } from '@app/forms2/wrappers/fields-layout/fields-layout.wrapper'
import { CvcFormLayoutWrapperProps } from '@app/forms2/wrappers/form-layout/form-layout.wrapper'
import { FormlyFieldConfig } from '@ngx-formly/core'

const formFieldConfig: FormlyFieldConfig[] = [
  {
    wrappers: ['form-layout'],
    props: <CvcFormLayoutWrapperProps>{
      submitLabel: 'Submit Evidence Item',
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
        wrappers: ['fields-layout'],
        props: <CvcFieldsLayoutWrapperProps>{
          title: 'New Evidence Item',
        },
        fieldGroup: [
          // <CvcGeneSelectFieldConfig>{
          //   key: 'geneId',
          //   type: 'gene-select',
          //   props: {
          //     required: true,
          //   },
          // },
          // <CvcRepeatFieldConfig>{
          //   key: 'geneIds',
          //   type: 'repeat-field',
          //   props: {
          //     label: 'Genes',
          //   },
          //   fieldArray: <CvcGeneSelectFieldConfig>{
          //     type: 'gene-select-item',
          //     props: {},
          //   },
          // },
          <CvcBaseInputFieldConfig>{
            key: 'version',
            type: 'base-input',
            props: { label: 'Version' },
          },
          <CvcRepeatFieldConfig>{
            key: 'aliases',
            type: 'repeat-field',
            props: {
              label: 'Aliases',
            },
            fieldArray: <CvcBaseInputFieldConfig>{
              type: 'base-input-item',
              props: {},
            },
          },
          // <CvcVariantSelectFieldConfig>{
          //   key: 'variantId',
          //   type: 'variant-select',
          //   props: {
          //     required: true,
          //   },
          // },
          // <CvcEvidenceTypeSelectFieldConfig>{
          //   key: 'evidenceType',
          //   type: 'evidence-type-select',
          //   props: {
          //     required: true,
          //   },
          // },
          // <CvcEvidenceDirectionSelectFieldConfig>{
          //   key: 'evidenceDirection',
          //   type: 'evidence-direction-select',
          //   props: {
          //     required: true,
          //   },
          // },
          // <CvcClinicalSignificanceSelectFieldConfig>{
          //   key: 'clinicalSignficance',
          //   type: 'clinical-significance-select',
          //   props: {
          //     required: true,
          //   },
          // },
          // <CvcRepeatFieldConfig>{
          //   key: 'geneIds',
          //   type: 'repeat-field',
          //   props: {
          //     label: 'Genes',
          //   },
          //   fieldArray: <CvcGeneSelectFieldConfig>{
          //     type: 'gene-select-item',
          //     props: {},
          //   },
          // },
          // <CvcRepeatFieldConfig>{
          //   key: 'variantIds',
          //   type: 'repeat-field',
          //   props: {
          //     label: 'Variants',
          //   },
          //   fieldArray: <CvcVariantSelectFieldConfig>{
          //     type: 'variant-select-item',
          //     props: {},
          //   },
          // },
        ],
      },
      {
        wrappers: ['form-footer'],
        fieldGroup: [
          {
            key: 'comment',
            type: 'textarea',
            props: {
              label: 'Comment',
              // required: true,
            },
          },
          {
            key: 'organizationId',
            type: 'org-submit-button',
            props: {
              submitLabel: 'Submit Evidence Item',
            },
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

import { evidenceSubmitFormInitialModel } from '@app/forms2/models/evidence-submit.model'
import { CvcDirectionSelectFieldOptions } from '@app/forms2/types/direction-select/direction-select.type'
import { CvcDrugSelectFieldOptions } from '@app/forms2/types/drug-select/drug-select.type'
import { CvcGeneSelectFieldConfig } from '@app/forms2/types/gene-select/gene-select.type'
import { CvcSignificanceSelectFieldConfig } from '@app/forms2/types/significance-select/significance-select.type'
// import { CvcBaseInputFieldConfig } from '@app/forms2/types/base-input/base-input.type'
// import { CvcEntitySignificanceSelectFieldConfig } from '@app/forms2/types/significance-select/significance-select.type'
// import { CvcEvidenceDirectionSelectFieldConfig } from '@app/forms2/types/direction-select/direction-select.type'
import { CvcEntityTypeSelectFieldConfig } from '@app/forms2/types/type-select/type-select.type'
import { CvcVariantSelectFieldOptions } from '@app/forms2/types/variant-select/variant-select.type'
// import { CvcRepeatFieldConfig } from '@app/forms2/types/repeat-field/repeat-field.type'
// import { CvcVariantSelectFieldConfig } from '@app/forms2/types/variant-select/variant-select.type'
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
          <CvcGeneSelectFieldConfig>{
            key: 'geneId',
            type: 'gene-select',
            props: {
              required: true,
            },
          },
          <CvcVariantSelectFieldOptions>{
            key: 'variantId',
            type: 'variant-select',
            props: {
              required: true,
              // requireGene: false
            },
          },
          <CvcEntityTypeSelectFieldConfig>{
            key: 'evidenceType',
            type: 'type-select',
            props: {
              required: true,
            },
          },
          <CvcSignificanceSelectFieldConfig>{
            key: 'clinicalSignificance',
            type: 'significance-select',
            props: {
              required: true,
            },
          },
          <CvcDrugSelectFieldOptions>{
            key: 'drugId',
            type: 'drug-select',
            props: {
              required: true,
            },
          },
          <CvcDirectionSelectFieldOptions>{
            key: 'evidenceDirection',
            type: 'direction-select',
            props: {
              required: true,
            },
          },
          // <CvcDrugSelectFieldConfig>{
          //   key: 'drugIds',
          //   type: 'drug-multi-select',
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
          // <CvcRepeatFieldConfig>{
          //   key: 'drugIds',
          //   type: 'repeat-field',
          //   props: {
          //     label: 'Drugs',
          //   },
          //   fieldArray: <CvcDrugSelectFieldConfig>{
          //     type: 'drug-select-item',
          //     props: {},
          //   },
          // },
          // <CvcBaseInputFieldConfig>{
          //   key: 'version',
          //   type: 'base-input',
          //   props: { label: 'Version' },
          // },
          // <CvcRepeatFieldConfig>{
          //   key: 'aliases',
          //   type: 'repeat-field',
          //   props: {
          //     label: 'Aliases',
          //   },
          //   fieldArray: <CvcBaseInputFieldConfig>{
          //     type: 'base-input-item',
          //     props: {},
          //   },
          // },
          // <CvcEntitySignificanceSelectFieldConfig>{
          //   key: 'clinicalSignficance',
          //   type: 'significance-select',
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

import { assertionSubmitFormInitialModel } from '@app/forms2/models/assertion-submit.model'
import { CvcDrugSelectFieldConfig } from '@app/forms2/types/drug-select/drug-select.type'
import { CvcEntitySignificanceSelectFieldConfig } from '@app/forms2/types/entity-significance-select/entity-significance-select.type'
import { CvcEntityTypeSelectFieldConfig } from '@app/forms2/types/entity-type-select/entity-type-select.type'
import { CvcGeneSelectFieldConfig } from '@app/forms2/types/gene-select/gene-select.type'
import { CvcOrgSubmitButtonFieldConfig } from '@app/forms2/types/org-submit-button/org-submit-button.type'
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
      submitLabel: 'Submit Assertion',
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
          title: 'New Assertion',
        },
        fieldGroup: [
          <CvcGeneSelectFieldConfig>{
            key: 'geneId',
            type: 'gene-select',
            props: {
              required: true,
            },
          },

          <CvcVariantSelectFieldConfig>{
            key: 'variantId',
            type: 'variant-select',
            props: {
              required: true,
            },
          },

          <CvcEntityTypeSelectFieldConfig>{
            key: 'assertionType',
            type: 'entity-type-select',
            props: {
              required: true,
            },
          },
          <CvcDrugSelectFieldConfig>{
            key: 'drugId',
            type: 'drug-select',
            props: {
              required: true,
            },
          },
          <CvcDrugSelectFieldConfig>{
            key: 'drugIds',
            type: 'drug-select-array',
            props: {
              required: true,
            },
          },
          // <CvcEntityTypeSelectFieldConfig>{
          //   key: 'assertionType',
          //   type: 'entity-type-select',
          //   props: {
          //     required: true,
          //   },
          // },
          // <CvcEntitySignificanceSelectFieldConfig>{
          //   key: 'clinicalSignficance',
          //   type: 'entity-significance-select',
          //   props: {
          //     required: true,
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
          <CvcOrgSubmitButtonFieldConfig>{
            key: 'organizationId',
            type: 'org-submit-button',
            props: {
              submitLabel: 'Submit Assertion',
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

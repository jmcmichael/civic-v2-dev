import { factorVariantReviseFormInitialModel } from '@app/forms/models/factor-variant-revise.model'
import assignFieldConfigDefaultValues from '@app/forms/utilities/assign-field-default-values'
import { CvcFormCardWrapperProps } from '@app/forms/wrappers/form-card/form-card.wrapper'
import { CvcFormLayoutWrapperProps } from '@app/forms/wrappers/form-layout/form-layout.wrapper'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { CvcOrgSubmitButtonFieldConfig } from '@app/forms/types/org-submit-button/org-submit-button.type'
import { FeatureInstanceTypes } from '@app/generated/civic.apollo.types'

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
          formCardOptions: { title: 'Revise Variant' },
        },
        fieldGroup: [
          {
            key: 'fields',
            fieldGroup: [
              {
                wrappers: ['row'],
                fieldGroup: [
                  {
                    key: 'featureId',
                    type: 'feature-select',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { xs: 24, md: 12, lg: 8 },
                      description: 'Enter a Factor for this Variant',
                      required: true,
                      featureType: FeatureInstanceTypes.Factor,
                      canChangeFeatureType: false,
                    },
                  },
                  {
                    key: 'name',
                    type: 'base-input',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { xs: 24, md: 12, lg: 8 },
                      placeholder: 'Enter a name for this Variant',
                      description:
                        "Enter the name of the Variant according to the <a href='https://civic.readthedocs.io/en/latest/model/variants/name.html#curating-variant-names' target='blank'>Variant Curation SOP</a>",
                      label: 'Name',
                      required: true,
                      rows: 1,
                    },
                  },
                  {
                    key: 'aliases',
                    type: 'tag-multi-input',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { xs: 24, lg: 8 },
                      label: 'Aliases',
                      description:
                        'List any aliases commonly used to refer to this Variant',
                      placeholder: 'Enter Alias and hit return',
                    },
                  },
                ],
              },
              {
                wrappers: ['row'],
                fieldGroup: [
                  {
                    key: 'variantTypeIds',
                    type: 'variant-type-multi-select',
                    wrappers: ['col', 'form-field'],
                    props: { col: { xs: 24, lg: 12, xl: 6, xxl: 8 } },
                  },
                  {
                    key: 'ncitId',
                    type: 'base-input',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { xs: 24, lg: 12, xl: 6, xxl: 8 },
                      placeholder: 'NCI Thesaurus Code',
                      description:
                        'Enter the NCI Thesaurus Code for this Factor Variant',
                      label: 'NCI Thesaurus Code',
                      required: false,
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
                  placeholder:
                    'Please enter a comment describing your revisions.',
                  required: true,
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
                props: { col: { flex: 'none' } },
              },
              <CvcOrgSubmitButtonFieldConfig>{
                key: 'organizationId',
                type: 'org-submit-button',
                wrappers: ['col'],
                props: {
                  col: { flex: 'auto' },
                  submitLabel: 'Submit Variant Revisions',
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
export const factorVariantReviseFields: FormlyFieldConfig[] =
  assignFieldConfigDefaultValues(
    formFieldConfig,
    factorVariantReviseFormInitialModel
  )

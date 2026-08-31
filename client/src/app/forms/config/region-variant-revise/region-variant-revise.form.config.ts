import { withMessages } from '@app/forms/messages/field-messages'
import { regionVariantReviseFormInitialModel } from '@app/forms/models/region-variant-revise.model'
import assignFieldConfigDefaultValues from '@app/forms/utilities/assign-field-default-values'
import { formTitle } from '@app/forms/messages/form-titles'
import { CvcFormCardWrapperProps } from '@app/forms/wrappers/form-card/form-card.wrapper'
import { CvcFormLayoutWrapperProps } from '@app/forms/wrappers/form-layout/form-layout.wrapper'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { CvcOrgSubmitButtonFieldConfig } from '@app/forms/types/org-submit-button/org-submit-button.type'

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
          formTitle: formTitle('Revise', 'Variant'),
        },
        fieldGroup: [
          {
            key: 'fields',
            fieldGroup: [
              {
                wrappers: ['row'],
                fieldGroup: [
                  {
                    key: 'aliases',
                    type: 'tag-multi-input',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { xs: 24, md: 12, lg: 12 },
                      label: 'Aliases',
                      description:
                        'List any aliases commonly used to refer to this Variant',
                      placeholder: 'Enter Alias and hit return',
                    },
                  },
                  {
                    key: 'variantTypeIds',
                    type: 'variant-type-multi-select',
                    wrappers: ['col', 'form-field'],
                    props: { col: { xs: 24, md: 12, lg: 12 } },
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
                  ...withMessages('reviseComment'),
                  placeholder:
                    'Please enter a comment describing your revisions.',
                  required: true,
                  minLength: 10,
                },
              },
            ],
          },
          {
            wrappers: ['form-actions-row'],
            props: { formFooter: true },
            fieldGroup: [
              {
                type: 'cvc-cancel-button',
                wrappers: ['col'],
                props: { col: { flex: 'none' } },
              },
              {
                type: 'cvc-form-notifications',
                wrappers: ['col'],
                props: { col: { flex: 'auto' } },
              },
              <CvcOrgSubmitButtonFieldConfig>{
                key: 'organizationId',
                type: 'org-submit-button',
                wrappers: ['col'],
                props: {
                  col: { flex: 'none' },
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
export const regionVariantReviseFields: FormlyFieldConfig[] =
  assignFieldConfigDefaultValues(
    formFieldConfig,
    regionVariantReviseFormInitialModel
  )

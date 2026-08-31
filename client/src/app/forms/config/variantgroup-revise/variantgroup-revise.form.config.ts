import { withMessages } from '@app/forms/messages/field-messages'
import { formTitle } from '@app/forms/messages/form-titles'
import { FormlyFieldConfig } from '@ngx-formly/core'

const formFieldConfig: FormlyFieldConfig[] = [
  {
    wrappers: ['form-layout'],
    props: {
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
        props: {
          formTitle: formTitle('Revise', 'VariantGroup'),
        },
        fieldGroup: [
          {
            key: 'fields',
            fieldGroup: [
              {
                key: 'name',
                type: 'base-input',
                props: {
                  label: 'Variant Group Name',
                  required: true,
                },
              },
              {
                key: 'description',
                type: 'base-textarea',
                props: {
                  tooltip:
                    'User-defined summary of the clinical relevance of this Variant Group.',
                  placeholder: 'Enter a Variant Group Summary',
                  label: 'Variant Group Summary',
                  required: true,
                  rows: 5,
                },
              },
              {
                key: 'sourceIds',
                type: 'source-multi-select',
                wrappers: ['form-field'],
                props: { required: false },
              },
              {
                key: 'variantIds',
                type: 'variant-multi-select',
                props: {
                  label: 'Variants',
                  required: true,
                  requireFeature: false,
                  showManagerBtn: true,
                },
              },
            ],
          },
          {
            wrappers: ['row'],
            fieldGroup: [
              {
                key: 'comment',
                type: 'textarea',
                wrappers: ['col', 'form-field'],
                props: {
                  col: { span: 24 },
                  label: 'Comment',
                  ...withMessages('reviseComment'),
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
              {
                key: 'organizationId',
                type: 'org-submit-button',
                wrappers: ['col'],
                props: {
                  col: { flex: 'auto' },
                  submitLabel: 'Submit Variant Group Revision',
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

export const variantgroupSuggestFields: FormlyFieldConfig[] = formFieldConfig

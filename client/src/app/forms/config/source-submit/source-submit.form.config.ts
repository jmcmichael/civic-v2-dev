import { FormlyFieldConfig } from '@ngx-formly/core'
import { CvcInteractionSelectFieldOptions } from '@app/forms/types/interaction-select/interaction-select.type'

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
      // form-card wraps the form fields in a card, providing a place to put a title, and other controls e.g. form options, status
      {
        // keyless: groups the card contents without nesting the model
        wrappers: ['form-card'],
        props: {
          formCardOptions: { title: 'Submit Source Suggestion' },
        },
        fieldGroup: [
          {
            key: 'fields',
            fieldGroup: [
              {
                key: 'molecularProfileId',
                type: 'molecular-profile-select',
                props: {
                  required: false,
                  description:
                    'Select a Molecular Profile for this Source Suggestion, if applicable.',
                  watchVariantMolecularProfileId: true,
                },
              },
              {
                key: 'diseaseId',
                type: 'disease-select',
                props: {},
              },
              {
                key: 'therapyIds',
                type: 'therapy-multi-select',
                props: {
                  required: false,
                  requireType: false,
                  description:
                    'Select one or more Therapies for this Source Suggestion, if applicable.',
                },
              },
              <CvcInteractionSelectFieldOptions>{
                key: 'therapyInteractionType',
                type: 'interaction-select',
                props: {},
              },
              {
                key: 'sourceId',
                type: 'source-select',
                wrappers: ['form-field'],
                props: { required: true },
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
              {
                key: 'organizationId',
                type: 'org-submit-button',
                wrappers: ['col'],
                props: {
                  col: { flex: 'auto' },
                  submitLabel: 'Submit Source Suggestion',
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

export const sourceSuggestFields: FormlyFieldConfig[] = formFieldConfig

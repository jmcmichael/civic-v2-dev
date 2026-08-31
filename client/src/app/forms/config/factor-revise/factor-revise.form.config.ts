import { withMessages } from '@app/forms/messages/field-messages'
import { factorReviseFormInitialModel } from '@app/forms/models/factor-revise.model'
import assignFieldConfigDefaultValues from '@app/forms/utilities/assign-field-default-values'
import { formTitle } from '@app/forms/messages/form-titles'
import { CvcFormCardWrapperProps } from '@app/forms/wrappers/form-card/form-card.wrapper'
import { CvcFormLayoutWrapperProps } from '@app/forms/wrappers/form-layout/form-layout.wrapper'
import { FormlyFieldConfig } from '@ngx-formly/core'

const formFieldConfig: FormlyFieldConfig[] = [
  // form-layout wrapper embeds the form in an nz-grid row, allowing the form to be placed adjacent to other controls or page elements. Currently, it provides a toggleable dev panel. Could be used to add a preview of the entity being added/edited, or more extensive feedback like lists of similar entities, etc.
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
      // form-card wraps the form fields in a card, providing a place to put a title, and other controls e.g. form options, status
      {
        // keyless: groups the card contents without nesting the model
        wrappers: ['form-card'],
        props: <CvcFormCardWrapperProps>{
          formTitle: formTitle('Revise', 'Factor'),
        },
        fieldGroup: [
          {
            key: 'fields',
            fieldGroup: [
              {
                wrappers: ['row'],
                fieldGroup: [
                  {
                    key: 'name',
                    type: 'base-input',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { span: 24 },
                      placeholder: 'Enter a name for this Factor',
                      description: 'Enter the name of the Factor',
                      label: 'Name',
                      required: true,
                    },
                  },
                  {
                    key: 'fullName',
                    type: 'base-input',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { span: 24 },
                      placeholder: 'Enter a full name for this Factor',
                      description:
                        'Enter a full or long-form name of the Factor if applicable',
                      label: 'Full Name',
                      required: false,
                    },
                  },
                  {
                    key: 'ncitId',
                    type: 'base-input',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { span: 24 },
                      placeholder: 'NCI Thesaurus Code',
                      description:
                        'Enter the NCI Thesaurus Code for this Factor',
                      label: 'NCI Thesaurus Code',
                      required: false,
                    },
                  },
                  {
                    key: 'aliases',
                    type: 'tag-multi-input',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { span: 24 },
                      label: 'Aliases',
                      description:
                        'List any aliases commonly used to refer to this Factor',
                      placeholder: 'Enter Alias and hit return',
                    },
                  },
                  {
                    key: 'description',
                    type: 'base-textarea',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { span: 24 },
                      tooltip:
                        'User-defined summary of the clinical relevance of this Factor.',
                      placeholder: 'Enter a Factor Summary',
                      label: 'Summary',
                      required: false,
                      rows: 5,
                    },
                  },
                  {
                    key: 'sourceIds',
                    type: 'source-multi-select',
                    wrappers: ['col', 'form-field'],
                    props: { col: { span: 24 } },
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
              {
                key: 'organizationId',
                type: 'org-submit-button',
                wrappers: ['col'],
                props: {
                  col: { flex: 'none' },
                  submitLabel: 'Submit Factor Revisions',
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
export const factorReviseFields: FormlyFieldConfig[] =
  assignFieldConfigDefaultValues(formFieldConfig, factorReviseFormInitialModel)

import { regionReviseFormInitialModel } from '@app/forms/models/region-revise.model'
import assignFieldConfigDefaultValues from '@app/forms/utilities/assign-field-default-values'
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
        key: 'fields',
        wrappers: ['form-card'],
        props: <CvcFormCardWrapperProps>{
          formCardOptions: { title: 'Revise Region' },
        },
        fieldGroup: [
          {
            wrappers: ['row'],
            fieldGroup: [
              {
                key: 'aliases',
                type: 'tag-multi-input',
                wrappers: ['col', 'form-field'],
                props: {
                  col: { span: 24 },
                  label: 'Aliases',
                  description:
                    'List any aliases commonly used to refer to this Region',
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
                    'User-defined summary of the clinical relevance of this Region.',
                  placeholder: 'Enter a Region Summary',
                  label: 'Region Summary',
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
              placeholder: 'Please enter a comment describing your revisions.',
              required: true,
              minLength: 10,
            },
          },
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
              submitLabel: 'Submit Region Revisions',
              align: 'right',
            },
          },
        ],
      },
    ],
  },
]
export const regionReviseFields: FormlyFieldConfig[] =
  assignFieldConfigDefaultValues(formFieldConfig, regionReviseFormInitialModel)

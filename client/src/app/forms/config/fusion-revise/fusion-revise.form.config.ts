import { withMessages } from '@app/forms/messages/field-messages'
import { fusionReviseFormInitialModel } from '@app/forms/models/fusion-revise.model'
import assignFieldConfigDefaultValues from '@app/forms/utilities/assign-field-default-values'
import { formTitle } from '@app/forms/messages/form-titles'
import { CvcFormCardWrapperProps } from '@app/forms/wrappers/form-card/form-card.wrapper'
import { CvcFormLayoutWrapperProps } from '@app/forms/wrappers/form-layout/form-layout.wrapper'
import { FeatureInstanceTypes } from '@app/generated/civic.apollo.types'
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
          formTitle: formTitle('Revise', 'Fusion'),
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
                      col: { span: 24 },
                      label: 'Aliases',
                      description:
                        'List any aliases commonly used to refer to this Fusion',
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
                        'User-defined summary of the clinical relevance of this Fusion.',
                      placeholder: 'Enter a Fusion Summary',
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
                  {
                    key: 'knownPartnerGeneIds',
                    type: 'feature-multi-select',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { span: 24 },
                      label: 'Known Gene Partners',
                      featureType: FeatureInstanceTypes.Gene,
                      canChangeFeatureType: false,
                    },
                    expressions: {
                      'props.disabled': (field) => {
                        return !field.model.canAddPartnerGenes
                      },
                      'props.description': (field) => {
                        return field.model.canAddPartnerGenes
                          ? 'Enter known Gene partners for this Fusion'
                          : 'Fusion must have a Multiple partner in order to specify Known Gene Partners'
                      },
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
                  submitLabel: 'Submit Fusion Revisions',
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
export const fusionReviseFields: FormlyFieldConfig[] =
  assignFieldConfigDefaultValues(formFieldConfig, fusionReviseFormInitialModel)

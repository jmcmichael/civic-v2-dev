import { withMessages } from '@app/forms/messages/field-messages'
import { molecularProfileReviseFormInitialModel } from '@app/forms/models/molecular-profile-revise.model'
import { CvcOrgSubmitButtonFieldConfig } from '@app/forms/types/org-submit-button/org-submit-button.type'
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
          formTitle: formTitle('Revise', 'MolecularProfile'),
        },
        fieldGroup: [
          {
            key: 'fields',
            fieldGroup: [
              {
                wrappers: ['row'],
                fieldGroup: [
                  {
                    key: 'description',
                    type: 'textarea',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { md: 24, lg: 16 },
                      placeholder: 'Enter a Molecular Profile Description',
                      label: 'Molecular Profile Description',
                      description:
                        'Provide a summary of the clinical relevance of this Molecular Profile. The Molecular Profile Summary should be a synthesis of the existing Evidence Statements for this profile. Basic information on recurrence rates and biological/functional impact of the variants may be included, but the focus should be on the clinical impact (i.e. predictive, prognostic, diagnostic, or predisposing relevance).',
                      required: false,
                      rows: 5,
                    },
                  },
                  {
                    key: 'aliases',
                    type: 'tag-multi-input',
                    wrappers: ['col', 'form-field'],
                    props: {
                      col: { md: 24, lg: 8 },
                      label: 'Aliases',
                    },
                    expressions: {
                      'props.disabled': (field: FormlyFieldConfig) => {
                        return field.options?.formState.isSimpleMp
                      },
                      'props.description': (field: FormlyFieldConfig) => {
                        if (field.options?.formState.isSimpleMp) {
                          return 'Simple Molecular Profiles inherit their Aliases from the corresponding Variant.'
                        } else {
                          return 'List any aliases commonly used to refer to this Molecular Profile'
                        }
                      },
                    },
                  },
                  {
                    key: 'sourceIds',
                    type: 'source-multi-select',
                    wrappers: ['col', 'form-field'],
                    props: { col: { xs: 24 } },
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
              <CvcOrgSubmitButtonFieldConfig>{
                key: 'organizationId',
                type: 'org-submit-button',
                wrappers: ['col'],
                props: {
                  col: { flex: 'auto' },
                  submitLabel: 'Submit Revisions',
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
export const molecularProfileReviseFields: FormlyFieldConfig[] =
  assignFieldConfigDefaultValues(
    formFieldConfig,
    molecularProfileReviseFormInitialModel
  )

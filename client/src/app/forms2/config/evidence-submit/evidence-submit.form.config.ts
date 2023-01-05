import { evidenceSubmitFormInitialModel } from '@app/forms2/models/evidence-submit.model'
import { CvcGeneSelectFieldConfig } from '@app/forms2/types/gene-select/gene-select.type'
import assignFieldConfigDefaultValues from '@app/forms2/utilities/assign-field-default-values'
import { CvcFieldGridWrapperConfig } from '@app/forms2/wrappers/field-grid/field-grid.wrapper'
import { CvcFormCardWrapperProps } from '@app/forms2/wrappers/form-card/form-card.wrapper'
import { CvcFormLayoutWrapperProps } from '@app/forms2/wrappers/form-layout/form-layout.wrapper'
import { FormlyFieldConfig } from '@ngx-formly/core'

const formFieldConfig: FormlyFieldConfig[] = [
  // form-layout wrapper embeds the form in an nz-grid row, allowing the form to be placed adjacent to other controls or page elements. Currently, it provides a toggleable dev panel. Could be used to add a preview of the entity being added/edited, or more extensive feedback like lists of similar entities, etc.
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
      // form-card wraps the form fields in a card, providing a place to put a title, and other controls e.g. form options, status
      {
        key: 'fields',
        wrappers: ['form-card'],
        props: <CvcFormCardWrapperProps>{
          title: 'New Evidence Item',
        },
        fieldGroup: [
          // field-grid wrapper places its fields in a css-grid, allowing for a wider variety of row-level layouts. Currently it provides multi-column layout of 2-4 columns
          {
            wrappers: ['field-grid'],
            props: <CvcFieldGridWrapperConfig>{
              grid: {
                cols: 2,
              },
            },
            fieldGroup: [
              <CvcGeneSelectFieldConfig>{
                key: 'geneId',
                type: 'gene-select',
                props: {
                  required: true,
                },
              },
            ],
          },
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
              required: true,
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

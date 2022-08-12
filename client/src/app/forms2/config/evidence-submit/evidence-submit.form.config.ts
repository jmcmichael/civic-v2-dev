import { CvcFormCardWrapper, CvcFormCardWrapperProps } from '@app/forms2/wrappers/form-card/form-card.wrapper';
import {
  EvidenceItemFields,
  SubmitEvidenceItemInput,
} from '@app/generated/civic.apollo';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { Object } from 'ts-toolbelt';

// Form model type created by setting all its SubmitInput fields optional -
// required fields will be specified using fieldConfig props
type OptionalFormFields = Object.Partial<EvidenceItemFields>
export type EvidenceSubmitFormModel =
  Object.Assign<SubmitEvidenceItemInput, [{ fields: OptionalFormFields }]>

// field configuration for evidence submit form
export const evidenceSubmitFields: FormlyFieldConfig[] = [
  {
    key: 'fields',
    wrappers: ['form-card'],
    props: <CvcFormCardWrapperProps>{
      title: 'New Evidence Item',
    },
    fieldGroup: [
      {
        key: 'geneId',
        type: 'input',
        defaultValue: null,
        templateOptions: {
          label: 'Gene',
          required: true
        },
      },
    ],
  },
  {
    key: 'comment',
    type: 'textarea',
    props: {
      label: 'Comment'
    }
  }
]

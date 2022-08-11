import { CvcFormCardWrapper, CvcFormCardWrapperProps } from '@app/forms2/wrappers/form-card/form-card.wrapper';
import {
  EvidenceItemFields,
  SubmitEvidenceItemInput,
} from '@app/generated/civic.apollo';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { Object } from 'ts-toolbelt';

// Form model type created by setting all its SubmitInput fields optional -
// required fields will be specified using formly fields' templateOptions
type OptionalFormFields = Object.Partial<EvidenceItemFields>
export type EvidenceSubmitFormModel =
  Object.Assign<SubmitEvidenceItemInput, [{ fields: OptionalFormFields }]>

// field configuration for evidence submit form
export const evidenceSubmitFields: FormlyFieldConfig[] = [
  {
    key: 'fields',
    wrappers: ['form-card'],
    props: {
      title: 'Submit Evidence',
    } as CvcFormCardWrapperProps,
    fieldGroup: [
      {
        key: 'geneId',
        type: 'input',
        templateOptions: {
          label: 'Gene',
        },
      },
    ],
  },
]

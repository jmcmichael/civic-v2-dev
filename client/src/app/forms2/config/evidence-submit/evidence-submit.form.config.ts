import { CvcFieldsLayoutWrapperProps } from '@app/forms2/wrappers/fields-layout/fields-layout.wrapper';
import { CvcFormLayoutWrapperProps } from '@app/forms2/wrappers/form-layout/form-layout.wrapper';
import { EvidenceItemFields, Maybe, SubmitEvidenceItemInput } from '@app/generated/civic.apollo';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { Object } from 'ts-toolbelt';

// Form model type created by setting all its SubmitInput fields optional,
// and adding comment, organizationId attributes to its fields object
export type EvidenceSubmitFormModel = Object.Assign<
  SubmitEvidenceItemInput,
  [
    {
      fields: Object.Assign<
        Object.Partial<EvidenceItemFields>,
        [
          Object.Partial<{
            comment: string;
            organizationId: number;
          }>,
        ]
      >;
    },
  ]
>;

// field configuration for evidence submit form
export const evidenceSubmitFields: FormlyFieldConfig[] = [
  {
    wrappers: ['form-layout'],
    props: <CvcFormLayoutWrapperProps>{
      submitLabel: 'Submit Evidence Item',
      showFormStatus: true,
    },
    fieldGroup: [
      {
        key: 'fields',
        wrappers: ['fields-layout'],
        props: <CvcFieldsLayoutWrapperProps>{
          title: 'New Evidence Item',
        },
        fieldGroup: [
          {
            key: 'molecularProfileId',
            type: 'input',
            props: {
              label: 'Molecular Profile',
              required: true,
            },
          },
        ],
      },
      {
        key: 'comment',
        type: 'textarea',
        props: {
          label: 'Comment',
          // required: true,
        },
      },
      {
        wrappers: ['form-footer'],
        fieldGroup: [
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
];

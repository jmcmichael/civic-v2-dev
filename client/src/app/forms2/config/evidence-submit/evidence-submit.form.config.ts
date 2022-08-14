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
      title: 'New Evidence Item',
      observeParentModel: true,
    },
    fieldGroup: [
      {
        key: 'fields.geneId',
        type: 'input',
        defaultValue: null,
        props: {
          label: 'Gene',
          required: true,
        },
      },
    ],
  },
  {
    key: 'comment',
    type: 'textarea',
    defaultValue: null,
    props: {
      label: 'Comment',
      required: true,
    },
  },
  {
    key: 'organizationId',
    type: 'number',
    defaultValue: null,
    props: {
      label: 'Organization ID',
    },
  },
];

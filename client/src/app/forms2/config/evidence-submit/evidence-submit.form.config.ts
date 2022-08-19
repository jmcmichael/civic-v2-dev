import { CvcFieldsLayoutWrapperProps } from '@app/forms2/wrappers/fields-layout/fields-layout.wrapper';
import { CvcFormLayoutWrapperProps } from '@app/forms2/wrappers/form-layout/form-layout.wrapper';
import { FormlyFieldConfig } from '@ngx-formly/core';

export const evidenceSubmitFormFields: FormlyFieldConfig[] = [
  {
    key: 'form',
    wrappers: ['form-layout'],
    props: <CvcFormLayoutWrapperProps>{
      submitLabel: 'Submit Evidence Item',
      showFormStatus: true,
    },
    fieldGroup: [
      {
        key: 'clientMutationId',
        props: {
          hidden: true
        }
      },
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
              // required: true,
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
        key: 'formFooter',
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

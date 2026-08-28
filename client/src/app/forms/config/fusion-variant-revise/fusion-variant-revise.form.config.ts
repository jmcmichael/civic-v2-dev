import { fusionVariantReviseFormInitialModel } from '@app/forms/models/fusion-variant-revise.model'
import assignFieldConfigDefaultValues from '@app/forms/utilities/assign-field-default-values'
import { CvcFormCardWrapperProps } from '@app/forms/wrappers/form-card/form-card.wrapper'
import { CvcFormLayoutWrapperProps } from '@app/forms/wrappers/form-layout/form-layout.wrapper'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { CvcOrgSubmitButtonFieldConfig } from '@app/forms/types/org-submit-button/org-submit-button.type'
import {
  directionSelectOptions,
  isEnsemblTranscript,
  isNumeric,
} from '@app/forms/types/variant-select/fusion-variant-select/fusion-variant-select.form'
import { AbstractControl } from '@angular/forms'

function formFieldConfig(
  fivePrimeDisabled: boolean,
  threePrimeDisabled: boolean
): FormlyFieldConfig[] {
  return [
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
        {
          key: 'fields',
          wrappers: ['form-card'],
          props: <CvcFormCardWrapperProps>{
            formCardOptions: { title: 'Revise Variant' },
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
                    col: { span: 12 },
                    label: 'Aliases',
                    description:
                      'List any aliases commonly used to refer to this Variant',
                    placeholder: 'Enter Alias and hit return',
                  },
                },
                {
                  key: 'variantTypeIds',
                  type: 'variant-type-multi-select',
                  wrappers: ['col', 'form-field'],
                  props: { col: { span: 12 } },
                },
              ],
            },
            {
              wrappers: ['row'],
              fieldGroup: [
                {
                  wrappers: ['col', 'form-card'],
                  props: <CvcFormCardWrapperProps>{
                    col: { span: 24 },
                    formCardOptions: {
                      title: `Fusion Coordinates`,
                      size: 'small',
                    },
                  },
                  fieldGroup: [
                    {
                      wrappers: ['row'],
                      fieldGroup: [
                        {
                          key: 'referenceBuild',
                          type: 'reference-build-select',
                          wrappers: ['col', 'form-field'],
                          props: { col: { span: 12 } },
                          expressions: {
                            'props.required': (field) =>
                              Boolean(field.model.fivePrimeTranscript) ||
                              Boolean(field.model.threePrimeTranscript),
                          },
                        },
                        {
                          key: 'ensemblVersion',
                          type: 'base-input',
                          wrappers: ['col', 'form-field'],
                          validators: {
                            nccnVersionNumber: {
                              expression: (c: AbstractControl) =>
                                c.value ? /^\d{2,3}$/.test(c.value) : true,
                              message: (_: any, field: FormlyFieldConfig) =>
                                `"${field.formControl?.value}" does not appear to be an Ensembl version number`,
                            },
                          },
                          props: {
                            col: { span: 12 },
                            label: 'Ensembl Version',
                            description:
                              'Enter a valid Ensembl database version (e.g. 75)',
                          },
                          expressions: {
                            'props.required': (field) =>
                              Boolean(field.model.fivePrimeTranscript) ||
                              Boolean(field.model.threePrimeTranscript),
                          },
                        },
                      ],
                    },
                    {
                      wrappers: ['row'],
                      fieldGroup: [
                        {
                          key: 'fivePrimeTranscript',
                          type: 'base-input',
                          wrappers: ['col', 'form-field'],
                          props: {
                            col: { span: 6 },
                            label: "5' Transcript",
                            disabled: fivePrimeDisabled,
                            tooltip:
                              "Specify a transcript ID, including version number (e.g. ENST00000348159.4) for the 5' exon you have selected",
                          },
                          expressions: {
                            'props.required': (field) =>
                              Boolean(field.model.fivePrimeExonEnd),
                          },
                          validators: {
                            isTranscriptId: {
                              expression: isEnsemblTranscript,
                              message:
                                "5' Transcript must be a valid, human, versioned, Ensembl transcript ID",
                            },
                          },
                        },
                        {
                          key: 'fivePrimeExonEnd',
                          type: 'base-input',
                          wrappers: ['col', 'form-field'],
                          validators: {
                            isNumeric: {
                              expression: isNumeric,
                              message: "5' exon must be numeric",
                            },
                          },
                          props: {
                            col: { span: 6 },
                            label: "5' End Exon",
                            disabled: fivePrimeDisabled,
                            tooltip:
                              "The exon number counted from the 5' end of the 5' partner transcript (the last exon of the 5' partner involved in the fusion transcript)",
                          },
                          expressions: {
                            'props.required': (field) =>
                              Boolean(field.model.fivePrimeTranscript),
                          },
                        },
                        {
                          key: 'fivePrimeOffset',
                          type: 'base-input',
                          wrappers: ['col', 'form-field'],
                          validators: {
                            isNumeric: {
                              expression: isNumeric,
                              message: "5' exon offset must be numeric",
                            },
                          },
                          props: {
                            col: { span: 6 },
                            label: "5' Exon Offset",
                            tooltip:
                              'A value representing the offset from the segment boundary.',
                            required: false,
                            disabled: fivePrimeDisabled,
                          },
                        },
                        {
                          key: 'fivePrimeOffsetDirection',
                          type: 'base-select',
                          wrappers: ['col', 'form-field'],
                          props: {
                            col: { span: 6 },
                            label: "5' Exon Offset Direction",
                            tooltip:
                              'Negative values offset towards the 5’ end of the transcript and positive values offset towards the 3’ end of the transcript.',
                            required: true,
                            placeholder: "5' Offset Direction",
                            options: directionSelectOptions,
                            multiple: false,
                          },
                          expressions: {
                            'props.disabled': (field) =>
                              Boolean(!field.model.fivePrimeOffset),
                            'props.required': (field) =>
                              Boolean(field.model.fivePrimeOffset),
                          },
                        },
                      ],
                    },
                    {
                      wrappers: ['row'],
                      fieldGroup: [
                        {
                          key: 'threePrimeTranscript',
                          type: 'base-input',
                          wrappers: ['col', 'form-field'],
                          props: {
                            col: { span: 6 },
                            disabled: threePrimeDisabled,
                            label: "3' Transcript",
                            tooltip:
                              "Specify a transcript ID, including version number (e.g. ENST00000348159.4) for the 3' exon you have selected",
                          },
                          validators: {
                            isTranscriptId: {
                              expression: isEnsemblTranscript,
                              message:
                                "3' Transcript must be a valid, human, versioned, Ensembl transcript ID",
                            },
                          },
                          expressions: {
                            'props.required': (field) =>
                              Boolean(field.model.threePrimeExonStart),
                          },
                        },
                        {
                          key: 'threePrimeExonStart',
                          type: 'base-input',
                          wrappers: ['col', 'form-field'],
                          validators: {
                            isNumeric: {
                              expression: isNumeric,
                              message: "3' exon must be numeric",
                            },
                          },
                          props: {
                            col: { span: 6 },
                            label: "3' Start Exon",
                            tooltip:
                              "The exon number counted from the 5' end of the 3' partner transcript (the first exon of the 3' partner involved in the fusion transcript)",
                            disabled: threePrimeDisabled,
                          },
                          expressions: {
                            'props.required': (field) =>
                              Boolean(field.model.threePrimeTranscript),
                          },
                        },
                        {
                          key: 'threePrimeOffset',
                          type: 'base-input',
                          wrappers: ['col', 'form-field'],
                          validators: {
                            isNumeric: {
                              expression: isNumeric,
                              message: "3' exon must be numeric",
                            },
                          },
                          props: {
                            col: { span: 6 },
                            label: "3' Exon Offset",
                            disabled: threePrimeDisabled,
                            required: false,
                            tooltip:
                              'A value representing the offset from the segment boundary.',
                          },
                        },
                        {
                          key: 'threePrimeOffsetDirection',
                          type: 'base-select',
                          wrappers: ['col', 'form-field'],
                          props: {
                            col: { span: 6 },
                            label: "3' Exon Offset Direction",
                            tooltip:
                              'Negative values offset towards the 5’ end of the transcript and positive values offset towards the 3’ end of the transcript.',
                            required: true,
                            placeholder: "3' Offset Direction",
                            options: directionSelectOptions,
                            multiple: false,
                          },
                          expressions: {
                            'props.disabled': (field) =>
                              Boolean(!field.model.threePrimeOffset),
                            'props.required': (field) =>
                              Boolean(field.model.threePrimeOffset),
                          },
                        },
                      ],
                    },
                  ],
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
                placeholder:
                  'Please enter a comment describing your revisions.',
                required: true,
                minLength: 10,
              },
            },
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
                submitLabel: 'Submit Variant Revisions',
                align: 'right',
              },
            },
          ],
        },
      ],
    },
  ]
}

export function fusionVariantReviseFields(
  fivePrimeDisabled: boolean,
  threePrimeDisabled: boolean
): FormlyFieldConfig[] {
  return assignFieldConfigDefaultValues(
    formFieldConfig(fivePrimeDisabled, threePrimeDisabled),
    fusionVariantReviseFormInitialModel
  )
}

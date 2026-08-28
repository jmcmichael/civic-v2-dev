import { AbstractControl } from '@angular/forms'
import { Chromosomes } from '@app/forms/utilities/input-formatters'
import { geneVariantReviseFormInitialModel } from '@app/forms/models/gene-variant-revise.model'
import assignFieldConfigDefaultValues from '@app/forms/utilities/assign-field-default-values'
import { CvcFormCardWrapperProps } from '@app/forms/wrappers/form-card/form-card.wrapper'
import { CvcFormLayoutWrapperProps } from '@app/forms/wrappers/form-layout/form-layout.wrapper'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { CvcOrgSubmitButtonFieldConfig } from '@app/forms/types/org-submit-button/org-submit-button.type'
import { isEnsemblTranscript } from '@app/forms/types/variant-select/fusion-variant-select/fusion-variant-select.form'

const formFieldConfig: FormlyFieldConfig[] = [
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
                key: 'featureId',
                type: 'feature-select',
                wrappers: ['col', 'form-field'],
                props: {
                  col: { xs: 24, md: 12, lg: 8 },
                  description: 'Enter an Entrez Gene for this Variant',
                  required: true,
                  canChangeFeatureType: false,
                },
              },
              {
                key: 'name',
                type: 'base-input',
                wrappers: ['col', 'form-field'],
                props: {
                  col: { xs: 24, md: 12, lg: 8 },
                  placeholder: 'Enter a name for this Variant',
                  description:
                    "Enter the name of the Variant according to the <a href='https://civic.readthedocs.io/en/latest/model/variants/name.html#curating-variant-names' target='blank'>Variant Curation SOP</a>",
                  label: 'Name',
                  required: true,
                  rows: 1,
                },
              },
              {
                key: 'aliases',
                type: 'tag-multi-input',
                wrappers: ['col', 'form-field'],
                props: {
                  col: { xs: 24, lg: 8 },
                  label: 'Aliases',
                  description:
                    'List any aliases commonly used to refer to this Variant',
                  placeholder: 'Enter Alias and hit return',
                },
              },
            ],
          },
          {
            wrappers: ['row'],
            fieldGroup: [
              {
                key: 'hgvsDescriptions',
                type: 'tag-multi-input',
                wrappers: ['col', 'form-field'],
                props: {
                  col: { xs: 24, lg: 12, xl: 6, xxl: 8 },
                  label: 'HGVS Descriptions',
                  description:
                    'Enter any HGVS nomenclature descriptions of this Variant',
                  tooltip:
                    'Human Genome Variation Society nomenclature descriptions',
                  placeholder: 'Enter HGVS and hit return',
                },
              },
              {
                key: 'variantTypeIds',
                type: 'variant-type-multi-select',
                wrappers: ['col', 'form-field'],
                props: { col: { xs: 24, lg: 12, xl: 6, xxl: 8 } },
              },
              {
                key: 'clinvarIds',
                type: 'clinvar-multi-input',
                wrappers: ['col', 'form-field'],
                props: {
                  col: { xs: 24, xl: 12, xxl: 8 },
                  label: 'ClinVar IDs',
                },
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
                    title: `Coordinates`,
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
                        props: { col: { xs: 24, md: 12, lg: 8, xxl: 6 } },
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
                          col: { xs: 24, md: 12, lg: 8, xxl: 6 },
                          label: 'Ensembl Version',
                          description:
                            'Enter a valid Ensembl database version (e.g. 75)',
                        },
                      },
                      {
                        key: 'referenceBases',
                        type: 'base-input',
                        wrappers: ['col', 'form-field'],
                        validators: {
                          nccnVersionNumber: {
                            expression: (c: AbstractControl) =>
                              c.value ? /^[ACTG\\]+$/.test(c.value) : true,
                            message: (_: any, field: FormlyFieldConfig) =>
                              `"${field.formControl?.value}" contains invalid characters.`,
                          },
                        },
                        props: {
                          col: { xs: 24, md: 12, lg: 8, xxl: 6 },
                          label: 'Reference Bases',
                          description:
                            'The nucleotide(s) of the reference genome affected by the variant. Only used for SNVs and Indels (otherwise leave blank)',
                        },
                      },
                      {
                        key: 'variantBases',
                        type: 'base-input',
                        wrappers: ['col', 'form-field'],
                        validators: {
                          nccnVersionNumber: {
                            expression: (c: AbstractControl) =>
                              c.value ? /^[ACTG\\]+$/.test(c.value) : true,
                            message: (_: any, field: FormlyFieldConfig) =>
                              `"${field.formControl?.value}" contains invalid characters.`,
                          },
                        },
                        props: {
                          col: { xs: 24, md: 12, lg: 8, xxl: 6 },
                          label: 'Variant Bases',
                          description:
                            'The nucleotide(s) of the variant allele. Only used for SNVs and Indels (otherwise leave blank)',
                        },
                      },
                      {
                        key: 'chromosome',
                        type: 'base-select',
                        wrappers: ['col', 'form-field'],
                        props: {
                          col: { xs: 24, md: 12, lg: 8, xxl: 6 },
                          label: 'Chromosome',
                          options: Chromosomes,
                          description:
                            'Specify the chromosome in which this variant occurs (e.g. 17).',
                        },
                      },
                      {
                        key: 'start',
                        type: 'base-input',
                        wrappers: ['col', 'form-field'],
                        validators: {
                          isNumeric: {
                            expression: (c: AbstractControl) =>
                              c.value ? /^\d+$/.test(c.value) : true,
                            message: (_: any, field: FormlyFieldConfig) =>
                              'Start coordinate must be numeric',
                          },
                        },
                        props: {
                          col: { xs: 24, md: 12, lg: 8, xxl: 6 },
                          label: 'Start',
                          description:
                            'Enter the left/first coordinate of this variant. Must be ≤ the Stop coordinate. Coordinate must be compatible with the selected reference build.',
                        },
                      },
                      {
                        key: 'stop',
                        type: 'base-input',
                        wrappers: ['col', 'form-field'],
                        validators: {
                          isNumeric: {
                            expression: (c: AbstractControl) =>
                              c.value ? /^\d+$/.test(c.value) : true,
                            message: (_: any, field: FormlyFieldConfig) =>
                              'Stop coordinate must be numeric',
                          },
                        },
                        props: {
                          col: { xs: 24, md: 12, lg: 8, xxl: 6 },
                          label: 'Stop',
                          description:
                            'Provide the right/second coordinate of this variant. Must be ≥ the Start coordinate. Coordinate must be compatible with the selected reference build.',
                        },
                      },
                      {
                        key: 'representativeTranscript',
                        type: 'base-input',
                        wrappers: ['col', 'form-field'],
                        props: {
                          col: { xs: 24, md: 12, lg: 8, xxl: 6 },
                          label: 'Representative Transcript',
                          description:
                            'Specify a transcript ID, including version number (e.g. ENST00000348159.4, the canonical transcript defined by Ensembl).',
                        },
                        validators: {
                          isTranscriptId: {
                            expression: isEnsemblTranscript,
                            message:
                              'Representative Transcript must be a valid, human, versioned, Ensembl transcript ID',
                          },
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
export const geneVariantReviseFields: FormlyFieldConfig[] =
  assignFieldConfigDefaultValues(
    formFieldConfig,
    geneVariantReviseFormInitialModel
  )

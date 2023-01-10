import { FormlyFieldConfig } from '@ngx-formly/core'
import { CvcGeneSelectFieldConfig } from '../types/gene-select/gene-select.type'

export const noStateFormsModel = {
  geneId: undefined,
}

export const noStateFormsFieldConfig: FormlyFieldConfig[] = [
  <CvcGeneSelectFieldConfig>{
    key: 'geneId',
    type: 'gene-select',
    props: {
      required: true,
    },
  },
]

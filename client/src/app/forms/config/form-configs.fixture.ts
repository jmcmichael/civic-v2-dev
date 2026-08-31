import { FormlyFieldConfig } from '@ngx-formly/core'
import { assertionReviseFields } from './assertion-revise/assertion-revise.form.config'
import { assertionSubmitFields } from './assertion-submit/assertion-submit.form.config'
import { evidenceReviseFields } from './evidence-revise/evidence-revise.form.config'
import { evidenceSubmitFields } from './evidence-submit/evidence-submit.form.config'
import { factorReviseFields } from './factor-revise/factor-revise.form.config'
import { factorVariantReviseFields } from './factor-variant-revise/factor-variant-revise.form.config'
import { fusionReviseFields } from './fusion-revise/fusion-revise.form.config'
import { fusionVariantReviseFields } from './fusion-variant-revise/fusion-variant-revise.form.config'
import { geneReviseFields } from './gene-revise/gene-revise.form.config'
import { geneVariantReviseFields } from './gene-variant-revise/gene-variant-revise.form.config'
import { molecularProfileReviseFields } from './molecular-profile-revise/molecular-profile-revise.form.config'
import { regionReviseFields } from './region-revise/region-revise.form.config'
import { regionVariantReviseFields } from './region-variant-revise/region-variant-revise.form.config'
import { sourceSuggestFields } from './source-submit/source-submit.form.config'
import { variantgroupSuggestFields as variantgroupReviseFields } from './variantgroup-revise/variantgroup-revise.form.config'
import { variantgroupSuggestFields as variantgroupSubmitFields } from './variantgroup-submit/variantgroup-submit.form.config'

/**
 * Every form config in this directory, as the specs that assert across all of
 * them consume it. One list, so a new form cannot be covered by one spec and
 * missed by another.
 *
 * Add a row when a form is added; `form-card-contract.spec.ts` asserts the
 * count, so an omission fails rather than passes silently.
 */
export const CONFIGS: ReadonlyArray<readonly [string, FormlyFieldConfig[]]> = [
  ['assertion-revise', assertionReviseFields],
  ['assertion-submit', assertionSubmitFields],
  ['evidence-revise', evidenceReviseFields],
  ['evidence-submit', evidenceSubmitFields],
  ['factor-revise', factorReviseFields],
  ['factor-variant-revise', factorVariantReviseFields],
  ['fusion-revise', fusionReviseFields],
  // the only config built by a factory: the fusion ends' disabled flags
  ['fusion-variant-revise', fusionVariantReviseFields(false, false)],
  ['gene-revise', geneReviseFields],
  ['gene-variant-revise', geneVariantReviseFields],
  ['molecular-profile-revise', molecularProfileReviseFields],
  ['region-revise', regionReviseFields],
  ['region-variant-revise', regionVariantReviseFields],
  ['source-submit', sourceSuggestFields],
  ['variantgroup-revise', variantgroupReviseFields],
  ['variantgroup-submit', variantgroupSubmitFields],
]

export function walk(fields: FormlyFieldConfig[]): FormlyFieldConfig[] {
  return fields.flatMap((f) => [f, ...walk(f.fieldGroup ?? [])])
}

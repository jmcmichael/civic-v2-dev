/**
 * How each revised association field's diff renders: the entity label the
 * diff header shows, and which tag its items wear. One row per moderated
 * association field — the legacy revision list's 21-case template switch,
 * as data. Fields absent here carry scalar diffs and render the
 * value-diff instead.
 */

/** the tag templates CvcRevisionItemContent declares */
export type RevisionDiffTag =
  | 'feature'
  /** feature tag whose id comes from the item's nested feature */
  | 'partnerFeature'
  | 'source'
  | 'disease'
  | 'molecularProfile'
  | 'therapy'
  | 'variantType'
  | 'phenotype'
  | 'featureVariant'
  | 'evidence'
  /** a bare nz-tag around the display name */
  | 'plain'

export interface RevisionDiffEntry {
  label: string
  tag: RevisionDiffTag
}

export const REVISION_DIFF_REGISTRY: Record<string, RevisionDiffEntry> = {
  feature_id: { label: 'Feature', tag: 'feature' },
  known_partner_gene_ids: { label: 'Feature', tag: 'partnerFeature' },
  source_id: { label: 'Source', tag: 'source' },
  source_ids: { label: 'Sources', tag: 'source' },
  disease_id: { label: 'Disease', tag: 'disease' },
  molecular_profile_id: { label: 'Molecular Profile', tag: 'molecularProfile' },
  drug_ids: { label: 'Therapies', tag: 'therapy' },
  therapy_ids: { label: 'Therapies', tag: 'therapy' },
  variant_alias_ids: { label: 'Variant Aliases', tag: 'plain' },
  feature_alias_ids: { label: 'Feature Aliases', tag: 'plain' },
  molecular_profile_alias_ids: {
    label: 'Molecular Profile Aliases',
    tag: 'plain',
  },
  clinvar_entry_ids: { label: 'ClinVar Entries', tag: 'plain' },
  clingen_code_ids: { label: 'ClinGen/CGC/VICC Code(s)', tag: 'plain' },
  acmg_code_ids: { label: 'ACMG/AMP Code(s)', tag: 'plain' },
  nccn_guideline_id: { label: 'NCCN Guideline', tag: 'plain' },
  hgvs_description_ids: { label: 'HGVS Descriptions', tag: 'plain' },
  variant_type_ids: { label: 'Variant Types', tag: 'variantType' },
  phenotype_ids: { label: 'Phenotypes', tag: 'phenotype' },
  variant_id: { label: 'Variant', tag: 'featureVariant' },
  variant_ids: { label: 'Variants', tag: 'featureVariant' },
  evidence_item_ids: { label: 'Evidence', tag: 'evidence' },
}

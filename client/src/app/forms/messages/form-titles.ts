import { FormlyFieldConfig } from '@ngx-formly/core'

/**
 * What the full-page form card's title says: an icon, an action, and what is
 * being acted on — `⊕ Revise EID116`.
 *
 * A revise form names its *subject*, an add form its *kind*, because that is
 * all either one has. The kind is not repeated alongside the subject: the
 * sidebar highlights it, the breadcrumb names it, and the icon carries it.
 */
export interface CvcFormTitle {
  readonly action: CvcFormAction
  /** a registered twotone `civic-*` nz-icon */
  readonly icon: string
  /** an `EntityColors` key; tints the icon and both of the card's strips */
  readonly entityType: string
  /** the kind of thing, shown until (or unless) a subject is known */
  readonly label: string
  /**
   * The instance being edited — `EID116`, `EGFR`. Only a revise form has
   * one, and only once its entity has resolved, so the title falls back to
   * `label` rather than rendering half a heading.
   */
  readonly subject?: string
}

/**
 * Every form does one of two things. Kept a union rather than a string so
 * the vocabulary cannot drift back into the four spellings it had — `ADD`,
 * `New`, `Submit`, `Revise` — across sixteen configs.
 */
export type CvcFormAction = 'Add' | 'Revise'

interface FormEntity {
  readonly icon: string
  readonly label: string
  /**
   * The `EntityColors` key to tint by. Usually the entry's own name, but
   * the four feature kinds are not colored separately: a Gene, Factor,
   * Fusion and Region are all Features, and only `Feature` is in the map.
   */
  readonly color: string
}

const FORM_ENTITIES = {
  EvidenceItem: {
    icon: 'civic-evidence',
    label: 'Evidence Item',
    color: 'EvidenceItem',
  },
  Assertion: {
    icon: 'civic-assertion',
    label: 'Assertion',
    color: 'Assertion',
  },
  // the form suggests a source for curation; it does not create the Source
  Source: {
    icon: 'civic-source',
    label: 'Source Suggestion',
    color: 'Source',
  },
  MolecularProfile: {
    icon: 'civic-molecularprofile',
    label: 'Molecular Profile',
    color: 'MolecularProfile',
  },
  Variant: { icon: 'civic-variant', label: 'Variant', color: 'Variant' },
  VariantGroup: {
    icon: 'civic-variantgroup',
    label: 'Variant Group',
    color: 'VariantGroup',
  },
  Gene: { icon: 'civic-feature', label: 'Gene', color: 'Feature' },
  Factor: { icon: 'civic-feature', label: 'Factor', color: 'Feature' },
  Fusion: { icon: 'civic-feature', label: 'Fusion', color: 'Feature' },
  Region: { icon: 'civic-feature', label: 'Region', color: 'Feature' },
} as const satisfies Record<string, FormEntity>

export type CvcFormEntity = keyof typeof FORM_ENTITIES

/**
 * The card title for a form, by what it does and what it does it to:
 *
 * `props: { formTitle: formTitle('Revise', 'Gene') }` → `⊕ Revise Gene`
 *
 * Setting it on the config rather than patching it in `ngOnInit` is what
 * the instance-free title buys: nothing here needs a loaded entity.
 */
export function formTitle(
  action: CvcFormAction,
  entity: CvcFormEntity
): CvcFormTitle {
  const e = FORM_ENTITIES[entity]
  return { action, icon: e.icon, entityType: e.color, label: e.label }
}

/**
 * Names the instance a revise form is editing, once the form knows it.
 *
 * The subject is written onto the form's config, which is a module-level
 * constant shared by every visit — and yet needs no cleanup, because of an
 * invariant worth stating: **call this before `model.set`**.
 *
 * Every revise form gates its `<formly-form>` on `@if (model())`, so the
 * card wrapper does not exist until the entity has loaded, and this runs in
 * the same subscribe just ahead of it. The card is therefore *born* holding
 * the right subject and can never observe the previous visit's.
 *
 * Verified live: an in-app EID137 → EID116 navigation destroys the card and
 * builds a new one, and the new one's `ngOnInit` already reads EID116. A
 * clear in that `ngOnInit` runs *after* this and wipes every subject —
 * which is exactly the bug it was added to prevent.
 *
 * Patches the outermost form-card in the tree — a config nesting a sub-card
 * (fusion and gene variant coordinates) must not retitle the inner one.
 */
export function setFormSubject(
  fields: FormlyFieldConfig[] | undefined,
  subject: string | null | undefined
): void {
  if (!subject) return
  const card = findFormCard(fields)
  const title = card?.props?.['formTitle'] as CvcFormTitle | undefined
  if (card?.props && title) {
    card.props['formTitle'] = { ...title, subject }
  }
}

/** breadth-first, so the outer card is found before any card it contains */
function findFormCard(
  fields: FormlyFieldConfig[] | undefined
): FormlyFieldConfig | undefined {
  const queue = [...(fields ?? [])]
  while (queue.length) {
    const field = queue.shift()!
    if (field.wrappers?.includes('form-card')) return field
    queue.push(...(field.fieldGroup ?? []))
  }
  return undefined
}

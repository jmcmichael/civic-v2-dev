import { AbstractControl } from '@angular/forms'
import {
  formatEvidenceEnum,
  InputEnum,
} from '@app/core/utilities/enum-formatters/format-evidence-enum'
import { EntityTagRef, isTaggableTypename } from '@app/tags/entity-tag-specs'
import { FormlyFieldConfig } from '@ngx-formly/core'

/** One reason the form cannot be submitted yet, for the readiness popover */
export interface FormFieldIssue {
  readonly label: string
  readonly reason: string
}

function fieldLabel(field: FormlyFieldConfig): string {
  if (field.props?.label) return field.props.label
  if (typeof field.key === 'string') return field.key
  return 'form'
}

function reasonFor(errors: Record<string, unknown>): string {
  const keys = Object.keys(errors)
  if (keys.includes('required')) return 'required value is missing'
  return `invalid value (${keys.join(', ')})`
}

/**
 * Collects every validation failure in a formly form as label/reason pairs:
 * walks up from any field to the formly root, then down the whole tree,
 * reporting each enabled control that carries its own errors — leaf fields
 * (missing required values, failed validators) and group-level validators
 * alike.
 */
/**
 * The one-line readiness sentence for a set of outstanding issues: a single
 * issue names itself, several defer to the popover that lists them.
 *
 * Shared so the footer alert and the disabled submit button cannot drift into
 * describing the same form two different ways.
 */
export function describeFieldIssues(
  issues: readonly FormFieldIssue[]
): string {
  if (issues.length === 0) return 'Form is not ready to submit.'
  if (issues.length === 1) return `${issues[0].label}: ${issues[0].reason}.`
  return `${issues.length} fields need attention before submitting.`
}

export function collectFieldIssues(field: FormlyFieldConfig): FormFieldIssue[] {
  let root = field
  while (root.parent) root = root.parent
  const issues: FormFieldIssue[] = []
  const seen = new Set<AbstractControl>()
  const visit = (f: FormlyFieldConfig): void => {
    if (f.hide) return
    const control = f.formControl
    if (control?.errors && control.enabled && !seen.has(control)) {
      seen.add(control)
      issues.push({ label: fieldLabel(f), reason: reasonFor(control.errors) })
    }
    f.fieldGroup?.forEach(visit)
  }
  visit(root)
  return issues
}

/** One labeled model value, for the submission-preview popover */
export interface FormFieldValue {
  readonly label: string
  readonly value: string
  /** the field's model key — the graphql variable it submits as */
  readonly key?: string
  /** the pre-edit value, present only for revised fields */
  readonly before?: string
  /** a long-text (textarea) field: the preview offers expand-ability */
  readonly multiline?: boolean
  /** the model value's type: entity typename, 'enum', or the primitive */
  readonly valueType?: string
  /** the current value's meaning, as the field displays it */
  readonly description?: string
  /** entity refs standing behind `value`, renderable by cvc-tag as-is */
  readonly entities?: EntityTagRef[]
  /** entity refs standing behind `before` */
  readonly beforeEntities?: EntityTagRef[]
}

/** Resolves a cached entity's display name; undefined leaves the raw id */
export type EntityNameResolver = (
  typename: string,
  id: number
) => string | undefined

// entity-select field types → the GraphQL typename their values reference;
// each select declares the same typename in its entitySelectConfig, but
// that lives on the component instance, out of the field config's reach
const ENTITY_SELECT_TYPENAMES: Record<string, string> = {
  'acmg-code-multi-select': 'AcmgCode',
  'acmg-code-select': 'AcmgCode',
  'assertion-select': 'Assertion',
  'clingen-code-multi-select': 'ClingenCode',
  'clingen-code-select': 'ClingenCode',
  'cytogenetic-region-select': 'CytogeneticRegion',
  'disease-select': 'Disease',
  'evidence-multi-select': 'EvidenceItem',
  'evidence-select': 'EvidenceItem',
  'feature-multi-select': 'Feature',
  'feature-select': 'Feature',
  'molecular-profile-select': 'MolecularProfile',
  'nccn-guideline-select': 'NccnGuideline',
  'phenotype-multi-select': 'Phenotype',
  'phenotype-select': 'Phenotype',
  'source-multi-select': 'Source',
  'source-select': 'Source',
  'therapy-multi-select': 'Therapy',
  'therapy-select': 'Therapy',
  'user-select': 'User',
  'variant-multi-select': 'Variant',
  'variant-select': 'Variant',
  'variant-type-multi-select': 'VariantType',
  'variant-type-select': 'VariantType',
}

// long-text field types whose preview rows offer expand-ability
const TEXTAREA_TYPES = new Set(['base-textarea', 'textarea'])

// GraphQL enum values are SCREAMING_CASE (or single-letter levels)
const ENUM_SHAPE = /^[A-Z][A-Z_]*$/

function formatValue(
  value: unknown,
  typename?: string,
  resolve?: EntityNameResolver
): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) {
    return value.map((v) => formatValue(v, typename, resolve)).join(', ')
  }
  if (typename && typeof value === 'number') {
    return resolve?.(typename, value) ?? `#${value}`
  }
  if (typeof value === 'string' && ENUM_SHAPE.test(value)) {
    return formatEvidenceEnum(value as InputEnum)
  }
  if (value !== null && typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function valueTypeOf(value: unknown, typename?: string): string {
  const single = Array.isArray(value) ? value[0] : value
  const base =
    typename ??
    (typeof single === 'string' && ENUM_SHAPE.test(single)
      ? 'enum'
      : typeof single)
  return Array.isArray(value) ? `${base}[]` : base
}

function isEmpty(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  )
}

/**
 * A JSON-safe projection of a formly config tree, for the preview's Copy
 * Form Config: keys, types (component classes by name), wrappers, and the
 * serializable props — functions and unserializable values drop out.
 */
export function serializeFieldConfig(field: FormlyFieldConfig): unknown {
  let root = field
  while (root.parent) root = root.parent
  const safeProps = (props?: Record<string, unknown>) => {
    if (!props) return undefined
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(props)) {
      if (v === undefined || typeof v === 'function') continue
      try {
        JSON.stringify(v)
        out[k] = v
      } catch {
        // circular or otherwise unserializable prop
      }
    }
    return Object.keys(out).length ? out : undefined
  }
  const project = (f: FormlyFieldConfig): Record<string, unknown> => {
    const out: Record<string, unknown> = {}
    if (f.key !== undefined) out['key'] = f.key
    if (f.type) {
      out['type'] =
        typeof f.type === 'string'
          ? f.type
          : ((f.type as { name?: string }).name ?? 'component')
    }
    if (f.wrappers?.length) out['wrappers'] = f.wrappers
    if (f.hide) out['hide'] = f.hide
    const props = safeProps(f.props as Record<string, unknown> | undefined)
    if (props) out['props'] = props
    if (f.fieldGroup) out['fieldGroup'] = f.fieldGroup.map(project)
    return out
  }
  return project(root)
}

export interface CollectFieldValuesOptions {
  readonly resolve?: EntityNameResolver
  /**
   * Caller-owned pre-edit snapshot, keyed by control: pristine controls
   * keep updating their entry (async model loads patch values without
   * dirtying), so once a control goes dirty the entry holds the loaded
   * original — the `before` of a revised field
   */
  readonly originals?: Map<AbstractControl, unknown>
}

/**
 * The model as the form's own labeled leaves see it, for the ready alert's
 * submission preview: every visible, enabled leaf field with a label and a
 * non-empty value (or a revised-to-empty one), in field order. Entity ids
 * resolve to display names via `resolve` (falling back to `#id`), enum
 * values render their display labels, and fields whose control is dirty
 * carry their pre-edit value as `before`.
 */
export function collectFieldValues(
  field: FormlyFieldConfig,
  options?: CollectFieldValuesOptions
): FormFieldValue[] {
  let root = field
  while (root.parent) root = root.parent
  const { resolve, originals } = options ?? {}
  const values: FormFieldValue[] = []
  const visit = (f: FormlyFieldConfig): void => {
    if (f.hide) return
    if (f.fieldGroup) {
      f.fieldGroup.forEach(visit)
      return
    }
    const control = f.formControl
    if (!f.props?.label || !control?.enabled) return
    const value = control.value
    if (originals && (control.pristine || !originals.has(control))) {
      originals.set(control, value)
    }
    const originalValue = originals?.get(control)
    const revised = !!originals && control.dirty && !isEmpty(originalValue)
    if (isEmpty(value) && !revised) return
    const typename =
      typeof f.type === 'string' ? ENTITY_SELECT_TYPENAMES[f.type] : undefined
    const toRefs = (v: unknown): EntityTagRef[] | undefined => {
      if (!typename || !isTaggableTypename(typename) || isEmpty(v)) {
        return undefined
      }
      const ids = (Array.isArray(v) ? v : [v]).filter(
        (x): x is number => typeof x === 'number'
      )
      return ids.length
        ? ids.map((id) => ({ __typename: typename, id }))
        : undefined
    }
    const formatted = isEmpty(value)
      ? '—'
      : formatValue(value, typename, resolve)
    const beforeStr = revised
      ? formatValue(originalValue, typename, resolve)
      : undefined
    const changed = beforeStr !== undefined && beforeStr !== formatted
    values.push({
      label: f.props.label,
      value: formatted,
      key:
        String(f.key ?? '')
          .split('.')
          .pop() || undefined,
      multiline: typeof f.type === 'string' && TEXTAREA_TYPES.has(f.type),
      // textarea descriptions are static guidance (some carry markup);
      // value descriptions belong to the selects and their kin
      description:
        typeof f.type === 'string' && TEXTAREA_TYPES.has(f.type)
          ? undefined
          : f.props.description?.replace(/<[^>]*>/g, '') || undefined,
      valueType: valueTypeOf(value ?? originalValue, typename),
      before: changed ? beforeStr : undefined,
      entities: toRefs(value),
      beforeEntities: changed ? toRefs(originalValue) : undefined,
    })
  }
  visit(root)
  return values
}

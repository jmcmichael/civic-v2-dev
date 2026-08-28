import { AbstractControl } from '@angular/forms'
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
}

function formatValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.map((v) => formatValue(v)).join(', ')
  if (value !== null && typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

/**
 * The model as the form's own labeled leaves see it, for the ready alert's
 * submission preview: every visible, enabled leaf field with a label and a
 * non-empty value, in field order.
 */
export function collectFieldValues(field: FormlyFieldConfig): FormFieldValue[] {
  let root = field
  while (root.parent) root = root.parent
  const values: FormFieldValue[] = []
  const visit = (f: FormlyFieldConfig): void => {
    if (f.hide) return
    if (f.fieldGroup) {
      f.fieldGroup.forEach(visit)
      return
    }
    const control = f.formControl
    const value = control?.value
    if (
      !f.props?.label ||
      !control?.enabled ||
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return
    }
    values.push({ label: f.props.label, value: formatValue(value) })
  }
  visit(root)
  return values
}

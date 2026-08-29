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

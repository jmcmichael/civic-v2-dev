import { FormControl, Validators } from '@angular/forms'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { describe, expect, it } from 'vitest'
import { collectFieldIssues } from './form-field-issues'

function link(root: FormlyFieldConfig): FormlyFieldConfig {
  const visit = (f: FormlyFieldConfig) =>
    f.fieldGroup?.forEach((child) => {
      // parent is readonly on the config type; formly assigns it at build
      ;(child as { parent?: FormlyFieldConfig }).parent = f
      visit(child)
    })
  visit(root)
  return root
}

describe('collectFieldIssues', () => {
  it('reports required and invalid controls with labels, from any field', () => {
    const root = link({
      fieldGroup: [
        {
          key: 'source',
          props: { label: 'Source' },
          formControl: new FormControl(null, Validators.required),
        },
        {
          key: 'rating',
          props: { label: 'Rating' },
          formControl: new FormControl(9, Validators.max(5)),
        },
        {
          key: 'comment',
          formControl: new FormControl('fine'),
        },
      ],
    })
    // climbs to the root from a leaf
    const issues = collectFieldIssues(root.fieldGroup![2])
    expect(issues).toEqual([
      { label: 'Source', reason: 'required value is missing' },
      { label: 'Rating', reason: 'invalid value (max)' },
    ])
  })

  it('skips hidden fields and disabled controls', () => {
    const disabled = new FormControl(null, Validators.required)
    disabled.disable()
    const root = link({
      fieldGroup: [
        {
          key: 'therapies',
          hide: true,
          formControl: new FormControl(null, Validators.required),
        },
        { key: 'interaction', formControl: disabled },
      ],
    })
    expect(collectFieldIssues(root)).toEqual([])
  })
})

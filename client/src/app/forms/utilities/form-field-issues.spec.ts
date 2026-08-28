import { FormControl, Validators } from '@angular/forms'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { describe, expect, it } from 'vitest'
import {
  collectFieldIssues,
  collectFieldValues,
  describeFieldIssues,
} from './form-field-issues'

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

  it('collects labeled, non-empty leaf values for the submission preview', () => {
    const root = link({
      fieldGroup: [
        {
          key: 'significance',
          props: { label: 'Significance' },
          formControl: new FormControl('SENSITIVITYRESPONSE'),
        },
        {
          key: 'phenotypeIds',
          props: { label: 'Phenotypes' },
          formControl: new FormControl([21, 34]),
        },
        {
          key: 'flagged',
          props: { label: 'Flagged' },
          formControl: new FormControl(false),
        },
        // unlabeled, empty and hidden fields stay out of the preview
        { key: 'clientMutationId', formControl: new FormControl('abc') },
        {
          key: 'comment',
          props: { label: 'Comment' },
          formControl: new FormControl(''),
        },
        {
          key: 'therapyIds',
          hide: true,
          props: { label: 'Therapies' },
          formControl: new FormControl([5]),
        },
      ],
    })
    expect(collectFieldValues(root)).toEqual([
      { label: 'Significance', value: 'SENSITIVITYRESPONSE' },
      { label: 'Phenotypes', value: '21, 34' },
      { label: 'Flagged', value: 'No' },
    ])
  })
})

describe('describeFieldIssues', () => {
  it('says the form is not ready when nothing is outstanding', () => {
    expect(describeFieldIssues([])).toBe('Form is not ready to submit.')
  })

  it('names the field when a single issue is outstanding', () => {
    expect(
      describeFieldIssues([{ label: 'Rating', reason: 'is required' }])
    ).toBe('Rating: is required.')
  })

  it('counts them when several are outstanding', () => {
    expect(
      describeFieldIssues([
        { label: 'Rating', reason: 'is required' },
        { label: 'Summary', reason: 'is required' },
      ])
    ).toBe('2 fields need attention before submitting.')
  })
})

import { FormControl, FormGroup, Validators } from '@angular/forms'
import { CvcFormlyConfig2 } from '@app/forms/forms.options'
import { FormlyConfig, FormlyFieldConfig } from '@ngx-formly/core'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  collectFieldIssues,
  createUnrevisedCheck,
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
  let config: FormlyConfig

  beforeEach(() => {
    config = new FormlyConfig()
    config.addConfig(CvcFormlyConfig2)
  })

  it('reports each failing control as the sentence its field shows', () => {
    const root = link({
      fieldGroup: [
        {
          key: 'source',
          props: { label: 'Source' },
          formControl: new FormControl(null, Validators.required),
        },
        {
          key: 'rating',
          props: { label: 'Rating', max: 5 },
          formControl: new FormControl(9, Validators.max(5)),
        },
        {
          key: 'comment',
          formControl: new FormControl('fine'),
        },
      ],
    })
    // climbs to the root from a leaf
    const issues = collectFieldIssues(root.fieldGroup![2], config)
    expect(issues).toEqual([
      { label: 'Source', scope: 'field', message: 'Source is required.' },
      {
        label: 'Rating',
        scope: 'field',
        message: 'This field has a maximum value of 5.',
      },
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
    expect(collectFieldIssues(root, config)).toEqual([])
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
          type: 'phenotype-multi-select',
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
    // entity names resolve through the callback (cache-miss falls back to
    // #id); enum values render their display labels; the key is the
    // graphql variable, and entity fields carry tag-renderable refs
    const resolve = (typename: string, id: number) =>
      typename === 'Phenotype' && id === 21 ? 'Poor appetite' : undefined
    expect(collectFieldValues(root, { resolve })).toMatchObject([
      {
        label: 'Significance',
        value: 'Sensitivity / Response',
        key: 'significance',
        entities: undefined,
      },
      {
        label: 'Phenotypes',
        value: 'Poor appetite, #34',
        key: 'phenotypeIds',
        entities: [
          { __typename: 'Phenotype', id: 21 },
          { __typename: 'Phenotype', id: 34 },
        ],
      },
      { label: 'Flagged', value: 'No', key: 'flagged' },
    ])
  })

  it('reports before → after for revised fields', () => {
    const disease = new FormControl(3)
    const rating = new FormControl(4)
    const root = link({
      fieldGroup: [
        {
          key: 'diseaseId',
          type: 'disease-select',
          props: { label: 'Disease' },
          formControl: disease,
        },
        {
          key: 'rating',
          props: { label: 'Rating' },
          formControl: rating,
        },
      ],
    })
    const originals = new Map()
    // first collect snapshots the loaded (pristine) originals
    collectFieldValues(root, { originals })
    // an async model patch while pristine updates the snapshot
    disease.setValue(4)
    collectFieldValues(root, { originals })
    // a user edit dirties the control; the snapshot stops following
    disease.setValue(7)
    disease.markAsDirty()
    expect(collectFieldValues(root, { originals })).toMatchObject([
      {
        label: 'Disease',
        value: '#7',
        key: 'diseaseId',
        before: '#4',
        entities: [{ __typename: 'Disease', id: 7 }],
        beforeEntities: [{ __typename: 'Disease', id: 4 }],
      },
      { label: 'Rating', value: '4', key: 'rating', before: undefined },
    ])
  })
})

describe('describeFieldIssues', () => {
  it('says the form is not ready when nothing is outstanding', () => {
    expect(describeFieldIssues([])).toBe('Form is not ready to submit.')
  })

  it('speaks for the field when a single issue is outstanding', () => {
    expect(
      describeFieldIssues([
        { label: 'Rating', scope: 'field', message: 'Rate the evidence.' },
      ])
    ).toBe('Rate the evidence.')
  })

  it('defers to the popover when several are outstanding, whatever their scope', () => {
    const several = [
      { label: 'Rating', scope: 'field' as const, message: 'Rate it.' },
      { label: 'Summary', scope: 'field' as const, message: 'Summarize it.' },
    ]
    const expected = 'Multiple issues prevent this form from being submitted.'
    expect(describeFieldIssues(several)).toBe(expected)
    expect(
      describeFieldIssues([
        several[0],
        { label: 'Revision', scope: 'form', message: 'Change a field.' },
      ])
    ).toBe(expected)
  })
})

describe('createUnrevisedCheck', () => {
  /** a revise form's shape: a keyed `fields` group beside a comment */
  function reviseForm(fields: Record<string, FormControl>) {
    const group = new FormGroup(fields)
    return link({
      options: { formState: { formMode: 'revise' } },
      fieldGroup: [
        { key: 'fields', formControl: group },
        { key: 'comment', formControl: new FormControl(null) },
      ],
    } as FormlyFieldConfig)
  }

  it('reports an untouched revise form as unrevised', () => {
    const unrevised = createUnrevisedCheck()
    const root = reviseForm({ rating: new FormControl(3) })
    expect(unrevised(root)).toBe(true)
  })

  it('takes an async model load as the baseline, not a revision', () => {
    const unrevised = createUnrevisedCheck()
    const rating = new FormControl<number | null>(null)
    const root = reviseForm({ rating })
    expect(unrevised(root)).toBe(true)
    // formly patches the loaded entity without dirtying
    rating.setValue(3)
    expect(unrevised(root)).toBe(true)
  })

  it('reports a changed field as a revision', () => {
    const unrevised = createUnrevisedCheck()
    const rating = new FormControl(3)
    const root = reviseForm({ rating })
    expect(unrevised(root)).toBe(true)
    rating.setValue(4)
    rating.markAsDirty()
    expect(unrevised(root)).toBe(false)
  })

  it('reports a field edited and put back as unrevised, as the server does', () => {
    const unrevised = createUnrevisedCheck()
    const rating = new FormControl(3)
    const root = reviseForm({ rating })
    unrevised(root)
    rating.setValue(4)
    rating.markAsDirty()
    expect(unrevised(root)).toBe(false)
    rating.setValue(3)
    expect(unrevised(root)).toBe(true)
  })

  it('ignores the comment, which is not a revisable field', () => {
    const unrevised = createUnrevisedCheck()
    const root = reviseForm({ rating: new FormControl(3) })
    const comment = root.fieldGroup![1].formControl!
    comment.setValue('a comment long enough to pass')
    comment.markAsDirty()
    expect(unrevised(root)).toBe(true)
  })

  it('has nothing to say about submit forms', () => {
    const unrevised = createUnrevisedCheck()
    const root = reviseForm({ rating: new FormControl<number | null>(null) })
    root.options!.formState.formMode = 'add'
    expect(unrevised(root)).toBe(false)
  })
})

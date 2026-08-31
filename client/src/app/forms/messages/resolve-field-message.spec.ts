import { Component } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { CvcFormlyConfig2 } from '@app/forms/forms.options'
import {
  FormlyConfig,
  FormlyFieldConfig,
  FormlyFormBuilder,
  FormlyModule,
} from '@ngx-formly/core'
import { Subject } from 'rxjs'
import { beforeEach, describe, expect, it } from 'vitest'
import { resolveFieldMessage } from './resolve-field-message'

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, FormlyModule],
  template: `<formly-validation-message [field]="field" />`,
})
class HostComponent {
  field!: FormlyFieldConfig
}

/** a standalone field, wired enough for formly's message component to run */
function fieldWith(config: FormlyFieldConfig): FormlyFieldConfig {
  return {
    ...config,
    options: { fieldChanges: new Subject() } as FormlyFieldConfig['options'],
  }
}

describe('resolveFieldMessage', () => {
  let config: FormlyConfig

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent, FormlyModule.forRoot(CvcFormlyConfig2)],
    })
    // the form builder's constructor is what folds FORMLY_CONFIG providers
    // into FormlyConfig; nothing else in this fixture builds a form
    TestBed.inject(FormlyFormBuilder)
    config = TestBed.inject(FormlyConfig)
  })

  /**
   * What formly itself renders for the field, for parity assertions. A fresh
   * fixture per field: the message is an async pipe over an observable the
   * component rebuilds in ngOnChanges, so a reused host renders the previous
   * field's sentence.
   */
  function rendered(field: FormlyFieldConfig): string {
    const fixture: ComponentFixture<HostComponent> =
      TestBed.createComponent(HostComponent)
    fixture.componentInstance.field = field
    fixture.detectChanges()
    return fixture.nativeElement.textContent.trim()
  }

  it('matches what formly renders, from the catalog down to the fallback', () => {
    const cases: FormlyFieldConfig[] = [
      // catalog hit, by model key
      {
        key: 'comment',
        props: { label: 'Comment', required: true },
        formControl: new FormControl(null, Validators.required),
      },
      // catalog miss: the generic names the field from its label
      {
        key: 'ensemblVersion',
        props: { label: 'Ensembl Version', required: true },
        formControl: new FormControl(null, Validators.required),
      },
      // per-field override outranks the catalog
      {
        key: 'comment',
        props: { label: 'Comment' },
        validation: { messages: { required: 'Say something.' } },
        formControl: new FormControl(null, Validators.required),
      },
      // an inline validator message outranks both
      {
        key: 'start',
        props: { label: 'Start' },
        validators: {
          isNumeric: {
            expression: () => false,
            message: 'Start must be numeric.',
          },
        },
        formControl: new FormControl(null, {
          validators: () => ({ isNumeric: true }),
        }),
      },
      // a function message receives the payload and the field
      {
        key: 'value',
        props: { label: 'Value', max: 5 },
        formControl: new FormControl(9, Validators.max(5)),
      },
    ]
    for (const c of cases) {
      const field = fieldWith(c)
      expect(resolveFieldMessage(field, config)).toBe(rendered(field))
    }
  })

  it('answers with the catalog sentence for a known field', () => {
    const field = fieldWith({
      key: 'comment',
      props: { label: 'Comment', messageId: 'reviseComment' },
      formControl: new FormControl(null, Validators.required),
    })
    expect(resolveFieldMessage(field, config)).toBe(
      'Provide a comment that supports or justifies your suggested revisions.'
    )
  })

  it('reports nothing for a group error formly forwards to a child', () => {
    const field = fieldWith({
      key: 'fusion',
      formControl: new FormControl(null, () => ({
        partnerStatus: { errorPath: 'fivePrimePartnerStatus' },
      })),
    })
    expect(resolveFieldMessage(field, config)).toBeUndefined()
    expect(rendered(field)).toBe('')
  })

  it('reports nothing for a control with no errors', () => {
    const field = fieldWith({
      key: 'comment',
      formControl: new FormControl('fine'),
    })
    expect(resolveFieldMessage(field, config)).toBeUndefined()
  })
})

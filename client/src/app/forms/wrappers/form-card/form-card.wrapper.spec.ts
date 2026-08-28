import { Component, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms'
import { CvcFormSubmissionStatusDisplayComponent } from '@app/forms/components/form-submission-status-display/form-submission-status-display.component'
import {
  FormMutationState,
  FormSubmissionError,
} from '@app/forms/utilities/form-mutation'
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core'
import { describe, expect, it } from 'vitest'
import { CvcFormCardModule } from './form-card.module'

@Component({
  template: `
    <form [formGroup]="form">
      <formly-form
        [form]="form"
        [fields]="fields"
        [model]="model">
      </formly-form>
    </form>
  `,
  imports: [ReactiveFormsModule, FormlyModule, CvcFormCardModule],
})
class HostComponent {
  form = new UntypedFormGroup({})
  model = {}
  fields: FormlyFieldConfig[] = []
}

function mount(): {
  fixture: ComponentFixture<HostComponent>
  errors: ReturnType<typeof signal<FormSubmissionError[]>>
  dismissed: ReturnType<typeof signal<boolean>>
} {
  const isSubmitting = signal(false)
  const success = signal(false)
  const errors = signal<FormSubmissionError[]>([])
  const dismissed = signal(false)
  const state: FormMutationState = { isSubmitting, success, errors }
  TestBed.configureTestingModule({
    imports: [HostComponent, FormlyModule.forRoot({ types: [] })],
    providers: [
      {
        provide: CvcFormSubmissionStatusDisplayComponent,
        useValue: { state: signal(state), dismissed },
      },
    ],
  })
  const fixture = TestBed.createComponent(HostComponent)
  fixture.componentInstance.fields = [
    {
      wrappers: ['form-card'],
      props: {
        formCardOptions: { title: 'My Form' },
        formInstructions: 'Fill in the fields, then submit.',
      },
      fieldGroup: [{ key: 'a' }],
    },
  ]
  fixture.detectChanges()
  return { fixture, errors, dismissed }
}

function headTitle(fixture: ComponentFixture<HostComponent>): string {
  return (
    fixture.nativeElement
      .querySelector('.ant-card-head-title')
      ?.textContent.trim() ?? ''
  )
}

describe('CvcFormCardWrapper', () => {
  it('titles the card from formCardOptions', () => {
    const { fixture } = mount()
    expect(headTitle(fixture)).toBe('My Form')
  })

  it('renders instructions beside the field-state legend above the fields', () => {
    const { fixture } = mount()
    const el: HTMLElement = fixture.nativeElement
    expect(el.querySelector('.form-instructions')?.textContent).toContain(
      'Fill in the fields, then submit.'
    )
    expect(el.querySelector('.form-intro cvc-form-legend')).toBeTruthy()
  })

  it('shows the error tag in the header extra while a failure stands', () => {
    const { fixture, errors } = mount()
    errors.set([{ category: 'graphql', message: 'rejected' }])
    fixture.detectChanges()
    const extra = fixture.nativeElement.querySelector('.ant-card-extra')
    expect(extra?.textContent).toContain('rejected')
    expect(headTitle(fixture)).toBe('My Form')
  })

  it('reports the edit that dismisses a standing failure', () => {
    const { fixture, errors, dismissed } = mount()
    errors.set([{ category: 'graphql', message: 'rejected' }])
    fixture.detectChanges()
    expect(dismissed()).toBe(false)
    fixture.componentInstance.form.get('a')!.setValue('edited')
    expect(dismissed()).toBe(true)
  })
})

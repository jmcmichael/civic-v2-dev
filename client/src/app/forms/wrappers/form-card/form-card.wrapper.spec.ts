import { Component, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms'
import { CvcFormSubmissionStatusDisplayComponent } from '@app/forms/components/form-submission-status-display/form-submission-status-display.component'
import {
  FormMutationState,
  FormSubmissionError,
} from '@app/forms/utilities/form-mutation'
import { CheckCircleTwoTone } from '@ant-design/icons-angular/icons'
import { civicEvidenceTwotone } from '@app/generated/civic.icons'
import { toIconDefs } from '@app/icons-provider.module'
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core'
import { NZ_ICONS } from 'ng-zorro-antd/icon'
import { describe, expect, it } from 'vitest'
import { CvcFormCardModule } from './form-card.module'
import { formTitle, setFormSubject } from '@app/forms/messages/form-titles'

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

const defaultCardField = (): FormlyFieldConfig => ({
  wrappers: ['form-card'],
  props: {
    formCardOptions: { title: 'My Form' },
    formInstructions: 'Fill in the fields, then submit.',
  },
  fieldGroup: [
    { key: 'a', className: 'body-field' },
    { key: 'footer', className: 'footer-field', props: { formFooter: true } },
  ],
})

function mount(field: FormlyFieldConfig = defaultCardField()): {
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
      // the card title renders a real civic-* twotone; an unregistered
      // icon throws out of band and is reported as an unhandled error
      {
        provide: NZ_ICONS,
        useValue: [CheckCircleTwoTone, ...toIconDefs([civicEvidenceTwotone])],
      },
    ],
  })
  const fixture = TestBed.createComponent(HostComponent)
  fixture.componentInstance.fields = [field]
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
  it('titles the card from formTitle, action before what it acts on', () => {
    const field = defaultCardField()
    field.props!.formTitle = formTitle('Revise', 'EvidenceItem')
    const { fixture } = mount(field)
    // one assertion pins the order: the icon renders ahead of both
    expect(headTitle(fixture)).toContain('Revise Evidence Item')
  })

  it('names the subject once a revise form knows it', () => {
    const field = defaultCardField()
    field.props!.formTitle = formTitle('Revise', 'EvidenceItem')
    setFormSubject([field], 'EID116')
    const { fixture } = mount(field)
    expect(headTitle(fixture)).toContain('Revise EID116')
    expect(headTitle(fixture)).not.toContain('Evidence Item')
  })

  it('falls back to the configured title without a formTitle', () => {
    const { fixture } = mount()
    expect(headTitle(fixture)).toBe('My Form')
  })

  it('shows the instruction line above the form fields', () => {
    const { fixture } = mount()
    const instructions =
      fixture.nativeElement.querySelector('.form-instructions')
    expect(instructions?.textContent).toContain(
      'Fill in the fields, then submit.'
    )
    expect(instructions?.closest('.ant-card-body')).toBeTruthy()
  })

  it('shows the field-state legend in the header extra', () => {
    const { fixture } = mount()
    expect(
      fixture.nativeElement.querySelector('.ant-card-extra cvc-form-legend')
    ).toBeTruthy()
  })

  it('renders formFooter fields in the pinned actions area, the rest in the body', () => {
    const { fixture } = mount()
    const el: HTMLElement = fixture.nativeElement
    expect(el.querySelector('.ant-card-body .body-field')).toBeTruthy()
    expect(el.querySelector('.ant-card-actions .footer-field')).toBeTruthy()
    expect(el.querySelector('.ant-card-body .footer-field')).toBeFalsy()
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

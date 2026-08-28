import { Component, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { CvcFormSubmissionStatusDisplayComponent } from '@app/forms/components/form-submission-status-display/form-submission-status-display.component'
import {
  FormMutationState,
  FormSubmissionError,
} from '@app/forms/utilities/form-mutation'
import { beforeEach, describe, expect, it } from 'vitest'
import { CvcFormErrorTagComponent } from './form-error-tag.component'

function makeState() {
  const isSubmitting = signal(false)
  const success = signal(false)
  const errors = signal<FormSubmissionError[]>([])
  const state: FormMutationState = { isSubmitting, success, errors }
  return { state, errors }
}

@Component({
  template: `<cvc-form-error-tag
    [variant]="variant"
    [readiness]="readiness" />`,
  imports: [CvcFormErrorTagComponent],
})
class HostComponent {
  variant: 'tag' | 'alert' = 'tag'
  readiness?: { valid: boolean; issues: { label: string; reason: string }[] }
}

describe('CvcFormErrorTagComponent', () => {
  let fixture: ComponentFixture<HostComponent>
  let errors: ReturnType<typeof makeState>['errors']
  let dismissed: ReturnType<typeof signal<boolean>>

  beforeEach(() => {
    const made = makeState()
    errors = made.errors
    // stand in for the ancestor status display the tag injects
    dismissed = signal(false)
    const statusDisplay = {
      state: signal<FormMutationState>(made.state),
      dismissed,
    }
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        {
          provide: CvcFormSubmissionStatusDisplayComponent,
          useValue: statusDisplay,
        },
      ],
    })
    fixture = TestBed.createComponent(HostComponent)
  })

  it('renders nothing without errors', () => {
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('nz-tag')).toBeFalsy()
  })

  it('labels with the first error message, code left to the popover', () => {
    errors.set([
      {
        category: 'graphql',
        code: 'VALIDATION_FAILED',
        message: 'name is invalid',
      },
    ])
    fixture.detectChanges()
    const tag = fixture.nativeElement.querySelector('nz-tag')
    expect(tag.textContent).toContain('name is invalid')
    expect(tag.textContent).not.toContain('VALIDATION_FAILED')
  })

  it('renders the alert variant for the footer', () => {
    fixture.componentInstance.variant = 'alert'
    errors.set([
      {
        category: 'network',
        code: '502',
        message: 'Bad gateway',
      },
    ])
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('nz-tag')).toBeFalsy()
    const alert = fixture.nativeElement.querySelector('nz-alert')
    expect(alert).toBeTruthy()
    expect(alert.textContent).toContain('Bad gateway')
    expect(alert.textContent).not.toContain('502')
  })

  it('opens a categorized details popover from the alert', async () => {
    fixture.componentInstance.variant = 'alert'
    errors.set([
      {
        category: 'graphql',
        code: 'VALIDATION_FAILED',
        message: 'name is invalid',
        meta: [{ label: 'path', value: 'addThing.name' }],
        json: { message: 'name is invalid' },
      },
      {
        category: 'network',
        code: '502',
        message: 'Bad gateway',
        log: 'HTTP 502',
      },
    ])
    fixture.detectChanges()
    // the Details button is a visible affordance; its click bubbles to the
    // alert's popover trigger
    const button = fixture.nativeElement.querySelector(
      '.ant-alert-action button'
    )
    expect(button.textContent).toContain('Details')
    button.click()
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
    // popover content renders into the cdk overlay container
    const popover = document.querySelector('.form-error-popover')
    expect(popover).toBeTruthy()
    const panels = popover!.querySelectorAll('nz-collapse-panel')
    expect(panels.length).toBe(2)
    expect(panels[0].textContent).toContain('graphql')
    expect(panels[0].textContent).toContain('VALIDATION_FAILED')
    expect(panels[0].querySelector('nz-tag.code-chip')).toBeTruthy()
    expect(panels[1].textContent).toContain('network')
    expect(panels[1].textContent).toContain('502')
    // header controls and the count in the title
    expect(popover!.textContent).toContain('Copy all')
    expect(popover!.textContent).toContain('Show all details')
    expect(
      document.querySelector('.form-error-popover .ant-popover-title')
        ?.textContent
    ).toContain('(2)')
  })

  it('expands a single error and shows its meta rows and log', async () => {
    fixture.componentInstance.variant = 'alert'
    errors.set([
      {
        category: 'code',
        code: 'Error',
        message: 'boom',
        meta: [{ label: 'origin', value: 'apollo link chain' }],
        log: 'Error: boom\n  at somewhere',
      },
    ])
    fixture.detectChanges()
    fixture.nativeElement.querySelector('nz-alert').click()
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
    const popover = document.querySelector('.form-error-popover')!
    const panel = popover.querySelector('nz-collapse-panel')!
    expect(panel.classList.contains('ant-collapse-item-active')).toBe(true)
    expect(panel.textContent).toContain('origin')
    expect(panel.textContent).toContain('apollo link chain')
    // no json payload: the raw log renders instead
    expect(panel.querySelector('pre.error-log')?.textContent).toContain(
      'Error: boom'
    )
  })

  it('switches to the failure summary when several errors stand', () => {
    errors.set([
      { category: 'graphql', message: 'first' },
      { category: 'graphql', message: 'second' },
      { category: 'network', message: 'third' },
    ])
    fixture.detectChanges()
    // no submissionNoun or entityType on the display: the generic noun
    expect(fixture.nativeElement.querySelector('nz-tag').textContent).toContain(
      'Form submission failed, review error details.'
    )
  })

  it('reports blocking fields while the form is invalid', () => {
    fixture.componentInstance.variant = 'alert'
    fixture.componentInstance.readiness = {
      valid: false,
      issues: [
        { label: 'Source', reason: 'required value is missing' },
        { label: 'Evidence Level', reason: 'required value is missing' },
      ],
    }
    fixture.detectChanges()
    const info = fixture.nativeElement.querySelector('nz-alert')
    expect(info.textContent).toContain(
      '2 fields need attention before submitting.'
    )
  })

  it('shows a single blocking issue directly in the alert', () => {
    fixture.componentInstance.variant = 'alert'
    fixture.componentInstance.readiness = {
      valid: false,
      issues: [{ label: 'Comment', reason: 'required value is missing' }],
    }
    fixture.detectChanges()
    expect(
      fixture.nativeElement.querySelector('nz-alert').textContent
    ).toContain('Comment: required value is missing.')
  })

  it('reports readiness once the form is valid, until a failure lands', () => {
    fixture.componentInstance.variant = 'alert'
    fixture.componentInstance.readiness = { valid: true, issues: [] }
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain(
      'All required fields provided, form may be submitted.'
    )
    // a submit failure takes the slot back
    errors.set([{ category: 'network', message: 'down' }])
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('down')
  })

  it('hides while the display marks the failure dismissed', () => {
    errors.set([{ category: 'graphql', message: 'rejected' }])
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('nz-tag')).toBeTruthy()
    dismissed.set(true)
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('nz-tag')).toBeFalsy()
  })

  it('clears when the errors do', () => {
    errors.set([{ category: 'code', message: 'boom' }])
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('nz-tag')).toBeTruthy()
    errors.set([])
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('nz-tag')).toBeFalsy()
  })
})

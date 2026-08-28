import { Component, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import {
  ReactiveFormsModule,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms'
import { By } from '@angular/platform-browser'
import { Router } from '@angular/router'
import {
  FormMutationState,
  FormSubmissionError,
} from '@app/forms/utilities/form-mutation'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CvcFormSubmissionStatusDisplayComponent } from './form-submission-status-display.component'
import { CvcFormSubmissionStatusDisplayModule } from './form-submission-status-display.module'

function makeState() {
  const isSubmitting = signal(false)
  const success = signal(false)
  const errors = signal<FormSubmissionError[]>([])
  const state: FormMutationState = { isSubmitting, success, errors }
  return { state, isSubmitting, success, errors }
}

@Component({
  template: `
    <cvc-form-submission-status-display
      [mutationState]="state"
      entityType="Evidence Item"
      [redirectUrl]="redirectUrl">
      <form [formGroup]="fg">
        <span class="projected">form body</span>
      </form>
    </cvc-form-submission-status-display>
  `,
  imports: [CvcFormSubmissionStatusDisplayModule, ReactiveFormsModule],
})
class HostComponent {
  state?: FormMutationState
  redirectUrl?: string
  fg = new UntypedFormGroup({ a: new UntypedFormControl('') })
}

describe('CvcFormSubmissionStatusDisplayComponent', () => {
  let fixture: ComponentFixture<HostComponent>
  let host: HostComponent
  const navigateByUrl = vi.fn()

  beforeEach(() => {
    navigateByUrl.mockClear()
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: Router, useValue: { navigateByUrl } }],
    })
    fixture = TestBed.createComponent(HostComponent)
    host = fixture.componentInstance
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('projects the form while there is no success', () => {
    const { state } = makeState()
    host.state = state
    fixture.detectChanges()
    const el: HTMLElement = fixture.nativeElement
    expect(el.querySelector('.projected')).toBeTruthy()
    expect(el.querySelector('nz-alert')).toBeFalsy()
  })

  it('keeps projecting the form on errors — the error tag displays them', () => {
    const { state, errors } = makeState()
    host.state = state
    fixture.detectChanges()
    errors.set([
      {
        category: 'graphql',
        message: 'name is invalid',
      },
    ])
    fixture.detectChanges()
    const el: HTMLElement = fixture.nativeElement
    expect(el.querySelector('.projected')).toBeTruthy()
    expect(el.querySelector('nz-alert')).toBeFalsy()
  })

  it('swaps the form for the success alert', () => {
    const { state, success } = makeState()
    host.state = state
    fixture.detectChanges()
    success.set(true)
    fixture.detectChanges()
    const el: HTMLElement = fixture.nativeElement
    expect(el.textContent).toContain('Evidence Item Submitted')
    expect(el.querySelector('.projected')).toBeFalsy()
  })

  it('a fresh submit state re-arms dismissed indicators', () => {
    const { state, errors } = makeState()
    host.state = state
    fixture.detectChanges()
    errors.set([{ category: 'graphql', message: 'rejected' }])
    fixture.detectChanges()
    const display = fixture.debugElement.query(
      By.directive(CvcFormSubmissionStatusDisplayComponent)
    ).componentInstance as CvcFormSubmissionStatusDisplayComponent
    display.dismissed.set(true)
    display.mutationState = makeState().state
    fixture.detectChanges()
    expect(display.dismissed()).toBe(false)
  })

  it('redirects 2.5s after success when a redirectUrl is set', () => {
    vi.useFakeTimers()
    const { state, success } = makeState()
    host.state = state
    host.redirectUrl = '/evidence/1/revisions'
    fixture.detectChanges()
    success.set(true)
    fixture.detectChanges()
    vi.advanceTimersByTime(2600)
    expect(navigateByUrl).toHaveBeenCalledWith('/evidence/1/revisions')
  })
})

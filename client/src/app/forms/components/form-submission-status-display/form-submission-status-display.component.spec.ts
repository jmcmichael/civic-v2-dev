import { Component, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { FormMutationState } from '@app/forms/utilities/form-mutation'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CvcFormSubmissionStatusDisplayModule } from './form-submission-status-display.module'

function makeState() {
  const isSubmitting = signal(false)
  const success = signal(false)
  const errors = signal<string[]>([])
  const state: FormMutationState = { isSubmitting, success, errors }
  return { state, isSubmitting, success, errors }
}

@Component({
  template: `
    <cvc-form-submission-status-display
      [mutationState]="state"
      entityType="Evidence Item"
      [redirectUrl]="redirectUrl">
      <span class="projected">form body</span>
    </cvc-form-submission-status-display>
  `,
  imports: [CvcFormSubmissionStatusDisplayModule],
})
class HostComponent {
  state?: FormMutationState
  redirectUrl?: string
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

  it('lists submit errors', () => {
    const { state, errors } = makeState()
    host.state = state
    fixture.detectChanges()
    errors.set(['name is invalid', 'id is taken'])
    fixture.detectChanges()
    const items = fixture.nativeElement.querySelectorAll('li')
    expect(Array.from(items).map((li: any) => li.textContent.trim())).toEqual([
      'name is invalid',
      'id is taken',
    ])
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

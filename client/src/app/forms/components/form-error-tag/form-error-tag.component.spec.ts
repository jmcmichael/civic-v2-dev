import { Component, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { CvcFormSubmissionStatusDisplayComponent } from '@app/forms/components/form-submission-status-display/form-submission-status-display.component'
import {
  FormMutationState,
  FormSubmissionError,
} from '@app/forms/utilities/form-mutation'
import { By } from '@angular/platform-browser'
import { NzModalService } from 'ng-zorro-antd/modal'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CvcFormErrorTagComponent } from './form-error-tag.component'

function makeState() {
  const isSubmitting = signal(false)
  const success = signal(false)
  const errors = signal<FormSubmissionError[]>([])
  const state: FormMutationState = { isSubmitting, success, errors }
  return { state, errors }
}

@Component({
  template: `<cvc-form-error-tag [variant]="variant" />`,
  imports: [CvcFormErrorTagComponent],
})
class HostComponent {
  variant: 'tag' | 'alert' = 'tag'
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

  it('labels with the first error code and message', () => {
    errors.set([
      {
        category: 'graphql',
        code: 'VALIDATION_FAILED',
        message: 'name is invalid',
      },
    ])
    fixture.detectChanges()
    const tag = fixture.nativeElement.querySelector('nz-tag')
    expect(tag.textContent).toContain('VALIDATION_FAILED: name is invalid')
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
    expect(alert.textContent).toContain('502: Bad gateway')
  })

  it('opens the details modal from the alert action button', () => {
    fixture.componentInstance.variant = 'alert'
    errors.set([
      {
        category: 'graphql',
        code: 'VALIDATION_FAILED',
        message: 'name is invalid',
        log: '{ "message": "name is invalid" }',
      },
    ])
    fixture.detectChanges()
    // NzModalService is provided by the component's own NzModalModule
    // import, so spy on that instance rather than a TestBed-level mock
    const tagDe = fixture.debugElement.query(
      By.directive(CvcFormErrorTagComponent)
    )
    const modal = tagDe.injector.get(NzModalService)
    const create = vi.spyOn(modal, 'create').mockReturnValue(undefined as never)
    const button = fixture.nativeElement.querySelector(
      '.ant-alert-action button'
    )
    expect(button.textContent).toContain('Details')
    button.click()
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ nzTitle: 'Submission Error Details' })
    )
  })

  it('counts additional errors beyond the first', () => {
    errors.set([
      { category: 'graphql', message: 'first' },
      { category: 'graphql', message: 'second' },
      { category: 'network', message: 'third' },
    ])
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('nz-tag').textContent).toContain(
      '(+2 more)'
    )
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
    errors.set([{ category: 'browser', message: 'boom' }])
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('nz-tag')).toBeTruthy()
    errors.set([])
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('nz-tag')).toBeFalsy()
  })
})

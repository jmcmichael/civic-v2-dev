import { Component, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormSubmissionError } from '@app/core/utilities/submission-errors'
import { beforeEach, describe, expect, it } from 'vitest'
import { CvcErrorListComponent } from './error-list.component'

const ERRORS: FormSubmissionError[] = [
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
]

@Component({
  template: `<cvc-error-list
    [errors]="errors()"
    [mode]="mode"
    [expandAll]="expandAll()" />`,
  imports: [CvcErrorListComponent],
})
class HostComponent {
  errors = signal<FormSubmissionError[]>(ERRORS)
  mode: 'collapse' | 'list' = 'collapse'
  expandAll = signal(false)
}

describe('CvcErrorListComponent', () => {
  let fixture: ComponentFixture<HostComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] })
    fixture = TestBed.createComponent(HostComponent)
  })

  it('renders collapse panels with chips, code tags and a copy affordance', () => {
    fixture.detectChanges()
    const panels = fixture.nativeElement.querySelectorAll('nz-collapse-panel')
    expect(panels.length).toBe(2)
    expect(panels[0].textContent).toContain('graphql')
    expect(panels[0].querySelector('nz-tag.code-chip')?.textContent).toContain(
      'VALIDATION_FAILED'
    )
    expect(panels[0].querySelector('.copy-icon')).toBeTruthy()
  })

  it('expands every panel when expandAll is set', () => {
    fixture.detectChanges()
    expect(
      fixture.nativeElement.querySelectorAll('.ant-collapse-item-active').length
    ).toBe(0)
    fixture.componentInstance.expandAll.set(true)
    fixture.detectChanges()
    expect(
      fixture.nativeElement.querySelectorAll('.ant-collapse-item-active').length
    ).toBe(2)
  })

  it('renders list items whose details toggle open and closed', () => {
    fixture.componentInstance.mode = 'list'
    fixture.detectChanges()
    const items = fixture.nativeElement.querySelectorAll('nz-list-item')
    expect(items.length).toBe(2)
    expect(items[0].querySelector('.error-detail')).toBeFalsy()
    const toggle = items[0].querySelector('button.details-toggle')
    toggle.click()
    fixture.detectChanges()
    expect(
      fixture.nativeElement
        .querySelectorAll('nz-list-item')[0]
        .querySelector('.error-detail')
    ).toBeTruthy()
  })

  it('auto-expands a single error in list mode', () => {
    fixture.componentInstance.mode = 'list'
    fixture.componentInstance.errors.set([ERRORS[1]])
    fixture.detectChanges()
    expect(
      fixture.nativeElement.querySelector('nz-list-item .error-detail')
    ).toBeTruthy()
    // the raw log renders when there is no json payload
    expect(
      fixture.nativeElement.querySelector('pre.error-log')?.textContent
    ).toContain('HTTP 502')
  })
})

import { SettingOutline } from '@ant-design/icons-angular/icons'
import { Component, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { EventFeedMode } from '@app/generated/civic.apollo.types'
import { provideNzIcons } from 'ng-zorro-antd/icon'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ActivityStreamScope,
  ActivityStreamSettings,
} from '../activity-stream.types'
import { CvcActivityStreamSettings } from './activity-stream-settings.component'

@Component({
  template: `<cvc-activity-stream-settings
    [(cvcSettings)]="settings"
    [cvcScope]="scope" />`,
  imports: [CvcActivityStreamSettings],
})
class HostComponent {
  readonly settings = signal<ActivityStreamSettings>({
    first: 50,
    includeAutomatedEvents: false,
    showOrganization: true,
  })
  readonly scope: ActivityStreamScope = { mode: EventFeedMode.Unscoped }
}

describe('CvcActivityStreamSettings', () => {
  let fixture: ComponentFixture<HostComponent>
  let host: HostComponent

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideNoopAnimations(), provideNzIcons([SettingOutline])],
    })
    fixture = TestBed.createComponent(HostComponent)
    host = fixture.componentInstance
    fixture.autoDetectChanges()
  })

  function button(): HTMLButtonElement {
    return (fixture.nativeElement as HTMLElement).querySelector(
      'button[nz-popover]'
    ) as HTMLButtonElement
  }

  it('renders the gear button', () => {
    expect(button()).toBeTruthy()
    expect(button().querySelector('[nztype="setting"]')).toBeTruthy()
  })

  it('opens a popover listing both settings controls', async () => {
    button().click()

    await vi.waitFor(() => {
      const popover = document.querySelector('.popover-content')
      expect(popover).toBeTruthy()
      expect(popover!.textContent).toContain('Include Automated Events')
      expect(popover!.textContent).toContain('Show Organization')
      expect(popover!.querySelectorAll('label[nz-checkbox]')).toHaveLength(2)
    })
  })

  it('emits each edit as a new settings object, preserving page size', async () => {
    button().click()
    await vi.waitFor(() =>
      expect(document.querySelector('.popover-content')).toBeTruthy()
    )
    const before = host.settings()

    const box = document.querySelector(
      '.popover-content input[type="checkbox"]'
    ) as HTMLInputElement
    box.click()

    await vi.waitFor(() =>
      expect(host.settings().includeAutomatedEvents).toBe(true)
    )
    expect(host.settings()).not.toBe(before)
    expect(host.settings().first).toBe(50)
    expect(before.includeAutomatedEvents).toBe(false)
  })
})

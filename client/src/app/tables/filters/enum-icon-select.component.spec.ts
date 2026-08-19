import { ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { TABLE_ICONS } from '@app/testing/entity-table.harness'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzSelectComponent } from 'ng-zorro-antd/select'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CvcEnumOption } from '../entity-table.types'
import { CvcEnumIconSelectComponent } from './enum-icon-select.component'

/**
 * The always-visible glyph select, mounted directly. The option list only
 * renders inside an open CDK overlay, which jsdom cannot lay out — grouped
 * option partitioning is `groupEnumOptions`' contract, asserted in the
 * enum-filter-menu spec. What renders synchronously is the collapsed
 * state: the 'All' prompt, the selected value's icon-only rendering, and
 * the clear affordance's null emission.
 */

const OPTIONS: CvcEnumOption<string>[] = [
  { label: 'Supports', value: 'SUPPORTS' },
  { label: 'Does Not Support', value: 'DOES_NOT_SUPPORT' },
]

describe('cvc-enum-icon-select', () => {
  let fixture: ComponentFixture<CvcEnumIconSelectComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CvcEnumIconSelectComponent, NzIconModule.forRoot(TABLE_ICONS)],
    }).compileComponents()
    fixture = TestBed.createComponent(CvcEnumIconSelectComponent)
  })

  // ngModel writes its first value on a resolved microtask, so the
  // collapsed rendering needs a stability flush before it exists
  async function mount(
    selected: string | null = null,
    showIcons = true
  ): Promise<HTMLElement> {
    fixture.componentRef.setInput('options', OPTIONS)
    fixture.componentRef.setInput('selected', selected)
    fixture.componentRef.setInput('showIcons', showIcons)
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
    return fixture.nativeElement as HTMLElement
  }

  it('prompts All when nothing is selected', async () => {
    const el = await mount()
    expect(
      el.querySelector('.ant-select-selection-placeholder')?.textContent
    ).toContain('All')
    expect(el.querySelector('.ant-select-selection-item')).toBeNull()
  })

  it('collapses a selection to its icon, label in the tooltip', async () => {
    const el = await mount('SUPPORTS')
    const item = el.querySelector('.ant-select-selection-item')
    const icon = item?.querySelector('[nz-icon]')
    expect(icon).toBeTruthy()
    expect(item?.textContent?.trim()).toBe('') // glyph only, no label text
  })

  it('falls back to the label text when the enum has no icon set', async () => {
    const el = await mount('SUPPORTS', false)
    const item = el.querySelector('.ant-select-selection-item')
    expect(item?.querySelector('[nz-icon]')).toBeNull()
    expect(item?.textContent).toContain('Supports')
  })

  it('emits null on clear, never undefined', async () => {
    await mount('SUPPORTS')
    const emitted = vi.fn()
    fixture.componentInstance.selectedChange.subscribe(emitted)
    // nz-select's clear control emits undefined through ngModelChange; the
    // filter map's cleared state is null (see onFilterChange)
    fixture.debugElement
      .query(By.directive(NzSelectComponent))
      .triggerEventHandler('ngModelChange', undefined)
    expect(emitted).toHaveBeenCalledWith(null)
  })

  it('renders no arrow — the prompt itself is the affordance', async () => {
    const el = await mount('SUPPORTS')
    expect(el.querySelector('nz-select-arrow')).toBeNull()
  })
})

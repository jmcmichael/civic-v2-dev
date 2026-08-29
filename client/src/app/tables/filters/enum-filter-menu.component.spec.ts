import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TABLE_ICONS } from '@app/testing/entity-table.harness'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { beforeEach, describe, expect, it } from 'vitest'
import { CvcEnumOption } from '../entity-table.types'
import { groupEnumOptions } from '../enum-filter-options'
import { CvcEnumFilterMenuComponent } from './enum-filter-menu.component'

/**
 * The funnel dropdown's menu, mounted directly — its host `nz-dropdown-menu`
 * only instantiates inside an open overlay, which jsdom cannot lay out, but
 * the menu itself renders synchronously. Grouped rendering is asserted here
 * for both controls' shared shape (`groupEnumOptions`); the select control
 * reuses the same partition via `nz-option-group`, whose DOM only exists in
 * an open select overlay.
 */

const GROUPED: CvcEnumOption<string>[] = [
  {
    label: 'Sensitivity/Response',
    value: 'SENSITIVITYRESPONSE',
    group: 'Predictive',
  },
  { label: 'Resistance', value: 'RESISTANCE', group: 'Predictive' },
  { label: 'N/A', value: 'NA', group: 'Predictive' },
  { label: 'Better Outcome', value: 'BETTER_OUTCOME', group: 'Prognostic' },
  { label: 'N/A', value: 'NA', group: 'Prognostic' },
]

const FLAT: CvcEnumOption<string>[] = [
  { label: 'Curated', value: 'CURATED' },
  { label: 'New', value: 'NEW' },
]

describe('groupEnumOptions', () => {
  it('partitions contiguous groups in declaration order', () => {
    expect(groupEnumOptions(GROUPED)).toEqual([
      { title: 'Predictive', options: GROUPED.slice(0, 3) },
      { title: 'Prognostic', options: GROUPED.slice(3) },
    ])
  })

  it('yields a single untitled section for ungrouped options', () => {
    expect(groupEnumOptions(FLAT)).toEqual([{ title: null, options: FLAT }])
  })

  it('keeps an ungrouped run between groups as its own section', () => {
    const mixed = [GROUPED[0], FLAT[0], GROUPED[3]]
    expect(groupEnumOptions(mixed).map((g) => g.title)).toEqual([
      'Predictive',
      null,
      'Prognostic',
    ])
  })
})

describe('cvc-enum-filter-menu', () => {
  let fixture: ComponentFixture<CvcEnumFilterMenuComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CvcEnumFilterMenuComponent, NzIconModule.forRoot(TABLE_ICONS)],
    }).compileComponents()
    fixture = TestBed.createComponent(CvcEnumFilterMenuComponent)
  })

  function mount(
    options: CvcEnumOption<string>[],
    selected: string | null = null
  ): HTMLElement {
    fixture.componentRef.setInput('options', options)
    fixture.componentRef.setInput('selected', selected)
    // icon coverage for the values is the config's concern, not this menu's
    fixture.componentRef.setInput('showIcons', false)
    fixture.detectChanges()
    return fixture.nativeElement as HTMLElement
  }

  // in a live table the menu sits inside nz-dropdown-menu and these classes
  // carry an ant-dropdown- prefix; mounted directly it renders in plain menu
  // mode, so the selectors accept either
  const GROUP_TITLE =
    '.ant-menu-item-group-title, .ant-dropdown-menu-item-group-title'
  const GROUP_LIST =
    '.ant-menu-item-group-list, .ant-dropdown-menu-item-group-list'
  const SELECTED =
    'li[nz-menu-item].ant-menu-item-selected, li[nz-menu-item].ant-dropdown-menu-item-selected'

  it('renders grouped options under nz-menu-group headings', () => {
    const el = mount(GROUPED)

    const titles = Array.from(el.querySelectorAll(GROUP_TITLE)).map((t) =>
      t.textContent?.trim()
    )
    expect(titles).toEqual(['Predictive', 'Prognostic'])

    const groups = el.querySelectorAll(GROUP_LIST)
    expect(groups[0].querySelectorAll('li[nz-menu-item]')).toHaveLength(3)
    expect(groups[1].querySelectorAll('li[nz-menu-item]')).toHaveLength(2)
  })

  it('renders ungrouped options flat, with no group headings', () => {
    const el = mount(FLAT)

    expect(el.querySelector(GROUP_TITLE)).toBeNull()
    expect(el.querySelectorAll('li[nz-menu-item]')).toHaveLength(2)
  })

  it('marks every occurrence of a value repeated across groups as selected', () => {
    const el = mount(GROUPED, 'NA')

    const selected = Array.from(el.querySelectorAll(SELECTED)).map((li) =>
      li.getAttribute('aria-label')
    )
    expect(selected).toEqual(['N/A', 'N/A'])
  })

  it('emits the shared value whichever group it is chosen from', () => {
    const el = mount(GROUPED)
    const emitted: unknown[] = []
    fixture.componentInstance.selectedChange.subscribe((v) => emitted.push(v))

    const items = el.querySelectorAll('li[nz-menu-item]')
    ;(items[4] as HTMLElement).click() // Prognostic's N/A

    expect(emitted).toEqual(['NA'])
  })
})

describe('cvc-enum-filter-menu, multiple', () => {
  let fixture: ComponentFixture<CvcEnumFilterMenuComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CvcEnumFilterMenuComponent, NzIconModule.forRoot(TABLE_ICONS)],
    }).compileComponents()
    fixture = TestBed.createComponent(CvcEnumFilterMenuComponent)
  })

  function mount(selected: string[] | null = null): HTMLElement {
    fixture.componentRef.setInput('options', FLAT)
    fixture.componentRef.setInput('selected', selected)
    fixture.componentRef.setInput('showIcons', false)
    fixture.componentRef.setInput('multiple', true)
    fixture.componentRef.setInput('open', true)
    fixture.detectChanges()
    return fixture.nativeElement as HTMLElement
  }

  function items(el: HTMLElement): HTMLElement[] {
    return Array.from(el.querySelectorAll('li[nz-menu-item]'))
  }

  function emissions(): unknown[] {
    const seen: unknown[] = []
    fixture.componentInstance.selectedChange.subscribe((v) => seen.push(v))
    return seen
  }

  it('holds the selection until OK, then emits it as an array', () => {
    const el = mount()
    const emitted = emissions()

    items(el)[0].click()
    items(el)[1].click()
    fixture.detectChanges()
    expect(emitted).toEqual([])

    el.querySelector<HTMLElement>('[data-testid="filter-apply"]')!.click()
    expect(emitted).toEqual([['CURATED', 'NEW']])
  })

  it('toggles a value back off, and an emptied selection clears the filter', () => {
    const el = mount(['CURATED'])
    const emitted = emissions()

    items(el)[0].click()
    fixture.detectChanges()
    el.querySelector<HTMLElement>('[data-testid="filter-apply"]')!.click()

    expect(emitted).toEqual([null])
  })

  it('shows the committed values checked when the dropdown opens', () => {
    const el = mount(['NEW'])

    const checked = items(el).map(
      (li) =>
        li.classList.contains('ant-menu-item-selected') ||
        li.classList.contains('ant-dropdown-menu-item-selected')
    )
    expect(checked).toEqual([false, true])
  })

  it('discards an abandoned draft when the dropdown reopens', () => {
    const el = mount(['NEW'])

    items(el)[0].click() // adds CURATED to the draft
    fixture.detectChanges()
    fixture.componentRef.setInput('open', false)
    fixture.detectChanges()
    fixture.componentRef.setInput('open', true)
    fixture.detectChanges()

    const emitted = emissions()
    el.querySelector<HTMLElement>('[data-testid="filter-apply"]')!.click()
    expect(emitted).toEqual([['NEW']])
  })

  it('offers no OK button in single-select mode', () => {
    fixture.componentRef.setInput('options', FLAT)
    fixture.componentRef.setInput('showIcons', false)
    fixture.detectChanges()
    const el = fixture.nativeElement as HTMLElement
    expect(el.querySelector('[data-testid="filter-apply"]')).toBeNull()
  })
})

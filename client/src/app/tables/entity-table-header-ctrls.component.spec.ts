import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TABLE_ICONS } from '@app/testing/entity-table.harness'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { BehaviorSubject } from 'rxjs'
import { beforeEach, describe, expect, it } from 'vitest'
import { CvcEntityTableHeaderCtrlsComponent } from './entity-table-header-ctrls.component'

/**
 * The action bar mounted directly, with the CDK breakpoint stream
 * stubbed: jsdom has no real viewport, so the narrow/wide switch is
 * driven by hand. Popover CONTENT is the host table's concern — only the
 * trigger buttons and their label modes render here.
 */
describe('cvc-entity-table-header-ctrls', () => {
  let fixture: ComponentFixture<CvcEntityTableHeaderCtrlsComponent>
  let narrow: BehaviorSubject<BreakpointState>

  beforeEach(async () => {
    narrow = new BehaviorSubject<BreakpointState>({
      matches: false,
      breakpoints: {},
    })
    await TestBed.configureTestingModule({
      imports: [
        CvcEntityTableHeaderCtrlsComponent,
        NzIconModule.forRoot(TABLE_ICONS),
      ],
      providers: [
        { provide: BreakpointObserver, useValue: { observe: () => narrow } },
      ],
    }).compileComponents()
    fixture = TestBed.createComponent(CvcEntityTableHeaderCtrlsComponent)
    fixture.detectChanges()
  })

  const el = () => fixture.nativeElement as HTMLElement

  it('renders both trigger buttons, labeled, in one compact group', () => {
    const group = el().querySelector('nz-space-compact')
    expect(group).toBeTruthy()
    const filters = el().querySelector('[data-testid="table-filters-trigger"]')
    const settings = el().querySelector('[data-testid="column-prefs-trigger"]')
    expect(filters?.textContent).toContain('Filters')
    expect(settings?.textContent).toContain('Settings')
  })

  it('drops to icon-only below the sm breakpoint, and back', () => {
    expect(el().classList.contains('labels-hidden')).toBe(false)

    narrow.next({ matches: true, breakpoints: {} })
    fixture.detectChanges()
    expect(el().classList.contains('labels-hidden')).toBe(true)

    narrow.next({ matches: false, breakpoints: {} })
    fixture.detectChanges()
    expect(el().classList.contains('labels-hidden')).toBe(false)
  })

  it('lights the funnel glyph when filters are applied', () => {
    fixture.componentRef.setInput('filtersApplied', true)
    fixture.detectChanges()
    expect(
      el().querySelector(
        '[data-testid="table-filters-trigger"] .filters-applied'
      )
    ).toBeTruthy()
  })
})

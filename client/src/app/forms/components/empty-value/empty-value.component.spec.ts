import { ComponentFixture, TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it } from 'vitest'
import { EmptyValueComponent } from './empty-value.component'
import { CvcEmptyValueModule } from './empty-value.module'

/**
 * Pins the empty-value vocabulary: each of the three categories renders a
 * distinct label in both display modes, and carries exactly one tooltip.
 *
 * The three categories are not interchangeable — `not-applicable` means the
 * field does not apply to this entity, `unspecified` means a legitimately
 * absent value, and `invalid` is an error state requiring curation. Labels
 * that read as synonyms of each other defeat the distinction, so they are
 * asserted here rather than left to the template.
 */
describe('cvc-empty-value', () => {
  let fixture: ComponentFixture<EmptyValueComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CvcEmptyValueModule],
    }).compileComponents()
    fixture = TestBed.createComponent(EmptyValueComponent)
  })

  const render = (
    category: EmptyValueComponent['cvcEmptyCategory'],
    mode: EmptyValueComponent['cvcDisplayMode'] = 'default'
  ): HTMLElement => {
    fixture.componentInstance.cvcEmptyCategory = category
    fixture.componentInstance.cvcDisplayMode = mode
    fixture.detectChanges()
    return fixture.nativeElement as HTMLElement
  }

  const text = (el: HTMLElement) => el.textContent?.trim().replace(/\s+/g, ' ')

  describe('default display mode', () => {
    it.each([
      ['not-applicable', 'Not applicable'],
      ['unspecified', 'Not specified'],
      ['invalid', 'Invalid'],
    ] as const)('%s renders %s', (category, label) => {
      expect(text(render(category))).toBe(label)
    })

    it('gives every category a distinct label', () => {
      const labels = (
        ['not-applicable', 'unspecified', 'invalid'] as const
      ).map((category) => text(render(category)))
      expect(new Set(labels).size).toBe(labels.length)
    })
  })

  describe('small display mode', () => {
    it.each([
      ['not-applicable', 'N/A'],
      ['invalid', '!?'],
    ] as const)('%s renders %s', (category, label) => {
      expect(text(render(category, 'small'))).toBe(label)
    })

    it('unspecified renders the en-dash pair', () => {
      expect(text(render('unspecified', 'small'))).toBe('– –')
    })
  })

  it.each([
    ['not-applicable', 'Value is not applicable'],
    ['unspecified', 'Value is unspecified'],
    ['invalid', 'Error: value requires specification'],
  ] as const)('%s describes itself in its tooltip', (category, title) => {
    const span = render(category).querySelector('span')
    expect(span?.getAttribute('nzTooltipTitle')).toBe(title)
    expect(span?.classList.contains(category)).toBe(true)
  })

  it('defaults to not-applicable', () => {
    fixture.detectChanges()
    expect(text(fixture.nativeElement as HTMLElement)).toBe('Not applicable')
  })
})

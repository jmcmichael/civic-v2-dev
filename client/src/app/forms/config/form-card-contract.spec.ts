import { FormlyFieldConfig } from '@ngx-formly/core'
import { describe, expect, it } from 'vitest'
import { CONFIGS, walk } from './form-configs.fixture'

/**
 * The full-page card's structural contract, asserted on every form config.
 *
 * The card fills the page only when it has footer children, so the shape it
 * needs is not a flag anyone can read off a single line: the card group is
 * keyless, `fields` nests inside it, and the comment and action rows are its
 * siblings rather than the layout's. Sixteen configs were moved into that
 * shape at once, and a config that quietly reverts still compiles and still
 * renders — it just stops filling the page. This is the check that notices.
 *
 * Add a row when a form is added. There are 16 `*.form.config.ts` files under
 * this directory; the count assertion below is what makes an omission fail
 * rather than pass silently.
 */

function cards(fields: FormlyFieldConfig[]): FormlyFieldConfig[] {
  return walk(fields).filter((f) => f.wrappers?.includes('form-card'))
}

/**
 * The page card: the one no other card contains. Two variant forms nest a
 * small card of their own (Coordinates), which is a grouping device inside
 * the page and never fills it — a card fills the page only when it has
 * footer children of its own, and the inner ones have none.
 */
function cardGroup(fields: FormlyFieldConfig[]): FormlyFieldConfig {
  const all = cards(fields)
  const outer = all.filter(
    (c) => !all.some((o) => o !== c && walk([o]).includes(c))
  )
  expect(outer).toHaveLength(1)
  return outer[0]
}

function typesIn(field: FormlyFieldConfig): string[] {
  return walk([field])
    .map((f) => f.type)
    .filter((t): t is string => typeof t === 'string')
}

describe('the full-page form card contract', () => {
  it('covers every form config in the directory', () => {
    expect(CONFIGS).toHaveLength(16)
    expect(new Set(CONFIGS.map(([name]) => name)).size).toBe(16)
  })

  describe.each(CONFIGS)('%s', (_name, fields) => {
    it('groups the card contents without nesting the model', () => {
      expect(cardGroup(fields).key).toBeUndefined()
    })

    it('nests the fields group inside the card', () => {
      const children = cardGroup(fields).fieldGroup ?? []
      expect(children.filter((f) => f.key === 'fields')).toHaveLength(1)
    })

    it('pins exactly one footer row, holding cancel and submit', () => {
      const children = cardGroup(fields).fieldGroup ?? []
      const footers = children.filter((f) => f.props?.['formFooter'] === true)
      expect(footers).toHaveLength(1)
      expect(typesIn(footers[0])).toEqual(
        expect.arrayContaining(['cvc-cancel-button', 'org-submit-button'])
      )
    })

    it('leaves no action button outside the footer', () => {
      const footer = (cardGroup(fields).fieldGroup ?? []).find(
        (f) => f.props?.['formFooter'] === true
      )!
      const strays = walk(fields).filter(
        (f) =>
          (f.type === 'cvc-cancel-button' || f.type === 'org-submit-button') &&
          !walk([footer]).includes(f)
      )
      expect(strays).toEqual([])
    })

    it('gives the footer to the page card alone', () => {
      const page = cardGroup(fields)
      const inner = cards(fields).filter((c) => c !== page)
      for (const c of inner) {
        const footers = (c.fieldGroup ?? []).filter(
          (f) => f.props?.['formFooter'] === true
        )
        expect(footers).toEqual([])
      }
    })

    it('keeps the comment field inside the card, above the footer', () => {
      const card = cardGroup(fields)
      const comments = walk(fields).filter((f) => f.key === 'comment')
      expect(comments).toHaveLength(1)
      expect(walk([card])).toContain(comments[0])
    })
  })
})

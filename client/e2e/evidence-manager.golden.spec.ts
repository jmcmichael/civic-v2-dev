import { Page, expect, test } from '@playwright/test'

/**
 * Golden specs for the evidence manager: end-to-end behaviour against a real
 * browser and dev server, addressed through the `data-testid` contract rather
 * than DOM shape — the shape is what refactors change, so do not reintroduce
 * structural selectors here.
 *
 * Unauthenticated on purpose: /assertions/add renders its form without a
 * session, so this runs on a fresh checkout. (Its sibling /variant-groups/add
 * does NOT — it gates in the component body with "You must be logged in to
 * view this page" — so variant-manager goldens would need a storageState
 * captured via `yarn e2e:auth`; none exist yet.)
 */

const FILTERED_COUNT = /of ([\d,]+) displayed/

async function openManager(page: Page) {
  await page.goto('/assertions/add')
  const managerButton = page.getByRole('button', { name: /manager/i })
  await expect(managerButton).toBeVisible({ timeout: 30_000 })
  await managerButton.click()

  const table = page.getByTestId('entity-table')
  await expect(table).toBeVisible()
  await expect(page.getByTestId('row').first()).toBeVisible({ timeout: 30_000 })
  return table
}

/** the "N of M displayed" readout's M, i.e. how many rows the query matched */
async function filteredCount(page: Page): Promise<number> {
  const text = await page.getByTestId('row-count').innerText()
  const match = text.match(FILTERED_COUNT)
  expect(match, `could not parse a filtered count from "${text}"`).toBeTruthy()
  return Number(match![1].replace(/,/g, ''))
}

function filterInput(page: Page, column: string) {
  return page
    .locator(`[data-testid="column-filter"][data-column="${column}"]`)
    .locator('input')
}

test('opens with rows and a count readout', async ({ page }) => {
  await openManager(page)

  await expect(page.getByTestId('row').first()).toBeVisible()
  expect(await filteredCount(page)).toBeGreaterThan(0)
})

test('a text column filter narrows the result set', async ({ page }) => {
  await openManager(page)
  const before = await filteredCount(page)

  await filterInput(page, 'disease').fill('Leukemia')

  await expect
    .poll(() => filteredCount(page), { timeout: 20_000 })
    .toBeLessThan(before)
})

/**
 * Asserts rows actually reorder, not merely that the sorter control responds
 * — the two have come apart before (a sorter that sent an unmapped column
 * failed the query while the control still toggled).
 */
test('sorting reorders rows', async ({ page }) => {
  await openManager(page)

  const firstRowId = () =>
    page.getByTestId('row').first().getAttribute('data-row-id')
  const initial = await firstRowId()

  // the Evidence column defaults to ascending; one click flips it. ng-zorro
  // makes the whole th clickable rather than rendering a button role.
  await page.locator('[data-testid="column-header"][data-column="id"]').click()

  await expect.poll(firstRowId, { timeout: 20_000 }).not.toBe(initial)
})

/**
 * Asserts infinite scroll actually pages past the first response. The "N" of
 * "N of M displayed" rises only if fetchMore merged new edges into the
 * connection.
 */
test('scrolling to the bottom fetches more rows', async ({ page }) => {
  await openManager(page)

  const loaded = async () => {
    const text = await page.getByTestId('row-count').innerText()
    return Number(text.match(/^([\d,]+) of/)![1].replace(/,/g, ''))
  }
  const before = await loaded()

  // Scroll in steps with pauses: each page must arrive and extend
  // scrollHeight before the next step can reach the new bottom, and stepping
  // also exercises the throttled scroll-phase pipeline the way a user does.
  // (Bottom detection itself fires on the current offset, so even a single
  // jump would trigger the first fetch.)
  const viewport = page.locator('cdk-virtual-scroll-viewport').first()
  for (let i = 0; i < 12; i++) {
    await viewport.evaluate((el, step) => {
      el.scrollTop = Math.min(el.scrollTop + step, el.scrollHeight)
    }, 400)
    await page.waitForTimeout(300)
  }

  expect(await loaded()).toBeGreaterThan(before)
})

test('hiding a column via the preferences panel removes its header', async ({
  page,
}) => {
  await openManager(page)
  const diseaseHeader = page.locator(
    '[data-testid="column-header"][data-column="disease"]'
  )
  await expect(diseaseHeader).toBeVisible()

  await page.getByTestId('column-prefs-trigger').click()
  const panel = page.getByTestId('column-prefs-panel')
  await expect(panel).toBeVisible()
  await panel.getByLabel('Disease', { exact: true }).uncheck()

  await expect(diseaseHeader).toHaveCount(0)
})

/**
 * Guards the reset button's full contract: a reset must clear the query AND
 * the filter inputs. The two can disagree whenever a filter's value has more
 * than one home — a config object the inputs read and a subject the query
 * reads — which made this exact button read as inert once.
 */
test('reset clears both the query and the filter inputs', async ({ page }) => {
  await openManager(page)
  const unfiltered = await filteredCount(page)

  const disease = filterInput(page, 'disease')
  await disease.fill('Leukemia')
  await expect
    .poll(() => filteredCount(page), { timeout: 20_000 })
    .toBeLessThan(unfiltered)

  await page.getByTestId('filter-reset').click()

  await expect
    .poll(() => filteredCount(page), { timeout: 20_000 })
    .toBe(unfiltered)
  await expect(disease).toHaveValue('')
})

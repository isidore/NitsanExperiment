import { expect, test } from '@playwright/test'
import { addEvent, dayOfThisWeek, eventIn, expectFeedEmpty } from './helpers'

test('add an event and see it on the calendar', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('week-view')).toBeVisible()
  await expectFeedEmpty(page)

  const thursday = dayOfThisWeek(4)
  await addEvent(page, { title: 'Team lunch', day: thursday, hour: 12, who: 'Antonio', going: 'Dana' })

  const block = eventIn(page, thursday, 'Team lunch')
  await expect(block).toBeVisible()
  await expect(block).toHaveAttribute('data-hour', '12')
  await expect(block).toHaveCSS('background-color', 'rgb(47, 111, 219)')
  await expect(block.getByTestId('attendee-avatar')).toHaveText(['D'])

  await expect(page.getByTestId('feed')).toContainText('Antonio added Team lunch')
  await expect(page.getByTestId('toast')).toContainText('"Team lunch" added')
  await expect(page.getByTestId('toast')).toHaveClass(/show/)

  await page.reload()
  const afterReload = eventIn(page, thursday, 'Team lunch')
  await expect(afterReload).toBeVisible()
  await expect(afterReload).toHaveAttribute('data-hour', '12')
  await expect(page.getByTestId('feed')).toContainText('Team lunch')
})

test('what one person adds, another sees', async ({ browser }) => {
  const llewellynContext = await browser.newContext()
  const antonioContext = await browser.newContext()
  const llewellyn = await llewellynContext.newPage()
  const antonio = await antonioContext.newPage()

  await llewellyn.goto('/')
  await antonio.goto('/')
  await expect(llewellyn.getByTestId('week-view')).toBeVisible()
  await expect(antonio.getByTestId('week-view')).toBeVisible()

  const saturday = dayOfThisWeek(6)
  await addEvent(llewellyn, { title: 'Austin City Limits', day: saturday, hour: 18, who: 'Llewellyn' })
  await expect(eventIn(llewellyn, saturday, 'Austin City Limits')).toBeVisible()

  // Antonio does not reload: the app polls every 3s.
  const seen = eventIn(antonio, saturday, 'Austin City Limits')
  await expect(seen).toBeVisible({ timeout: 10_000 })
  await expect(seen).toHaveAttribute('data-hour', '18')
  await expect(seen).toHaveCSS('background-color', 'rgb(201, 100, 66)')

  for (const page of [llewellyn, antonio]) {
    await expect(page.locator('[data-test="member"][aria-label="Llewellyn"]')).toBeVisible()
  }

  await llewellynContext.close()
  await antonioContext.close()
})

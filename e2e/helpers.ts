import { expect, type Page } from '@playwright/test'

// The week view starts on Sunday; offset 4 = Thursday, 6 = Saturday of the current week.
export function dayOfThisWeek(offset: number): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + offset)
}

const pad = (n: number) => String(n).padStart(2, '0')
export const isoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
// Value for an <input type="datetime-local">
export const localDateTime = (d: Date, hour: number) => `${isoDay(d)}T${pad(hour)}:00`

export async function addEvent(
  page: Page,
  e: { title: string; day: Date; hour: number; who: string; going?: string },
) {
  await page.getByLabel('Title').fill(e.title)
  await page.getByLabel('When').fill(localDateTime(e.day, e.hour))
  await page.getByLabel('Your name').fill(e.who)
  await page.getByLabel("Who's going").fill(e.going ?? '')
  await page.getByRole('button', { name: 'Add to shared calendar' }).click()
}

export function eventIn(page: Page, day: Date, title: string) {
  return page
    .locator(`[data-test="day-column"][data-day="${isoDay(day)}"]`)
    .locator('[data-test="event"]', { hasText: title })
}

export async function expectFeedEmpty(page: Page) {
  await expect(page.getByTestId('feed')).toHaveText('No events yet.')
}

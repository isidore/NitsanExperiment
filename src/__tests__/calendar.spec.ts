import { describe, it, expect } from 'vitest'
import { SharedCalendar } from '../calendar'

describe('SharedCalendar', () => {
  it('an event one member adds is visible to everyone in the group', () => {
    const calendar = new SharedCalendar()
    const lunch = new Date(2026, 9, 15, 12, 0)

    calendar.add({ title: 'Team lunch', start: lunch, addedBy: 'Antonio' })

    expect(calendar.eventsOn(lunch)).toEqual([
      { title: 'Team lunch', start: lunch, addedBy: 'Antonio' },
    ])
  })
})

import { describe, it, expect } from 'vitest'
import { SharedCalendar, weekOf } from '../calendar'

describe('SharedCalendar', () => {
  it('an event one member adds is visible to everyone in the group', () => {
    const calendar = new SharedCalendar()
    const lunch = new Date(2026, 9, 15, 12, 0)

    calendar.add({ title: 'Team lunch', start: lunch, addedBy: 'Antonio', attendees: [] })

    expect(calendar.eventsOn(lunch)).toEqual([
      { title: 'Team lunch', start: lunch, addedBy: 'Antonio', attendees: [] },
    ])
  })
})

describe('weekOf', () => {
  it('lays out the week Sunday to Saturday with each event on its day', () => {
    const calendar = new SharedCalendar()
    const acl = new Date(2026, 9, 17, 18, 0)
    calendar.add({ title: 'Austin City Limits', start: acl, addedBy: 'Llewellyn', attendees: [] })

    const week = weekOf(calendar, new Date(2026, 9, 15))

    expect(week.map((d) => d.date.getDate())).toEqual([11, 12, 13, 14, 15, 16, 17])
    expect(week[6]!.events.map((e) => e.title)).toEqual(['Austin City Limits'])
    expect(week.slice(0, 6).every((d) => d.events.length === 0)).toBe(true)
  })
})

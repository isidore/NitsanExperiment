export interface CalendarEvent {
  title: string
  start: Date
  addedBy: string
}

export class SharedCalendar {
  private events: CalendarEvent[] = []

  add(event: CalendarEvent): void {
    this.events.push(event)
  }

  eventsOn(day: Date): CalendarEvent[] {
    return this.events.filter((e) => e.start.toDateString() === day.toDateString())
  }

  replaceAll(events: CalendarEvent[]): void {
    this.events = [...events]
  }

  all(): CalendarEvent[] {
    return [...this.events].sort((a, b) => a.start.getTime() - b.start.getTime())
  }
}

export interface Day {
  date: Date
  events: CalendarEvent[]
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  d.setDate(d.getDate() - d.getDay())
  return d
}

export function weekOf(calendar: SharedCalendar, date: Date): Day[] {
  const first = startOfWeek(date)
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(first.getFullYear(), first.getMonth(), first.getDate() + i)
    return { date: day, events: calendar.eventsOn(day) }
  })
}

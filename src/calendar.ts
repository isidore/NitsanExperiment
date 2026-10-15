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

  all(): CalendarEvent[] {
    return [...this.events].sort((a, b) => a.start.getTime() - b.start.getTime())
  }
}

import type { CalendarEvent } from './calendar'

export interface EventStore {
  list(): Promise<CalendarEvent[]>
  add(event: CalendarEvent): Promise<void>
}

interface EventJson {
  title: string
  start: string
  addedBy: string
  attendees?: string[]
}

export const toJson = (e: CalendarEvent): EventJson => ({ ...e, start: e.start.toISOString() })
export const fromJson = (e: EventJson): CalendarEvent => ({ ...e, start: new Date(e.start), attendees: e.attendees ?? [] })

export class InMemoryEventStore implements EventStore {
  private events: CalendarEvent[] = []
  async list() {
    return [...this.events]
  }
  async add(event: CalendarEvent) {
    this.events.push(event)
  }
}

export class HttpEventStore implements EventStore {
  private baseUrl: string

  constructor(baseUrl = '/api/events') {
    this.baseUrl = baseUrl
  }

  async list() {
    const res = await fetch(this.baseUrl)
    if (!res.ok) throw new Error(`GET ${this.baseUrl}: ${res.status}`)
    return ((await res.json()) as EventJson[]).map(fromJson)
  }

  async add(event: CalendarEvent) {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toJson(event)),
    })
    if (!res.ok) throw new Error(`POST ${this.baseUrl}: ${res.status}`)
  }
}

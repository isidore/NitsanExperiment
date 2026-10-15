import { DatabaseSync } from 'node:sqlite'
import type { CalendarEvent } from '../src/calendar.ts'
import type { EventStore } from '../src/eventStore.ts'

export class SqliteEventStore implements EventStore {
  private db: DatabaseSync

  constructor(path = ':memory:') {
    this.db = new DatabaseSync(path)
    this.db.exec(`CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      start TEXT NOT NULL,
      added_by TEXT NOT NULL,
      attendees TEXT NOT NULL DEFAULT '[]'
    )`)
    // Databases created before attendees existed: add the column, keeping every row.
    const columns = this.db.prepare('PRAGMA table_info(events)').all() as { name: string }[]
    if (!columns.some((c) => c.name === 'attendees')) {
      this.db.exec(`ALTER TABLE events ADD COLUMN attendees TEXT NOT NULL DEFAULT '[]'`)
    }
  }

  async list(): Promise<CalendarEvent[]> {
    const rows = this.db.prepare('SELECT title, start, added_by, attendees FROM events ORDER BY start').all() as {
      title: string
      start: string
      added_by: string
      attendees: string
    }[]
    return rows.map((r) => ({
      title: r.title,
      start: new Date(r.start),
      addedBy: r.added_by,
      attendees: JSON.parse(r.attendees) as string[],
    }))
  }

  async add(event: CalendarEvent): Promise<void> {
    this.db
      .prepare('INSERT INTO events (title, start, added_by, attendees) VALUES (?, ?, ?, ?)')
      .run(event.title, event.start.toISOString(), event.addedBy, JSON.stringify(event.attendees ?? []))
  }

  close() {
    this.db.close()
  }
}

// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { SqliteEventStore } from '../sqliteEventStore'

describe('SqliteEventStore', () => {
  it('returns events it stored, in start order', async () => {
    const store = new SqliteEventStore(':memory:')
    const acl = new Date(2026, 9, 17, 18, 0)
    const lunch = new Date(2026, 9, 15, 12, 0)

    await store.add({ title: 'Austin City Limits', start: acl, addedBy: 'Llewellyn', attendees: [] })
    await store.add({ title: 'Team lunch', start: lunch, addedBy: 'Antonio', attendees: [] })

    expect(await store.list()).toEqual([
      { title: 'Team lunch', start: lunch, addedBy: 'Antonio', attendees: [] },
      { title: 'Austin City Limits', start: acl, addedBy: 'Llewellyn', attendees: [] },
    ])
  })

  it('round-trips who is going', async () => {
    const store = new SqliteEventStore(':memory:')
    const lunch = new Date(2026, 9, 15, 12, 0)

    await store.add({ title: 'Team lunch', start: lunch, addedBy: 'Antonio', attendees: ['Antonio', 'Dana'] })

    expect(await store.list()).toEqual([{ title: 'Team lunch', start: lunch, addedBy: 'Antonio', attendees: ['Antonio', 'Dana'] }])
  })

  it('upgrades a database created before attendees existed, keeping its events', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'calendar-'))
    try {
      const path = join(dir, 'old.db')
      const old = new DatabaseSync(path)
      old.exec(`CREATE TABLE events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        start TEXT NOT NULL,
        added_by TEXT NOT NULL
      )`)
      const acl = new Date(2026, 9, 17, 18, 0)
      old.prepare('INSERT INTO events (title, start, added_by) VALUES (?, ?, ?)').run('Austin City Limits', acl.toISOString(), 'Llewellyn')
      old.close()

      const store = new SqliteEventStore(path)
      expect(await store.list()).toEqual([{ title: 'Austin City Limits', start: acl, addedBy: 'Llewellyn', attendees: [] }])
      store.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

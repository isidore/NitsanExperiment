// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { SqliteEventStore } from '../sqliteEventStore'

describe('SqliteEventStore', () => {
  it('returns events it stored, in start order', async () => {
    const store = new SqliteEventStore(':memory:')
    const acl = new Date(2026, 9, 17, 18, 0)
    const lunch = new Date(2026, 9, 15, 12, 0)

    await store.add({ title: 'Austin City Limits', start: acl, addedBy: 'Llewellyn' })
    await store.add({ title: 'Team lunch', start: lunch, addedBy: 'Antonio' })

    expect(await store.list()).toEqual([
      { title: 'Team lunch', start: lunch, addedBy: 'Antonio' },
      { title: 'Austin City Limits', start: acl, addedBy: 'Llewellyn' },
    ])
  })
})

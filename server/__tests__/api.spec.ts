// @vitest-environment node
import { describe, it, expect, afterEach } from 'vitest'
import type { AddressInfo } from 'node:net'
import type { Server } from 'node:http'
import { createApi } from '../api'
import { SqliteEventStore } from '../sqliteEventStore'
import { HttpEventStore } from '../../src/eventStore'

let server: Server
afterEach(() => server?.close())

async function start() {
  server = createApi(new SqliteEventStore(':memory:'))
  await new Promise<void>((r) => server.listen(0, r))
  return `http://localhost:${(server.address() as AddressInfo).port}/api/events`
}

describe('Calendar API', () => {
  it('an event one person POSTs is returned to everyone who GETs', async () => {
    const url = await start()
    const antonio = new HttpEventStore(url)
    const dana = new HttpEventStore(url)
    const lunch = new Date(2026, 9, 15, 12, 0)

    await antonio.add({ title: 'Team lunch', start: lunch, addedBy: 'Antonio' })

    expect(await dana.list()).toEqual([{ title: 'Team lunch', start: lunch, addedBy: 'Antonio' }])
  })

  it('rejects an event without a title', async () => {
    const url = await start()
    const res = await fetch(url, { method: 'POST', body: JSON.stringify({ start: new Date().toISOString(), addedBy: 'x' }) })
    expect(res.status).toBe(400)
  })
})

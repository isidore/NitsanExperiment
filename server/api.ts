import { createServer, type Server } from 'node:http'
import { toJson, fromJson, type EventStore } from '../src/eventStore.ts'

export function createApi(store: EventStore): Server {
  return createServer(async (req, res) => {
    const send = (status: number, body?: unknown) => {
      res.writeHead(status, { 'Content-Type': 'application/json' })
      res.end(body === undefined ? '' : JSON.stringify(body))
    }
    try {
      if (req.url !== '/api/events') return send(404, { error: 'not found' })
      if (req.method === 'GET') return send(200, (await store.list()).map(toJson))
      if (req.method === 'POST') {
        let raw = ''
        for await (const chunk of req) raw += chunk
        const body = JSON.parse(raw)
        if (!body.title || !body.start || !body.addedBy) return send(400, { error: 'title, start and addedBy are required' })
        await store.add(fromJson(body))
        return send(201)
      }
      send(405, { error: 'method not allowed' })
    } catch (e) {
      send(500, { error: String(e) })
    }
  })
}

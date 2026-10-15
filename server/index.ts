import { mkdirSync } from 'node:fs'
import { createApi } from './api.ts'
import { SqliteEventStore } from './sqliteEventStore.ts'

const PORT = Number(process.env.PORT ?? 3001)
const DB = process.env.DB ?? 'data/calendar.db'

mkdirSync('data', { recursive: true })
createApi(new SqliteEventStore(DB)).listen(PORT, () => {
  console.log(`Calendar API on http://localhost:${PORT}/api/events (db: ${DB})`)
})

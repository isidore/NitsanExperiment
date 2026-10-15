<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { eventKey, parseAttendees, peopleIn, SharedCalendar, type CalendarEvent } from './calendar'
import { HttpEventStore, type EventStore } from './eventStore'
import WeekView from './components/WeekView.vue'
import MembersLegend from './components/MembersLegend.vue'
import { colorFor } from './colors'

const props = withDefaults(defineProps<{ store?: EventStore; pollMs?: number }>(), { pollMs: 3000 })
const store = props.store ?? new HttpEventStore()

const calendar = reactive(new SharedCalendar()) as SharedCalendar
const recent = ref<CalendarEvent[]>([])
const title = ref('')
const start = ref('')
const who = ref('')
const going = ref('')
const view = ref<'list' | 'calendar'>('calendar')
const error = ref('')
const newKey = ref<string>()
const toast = ref('')
const toastShown = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | undefined

const memberCount = computed(() => peopleIn(calendar.all()).length)

function showToast(message: string) {
  toast.value = message
  toastShown.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toastShown.value = false), 2200)
}

async function refresh() {
  try {
    const events = await store.list()
    calendar.replaceAll(events)
    recent.value = events.slice(-5).reverse()
    error.value = ''
  } catch (e) {
    error.value = `Cannot reach the calendar server (${(e as Error).message})`
  }
}

async function addEvent() {
  if (!title.value || !start.value || !who.value) return
  const event = { title: title.value, start: new Date(start.value), addedBy: who.value, attendees: parseAttendees(going.value) }
  await store.add(event)
  newKey.value = eventKey(event)
  title.value = ''
  going.value = ''
  await refresh()
  showToast(`✓ "${event.title}" added — visible to all ${memberCount.value} members`)
}

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  refresh()
  if (props.pollMs > 0) timer = setInterval(refresh, props.pollMs)
})
onUnmounted(() => {
  clearInterval(timer)
  clearTimeout(toastTimer)
})

defineExpose({ refresh })

const fmt = (d: Date) =>
  d.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
const short = (d: Date) => d.toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })
</script>

<template>
  <header class="top">
    <h1>📅 Shared Calendar</h1>
    <span class="group">Group: <b>Learning Hour Team</b></span>
    <MembersLegend class="legend" :events="calendar.all()" :me="who" />
  </header>

  <main class="layout">
    <section class="cal-area">
      <p v-if="error" class="error">{{ error }}</p>

      <WeekView v-if="view === 'calendar'" :calendar="calendar" :new-key="newKey">
        <template #actions>
          <button data-test="toggle-view" class="btn" @click="view = 'list'">☰ List view</button>
        </template>
      </WeekView>

      <section v-else class="card list-card">
        <div class="bar">
          <b>All events</b>
          <button data-test="toggle-view" class="btn push" @click="view = 'calendar'">📅 Calendar view</button>
        </div>
        <ul data-test="events" class="list">
          <li v-for="(e, i) in calendar.all()" :key="i">
            <b>{{ e.title }}</b> · {{ fmt(e.start) }} · added by
            <span class="person" data-test="person"><span class="square" data-test="person-square" :style="{ background: colorFor(e.addedBy) }"></span>{{ e.addedBy }}</span>
            <span v-if="e.attendees.length" class="going" data-test="going">
              <span class="going-label">· going:</span>
              <template v-for="(a, j) in e.attendees" :key="a"><span v-if="j > 0" class="sr-only">, </span><span class="chip" data-test="attendee-chip" :title="a"><span class="dot" :style="{ background: colorFor(a) }"></span><span data-test="attendee">{{ a }}</span></span></template>
            </span>
          </li>
          <li v-if="calendar.all().length === 0" class="empty">No events yet.</li>
        </ul>
      </section>
    </section>

    <aside class="side">
      <div class="card pad">
        <h2>Add event</h2>
        <form @submit.prevent="addEvent">
          <label for="ev-title">Title</label>
          <input id="ev-title" data-test="title" v-model="title" placeholder="Team lunch" />
          <label for="ev-start">When</label>
          <input id="ev-start" data-test="start" v-model="start" type="datetime-local" />
          <label for="ev-who">Your name</label>
          <input id="ev-who" data-test="who" v-model="who" placeholder="Antonio" />
          <label for="ev-going">Who's going</label>
          <input id="ev-going" data-test="attendees" v-model="going" placeholder="Antonio, Dana" />
          <button class="btn primary submit">Add to shared calendar</button>
        </form>
      </div>
      <div class="card pad">
        <h2>Everyone sees</h2>
        <ul class="feed" data-test="feed">
          <li v-for="(e, i) in recent" :key="i">
            <span class="person who" :style="{ color: colorFor(e.addedBy) }"><span class="square" data-test="person-square" :style="{ background: colorFor(e.addedBy) }"></span>{{ e.addedBy }}</span>
            added <b>{{ e.title }}</b> · {{ short(e.start) }}
            <span v-if="e.attendees.length" class="going" data-test="going">
              <span class="going-label">· going:</span>
              <template v-for="(a, j) in e.attendees" :key="a"><span v-if="j > 0" class="sr-only">, </span><span class="chip" data-test="attendee-chip" :title="a"><span class="dot" :style="{ background: colorFor(a) }"></span><span data-test="attendee">{{ a }}</span></span></template>
            </span>
          </li>
          <li v-if="recent.length === 0" class="empty">No events yet.</li>
        </ul>
      </div>
    </aside>
  </main>
  <div class="toast" :class="{ show: toastShown }" data-test="toast" role="status">{{ toast }}</div>
</template>

<style scoped>
.top { display: flex; align-items: center; flex-wrap: wrap; gap: 16px; padding: 14px 24px; background: var(--card); border-bottom: 1px solid var(--line); }
.top h1 { font-size: 20px; margin: 0; }
.group { color: var(--mut); }
.legend { margin-left: auto; }

.layout { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 20px; padding: 20px 24px; align-items: start; }
@media (max-width: 800px) {
  .layout { grid-template-columns: minmax(0, 1fr); padding: 16px; }
  .top { padding: 12px 16px; }
}

.card { background: var(--card); border: 1px solid var(--line); border-radius: 10px; }
.pad { padding: 14px; }
.card h2 { font-size: 14px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--mut); }

.side { display: flex; flex-direction: column; gap: 16px; }
label { display: block; font-size: 13px; color: var(--mut); margin: 8px 0 3px; }
input { width: 100%; padding: 7px 8px; border: 1px solid var(--line); border-radius: 6px; font: inherit; color: var(--fg); background: var(--card); }
input:focus { outline: 2px solid var(--ac); outline-offset: -1px; border-color: var(--ac); }
.submit { width: 100%; margin-top: 12px; }

.feed { list-style: none; margin: 0; padding: 0; font-size: 13px; }
.feed li { padding: 6px 0; border-bottom: 1px solid var(--line); }
.feed li:last-child { border: 0; }
.who { font-weight: 600; }

.list-card { overflow: hidden; }
.bar { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-bottom: 1px solid var(--line); }
.bar b { font-size: 16px; }
.push { margin-left: auto; }
.list { list-style: none; margin: 0; padding: 0 14px; }
.list li { padding: 10px 0; border-bottom: 1px solid var(--line); }
.list li:last-child { border: 0; }

.error { color: var(--err); background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 10px 14px; margin: 0 0 12px; }
.empty { color: var(--mut); }
.person { display: inline-flex; align-items: center; gap: 4px; }
.toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: var(--fg); color: #fff; padding: 10px 16px; border-radius: 8px; opacity: 0; transition: 0.3s; pointer-events: none; }
.toast.show { opacity: 1; }
.square { width: 12px; height: 12px; border-radius: 2px; display: inline-block; flex: none; }
.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex: none; }
.going { margin-left: 4px; color: var(--mut); display: inline-flex; flex-wrap: wrap; align-items: center; gap: 4px; vertical-align: middle; }
.going-label { margin-right: 2px; }
.chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 1px 8px 1px 4px; border-radius: 10px;
  background: #f6f5f2; border: 1px solid #e3e1dc;
  color: var(--fg); font-size: 12px; line-height: 18px; white-space: nowrap;
}
.chip .dot { width: 9px; height: 9px; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
</style>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { SharedCalendar } from './calendar'
import { HttpEventStore, type EventStore } from './eventStore'
import WeekView from './components/WeekView.vue'

const props = withDefaults(defineProps<{ store?: EventStore; pollMs?: number }>(), { pollMs: 3000 })
const store = props.store ?? new HttpEventStore()

const calendar = reactive(new SharedCalendar()) as SharedCalendar
const title = ref('')
const start = ref('')
const who = ref('')
const view = ref<'list' | 'calendar'>('list')
const error = ref('')

async function refresh() {
  try {
    calendar.replaceAll(await store.list())
    error.value = ''
  } catch (e) {
    error.value = `Cannot reach the calendar server (${(e as Error).message})`
  }
}

async function addEvent() {
  if (!title.value || !start.value || !who.value) return
  await store.add({ title: title.value, start: new Date(start.value), addedBy: who.value })
  title.value = ''
  await refresh()
}

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  refresh()
  if (props.pollMs > 0) timer = setInterval(refresh, props.pollMs)
})
onUnmounted(() => clearInterval(timer))

defineExpose({ refresh })

const fmt = (d: Date) =>
  d.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
</script>

<template>
  <main>
    <h1>📅 Shared Calendar</h1>

    <form @submit.prevent="addEvent">
      <input data-test="title" v-model="title" placeholder="Title" />
      <input data-test="start" v-model="start" type="datetime-local" />
      <input data-test="who" v-model="who" placeholder="Your name" />
      <button>Add to shared calendar</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>

    <div class="heading">
      <h2>Everyone sees</h2>
      <button data-test="toggle-view" class="toggle" @click="view = view === 'list' ? 'calendar' : 'list'">
        {{ view === 'list' ? '📅 Calendar view' : '☰ List view' }}
      </button>
    </div>

    <WeekView v-if="view === 'calendar'" :calendar="calendar" />
    <ul v-else data-test="events">
      <li v-for="(e, i) in calendar.all()" :key="i">
        <b>{{ e.title }}</b> · {{ fmt(e.start) }} · added by {{ e.addedBy }}
      </li>
      <li v-if="calendar.all().length === 0" class="empty">No events yet.</li>
    </ul>
  </main>
</template>

<style scoped>
main { max-width: 900px; margin: 40px auto; padding: 0 16px; font-family: system-ui, sans-serif; }
form { display: flex; flex-wrap: wrap; gap: 8px; }
input, button { padding: 8px; font: inherit; }
form button { background: #c96442; color: #fff; border: 0; border-radius: 6px; cursor: pointer; }
.heading { display: flex; align-items: center; justify-content: space-between; }
.toggle { border: 1px solid #c96442; color: #c96442; background: #fff; border-radius: 6px; cursor: pointer; }
.error { color: #b00020; }
ul { padding-left: 20px; }
.empty { color: #888; }
</style>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { SharedCalendar } from './calendar'

const calendar = reactive(new SharedCalendar())
const title = ref('')
const start = ref('')
const who = ref('')

function addEvent() {
  if (!title.value || !start.value || !who.value) return
  calendar.add({ title: title.value, start: new Date(start.value), addedBy: who.value })
  title.value = ''
}

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

    <h2>Everyone sees</h2>
    <ul data-test="events">
      <li v-for="(e, i) in calendar.all()" :key="i">
        <b>{{ e.title }}</b> · {{ fmt(e.start) }} · added by {{ e.addedBy }}
      </li>
      <li v-if="calendar.all().length === 0" class="empty">No events yet.</li>
    </ul>
  </main>
</template>

<style scoped>
main { max-width: 640px; margin: 40px auto; padding: 0 16px; font-family: system-ui, sans-serif; }
form { display: flex; flex-wrap: wrap; gap: 8px; }
input, button { padding: 8px; font: inherit; }
button { background: #c96442; color: #fff; border: 0; border-radius: 6px; cursor: pointer; }
ul { padding-left: 20px; }
.empty { color: #888; }
</style>

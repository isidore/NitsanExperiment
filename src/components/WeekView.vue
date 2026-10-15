<script setup lang="ts">
import { computed, ref } from 'vue'
import { weekOf, type SharedCalendar } from '../calendar'

const props = defineProps<{ calendar: SharedCalendar; initialDate?: Date }>()

const HOUR_PX = 40
const FIRST_HOUR = 7
const LAST_HOUR = 23
const hours = Array.from({ length: LAST_HOUR - FIRST_HOUR }, (_, i) => FIRST_HOUR + i)

const anchor = ref(props.initialDate ?? new Date())
const week = computed(() => weekOf(props.calendar, anchor.value))
const today = new Date().toDateString()

function shift(days: number) {
  const d = new Date(anchor.value)
  d.setDate(d.getDate() + days)
  anchor.value = d
}

const title = computed(() => {
  const first = week.value[0]!.date
  const last = week.value[6]!.date
  const f = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return `Week of ${f(first)} – ${f(last)}, ${last.getFullYear()}`
})

const top = (d: Date) => Math.max(0, (d.getHours() + d.getMinutes() / 60 - FIRST_HOUR) * HOUR_PX)
const time = (d: Date) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
</script>

<template>
  <section class="week" data-test="week-view">
    <div class="bar">
      <button @click="shift(-7)" aria-label="Previous week">‹</button>
      <button @click="anchor = new Date()">Today</button>
      <button @click="shift(7)" aria-label="Next week">›</button>
      <b>{{ title }}</b>
    </div>
    <div class="grid">
      <div class="corner"></div>
      <div v-for="d in week" :key="d.date.toISOString()" class="dh" :class="{ today: d.date.toDateString() === today }">
        {{ d.date.toLocaleDateString(undefined, { weekday: 'short' }) }}
        <strong>{{ d.date.getDate() }}</strong>
      </div>
      <div class="hours">
        <div v-for="h in hours" :key="h" class="hr" :style="{ height: HOUR_PX + 'px' }">{{ h }}:00</div>
      </div>
      <div v-for="d in week" :key="'c' + d.date.toISOString()" class="col" :style="{ height: hours.length * HOUR_PX + 'px' }">
        <div v-for="(e, i) in d.events" :key="i" class="ev" :style="{ top: top(e.start) + 'px', height: HOUR_PX - 4 + 'px' }">
          <b>{{ e.title }}</b><small>{{ time(e.start) }} · {{ e.addedBy }}</small>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.week { border: 1px solid #e3e1dc; border-radius: 10px; overflow: hidden; background: #fff; }
.bar { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-bottom: 1px solid #e3e1dc; }
.bar button { border: 1px solid #e3e1dc; background: #fff; border-radius: 6px; padding: 4px 10px; cursor: pointer; font: inherit; color: #1d1d1f; }
.grid { display: grid; grid-template-columns: 52px repeat(7, 1fr); }
.dh { padding: 6px; text-align: center; font-size: 13px; color: #6b6b70; border-bottom: 1px solid #e3e1dc; }
.dh strong { display: block; font-size: 18px; color: #1d1d1f; }
.dh.today strong { color: #c96442; }
.hr { font-size: 11px; color: #6b6b70; text-align: right; padding-right: 6px; border-bottom: 1px solid #f0eee9; box-sizing: border-box; }
.col { position: relative; border-left: 1px solid #e3e1dc; background: repeating-linear-gradient(to bottom, transparent 0 39px, #f0eee9 39px 40px); }
.ev { position: absolute; left: 3px; right: 3px; background: #c96442; color: #fff; border-radius: 6px; padding: 2px 6px; font-size: 12px; overflow: hidden; box-shadow: 0 1px 2px #0002; }
.ev small { display: block; opacity: 0.85; }
</style>

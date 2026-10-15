<script setup lang="ts">
import { computed, ref } from 'vue'
import { weekOf, type SharedCalendar } from '../calendar'
import { colorFor } from '../colors'

const props = defineProps<{ calendar: SharedCalendar; initialDate?: Date }>()

const HOUR_PX = 48
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
      <button class="btn" @click="shift(-7)" aria-label="Previous week">‹</button>
      <button class="btn" @click="anchor = new Date()">Today</button>
      <button class="btn" @click="shift(7)" aria-label="Next week">›</button>
      <b>{{ title }}</b>
      <span class="actions"><slot name="actions" /></span>
    </div>
    <div class="scroll">
      <div class="grid">
        <div class="corner"></div>
        <div v-for="d in week" :key="d.date.toISOString()" class="dh" :class="{ today: d.date.toDateString() === today }">
          {{ d.date.toLocaleDateString(undefined, { weekday: 'short' }) }}
          <strong>{{ d.date.getDate() }}</strong>
        </div>
        <div class="hours">
          <div v-for="h in hours" :key="h" class="hr" :style="{ height: HOUR_PX + 'px' }">{{ h }}:00</div>
        </div>
        <div
          v-for="d in week"
          :key="'c' + d.date.toISOString()"
          class="col"
          :class="{ today: d.date.toDateString() === today }"
          :style="{ height: hours.length * HOUR_PX + 'px', '--hour': HOUR_PX + 'px' }"
        >
          <div v-for="(e, i) in d.events" :key="i" class="ev" data-test="event" :style="{ top: top(e.start) + 2 + 'px', height: HOUR_PX - 4 + 'px', background: colorFor(e.addedBy) }">
            <b>{{ e.title }}</b><small>{{ time(e.start) }} · {{ e.addedBy }}</small>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.week { background: var(--card); border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
.bar { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; padding: 10px 14px; border-bottom: 1px solid var(--line); }
.bar b { font-size: 16px; }
.actions { margin-left: auto; }
.scroll { overflow-x: auto; }
.grid { display: grid; grid-template-columns: 56px repeat(7, minmax(72px, 1fr)); }
.dh { padding: 8px 6px; text-align: center; font-size: 13px; color: var(--mut); border-bottom: 1px solid var(--line); }
.dh strong { display: block; font-size: 18px; color: var(--fg); }
.dh.today strong { color: var(--ac); }
.hr { font-size: 11px; color: var(--mut); text-align: right; padding: 2px 6px 0 0; border-bottom: 1px solid var(--line); }
.col {
  position: relative;
  border-left: 1px solid var(--line);
  background: repeating-linear-gradient(to bottom, transparent 0 calc(var(--hour) - 1px), var(--line) calc(var(--hour) - 1px) var(--hour));
}
.col.today { background-color: #c964420a; }
.ev { position: absolute; left: 3px; right: 3px; z-index: 1; color: #fff; border-radius: 6px; padding: 3px 6px; font-size: 12px; overflow: hidden; box-shadow: 0 1px 2px #0002; }
.ev small { display: block; opacity: 0.85; }
</style>

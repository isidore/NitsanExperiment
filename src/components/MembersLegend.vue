<script setup lang="ts">
import { computed } from 'vue'
import type { CalendarEvent } from '../calendar'
import { colorFor, personKey } from '../colors'

const props = defineProps<{ events: CalendarEvent[] }>()

const members = computed(() => {
  const seen = new Map<string, string>()
  for (const e of props.events) {
    const name = e.addedBy.trim()
    if (name && !seen.has(personKey(name))) seen.set(personKey(name), name)
  }
  return [...seen.values()]
})
</script>

<template>
  <div class="members" data-test="members">
    <div
      v-for="name in members"
      :key="name"
      class="av"
      data-test="member"
      :style="{ background: colorFor(name) }"
      :title="name"
      :aria-label="name"
    >
      {{ name[0]!.toUpperCase() }}
    </div>
    <span class="count" data-test="member-count">{{ members.length }} {{ members.length === 1 ? 'member' : 'members' }}</span>
  </div>
</template>

<style scoped>
.members { display: flex; align-items: center; gap: 6px; }
.av { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; color: #fff; font-weight: 600; font-size: 13px; border: 2px solid #fff; box-shadow: 0 0 0 1px #e3e1dc; }
.count { color: #6b6b70; font-size: 13px; margin-left: 6px; }
</style>

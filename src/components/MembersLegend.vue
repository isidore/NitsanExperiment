<script setup lang="ts">
import { computed } from 'vue'
import { peopleIn, type CalendarEvent } from '../calendar'
import { colorFor, personKey } from '../colors'

const props = defineProps<{ events: CalendarEvent[]; me?: string }>()
const meKey = computed(() => personKey(props.me ?? ''))

const members = computed(() => peopleIn(props.events))
</script>

<template>
  <div class="members" data-test="members">
    <div
      v-for="name in members"
      :key="name"
      class="av"
      :class="{ me: meKey !== '' && personKey(name) === meKey }"
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
.av { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; color: #fff; font-weight: 600; font-size: 13px; border: 2px solid var(--card); }
.me { outline: 3px solid var(--ac); outline-offset: 1px; }
.count { color: var(--mut); font-size: 13px; margin-left: 6px; }
</style>

<script setup>
import { computed } from 'vue'
import { useRegistration } from 'src/composables/useRegistration.js'
import { useConflicts } from 'src/composables/useConflicts.js'
import { sessions } from 'src/mocks/sessions.js'
import SessionCard from 'src/components/SessionCard.vue'

const props = defineProps({
  errors: { type: Object, default: () => ({}) },
  showErrors: { type: Boolean, default: false },
})

const state = useRegistration()
const selectedSessionIdsRef = computed(() => state.selectedSessionIds)
const { conflictingSessionIds } = useConflicts(selectedSessionIdsRef)

/**
 * Sessions grouped by UTC date string (YYYY-MM-DD), sorted by start time.
 * @type {import('vue').ComputedRef<Array<{ dateLabel: string, sessions: Array }>>}
 */
const sessionsByDay = computed(() => {
  const groups = {}
  for (const s of sessions) {
    const dateKey = s.date.slice(0, 10) // YYYY-MM-DD
    if (!groups[dateKey]) groups[dateKey] = []
    groups[dateKey].push(s)
  }
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, daySessions]) => ({
      dateLabel: new Date(dateKey + 'T00:00:00Z').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      }),
      sessions: daySessions.sort((a, b) => new Date(a.date) - new Date(b.date)),
    }))
})

function toggleSession(id) {
  const idx = state.selectedSessionIds.indexOf(id)
  if (idx === -1) {
    state.selectedSessionIds.push(id)
  } else {
    state.selectedSessionIds.splice(idx, 1)
  }
}
</script>

<template>
  <div class="step-sessions space-y-8">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="text-subtitle1 text-neutral mb-1">Select Sessions</h2>
        <p class="text-sm text-neutral-muted">Choose the sessions you'd like to attend. Conflicts will be flagged at submission.</p>
      </div>
      <span class="flex-shrink-0 text-sm text-neutral-muted">
        {{ state.selectedSessionIds.length }} selected
      </span>
    </div>

    <!-- Conflict banner (only after validation triggered) -->
    <div
      v-if="showErrors && errors.conflicts"
      class="flex items-start gap-3 p-3 rounded-lg bg-danger-muted-rest border border-danger-muted text-danger text-sm"
    >
      <span class="material-icons text-base flex-shrink-0 mt-0.5">error_outline</span>
      {{ errors.conflicts }}
    </div>

    <div v-for="day in sessionsByDay" :key="day.dateLabel" class="space-y-3">
      <h3 class="text-sm font-semibold text-neutral-muted uppercase tracking-wide border-b divider-default pb-2">
        {{ day.dateLabel }}
      </h3>
      <div class="space-y-2">
        <SessionCard
          v-for="session in day.sessions"
          :key="session.id"
          :session="session"
          :selected="state.selectedSessionIds.includes(session.id)"
          :conflicting="conflictingSessionIds.has(session.id)"
          @toggle="toggleSession"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRegistration } from 'src/composables/useRegistration.js'
import { useConflicts } from 'src/composables/useConflicts.js'
import { sessions } from 'src/mocks/sessions.js'
import SessionCard from 'src/components/SessionCard.vue'
import TabSwitcher from 'src/components/TabSwitcher.vue'

defineProps({
  errors: { type: Object, default: () => ({}) },
  showErrors: { type: Boolean, default: false },
})

const { t } = useI18n()

const state = useRegistration()
const selectedSessionIdsRef = computed(() => state.selectedSessionIds)
const { conflictingSessionIds } = useConflicts(selectedSessionIdsRef)

const sessionsByDay = computed(() => {
  const groups = {}
  for (const s of sessions) {
    const dateKey = s.date.slice(0, 10)
    if (!groups[dateKey]) groups[dateKey] = []
    groups[dateKey].push(s)
  }
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, daySessions]) => ({
      dateKey,
      sessions: daySessions.sort((a, b) => new Date(a.date) - new Date(b.date)),
    }))
})

const dateTabs = computed(() =>
  sessionsByDay.value.map(day => ({
    value: day.dateKey,
    label: new Date(day.dateKey + 'T00:00:00Z').toLocaleDateString('en', {
      month: 'short', day: 'numeric', timeZone: 'UTC',
    }),
  }))
)

const activeDate = ref(sessions[0]?.date.slice(0, 10) ?? '')

const activeSessions = computed(() =>
  sessionsByDay.value.find(d => d.dateKey === activeDate.value)?.sessions ?? []
)

function toggleSession(id) {
  const idx = state.selectedSessionIds.indexOf(id)
  if (idx === -1) state.selectedSessionIds.push(id)
  else state.selectedSessionIds.splice(idx, 1)
}
</script>

<template>
  <div class="step-sessions space-y-6">
    <h2 class="text-h3 font-bold text-neutral">{{ t('sessions.title') }}</h2>

    <div class="space-y-3">
      <TabSwitcher v-model="activeDate" :tabs="dateTabs" />
      <p class="text-sm font-medium text-[var(--text-brand-emphasis)]">
        {{ t('sessions.selected', { count: state.selectedSessionIds.length }) }}
      </p>
    </div>

    <div
      v-if="showErrors && errors.conflicts"
      class="flex items-start gap-3 p-3 rounded-lg bg-danger-muted-rest border border-danger-muted text-danger text-sm"
    >
      <span class="material-icons text-base flex-shrink-0 mt-0.5">error_outline</span>
      {{ errors.conflicts }}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SessionCard
        v-for="session in activeSessions"
        :key="session.id"
        :session="session"
        :selected="state.selectedSessionIds.includes(session.id)"
        :conflicting="conflictingSessionIds.has(session.id)"
        @toggle="toggleSession"
      />
    </div>
  </div>
</template>

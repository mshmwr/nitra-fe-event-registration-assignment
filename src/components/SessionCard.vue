<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseCard from 'src/components/BaseCard.vue'

const props = defineProps({
  session: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  conflicting: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle'])

const { t, locale } = useI18n()

const isFull = computed(() => props.session.registered >= props.session.capacity)
const remaining = computed(() => props.session.capacity - props.session.registered)
const capacityRatio = computed(() => props.session.registered / props.session.capacity)

const barColor = computed(() => {
  if (isFull.value) return 'var(--bg-danger-emphasis-rest)'
  if (capacityRatio.value >= 0.9) return 'var(--bg-accent-emphasis-rest)'
  if (capacityRatio.value >= 0.75) return 'var(--bg-warning-emphasis-rest)'
  return 'var(--bg-brand-emphasis-rest)'
})

const spotsClass = computed(() => {
  if (isFull.value) return 'text-[var(--text-danger-emphasis)] font-semibold'
  if (capacityRatio.value >= 0.9) return 'text-[var(--text-accent-default)]'
  if (capacityRatio.value >= 0.75) return 'text-[var(--text-warning-default)]'
  return 'text-[var(--text-brand-emphasis)]'
})

const TRACK_COLORS = {
  main: 'bg-brand-muted-rest text-brand',
  frontend: 'bg-info-muted-rest text-info',
  backend: 'bg-success-muted-rest text-success',
  devops: 'bg-accent-muted-rest text-accent',
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString(locale.value, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  })
}
</script>

<template>
  <BaseCard
    role="checkbox"
    :aria-checked="selected"
    :aria-disabled="isFull"
    tabindex="0"
    :selected="selected && !conflicting"
    :error="selected && conflicting"
    :disabled="isFull"
    class="session-card rounded-lg p-4"
    :class="[
      isFull ? 'cursor-not-allowed' : 'cursor-pointer',
      !isFull && !selected ? 'border-neutral-muted bg-surface-l0 hover:border-neutral-emphasis hover:bg-surface-l1' : '',
    ]"
    style="box-shadow: 0px 2px 8px 0px rgba(0,0,0,0.06), 0px 1px 2px 0px rgba(0,0,0,0.04)"
    @click="!isFull && emit('toggle', session.id)"
    @keydown.enter.space.prevent="!isFull && emit('toggle', session.id)"
  >
    <div class="flex flex-col gap-2">
      <!-- Top row: track badge + conflict badge + checkbox -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="inline-block px-2 py-0.5 rounded text-xs font-medium capitalize"
            :class="TRACK_COLORS[session.track] ?? 'bg-neutral-muted-rest text-neutral-muted'"
          >
            {{ session.track }}
          </span>
          <span v-if="conflicting && selected" class="inline-flex items-center gap-1 text-danger text-xs">
            <span class="material-icons text-sm">warning</span>
            {{ t('sessions.timeConflict') }}
          </span>
          <span v-if="isFull" class="text-neutral-quiet text-xs">{{ t('sessions.full') }}</span>
        </div>
        <div
          v-if="!isFull"
          class="w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors"
          :class="selected
            ? (conflicting ? 'border-[var(--border-danger-emphasis)] bg-[var(--bg-danger-emphasis-rest)]' : 'border-[var(--border-brand-emphasis)] bg-[var(--bg-brand-emphasis-rest)]')
            : 'border-neutral-muted'"
        >
          <span v-if="selected" class="material-icons text-white text-sm">check</span>
        </div>
      </div>

      <!-- Title + speaker -->
      <div>
        <p class="text-subtitle2 text-neutral leading-snug">{{ session.title }}</p>
        <p class="text-sm text-neutral-muted mt-0.5">{{ session.speaker }} · {{ session.speakerTitle }}</p>
        <p class="text-sm text-neutral-quiet mt-1">
          {{ formatTime(session.date) }} – {{ formatTime(session.endDate) }}
        </p>
      </div>

      <!-- Capacity bar -->
      <div class="space-y-1">
        <div class="h-1.5 w-full rounded-full bg-neutral-muted-rest overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-300"
            :style="{ width: `${Math.min(capacityRatio * 100, 100)}%`, backgroundColor: barColor }"
          />
        </div>
        <p class="text-xs" :class="spotsClass">
          <template v-if="isFull">Sold Out</template>
          <template v-else>{{ t('sessions.spotsLeft', remaining) }}</template>
        </p>
      </div>
    </div>
  </BaseCard>
</template>

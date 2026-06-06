<script setup>
const props = defineProps({
  session: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  conflicting: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle'])

const isFull = props.session.registered >= props.session.capacity
const remaining = props.session.capacity - props.session.registered

const TRACK_COLORS = {
  main: 'bg-brand-muted-rest text-brand',
  frontend: 'bg-info-muted-rest text-info',
  backend: 'bg-success-muted-rest text-success',
  devops: 'bg-accent-muted-rest text-accent',
}

/**
 * Format an ISO date string to a locale time string (UTC).
 * @param {string} iso
 * @returns {string}
 */
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  })
}
</script>

<template>
  <div
    role="checkbox"
    :aria-checked="selected"
    :aria-disabled="isFull"
    tabindex="0"
    class="session-card rounded-lg border p-4 transition-all duration-150 select-none"
    :class="[
      isFull
        ? 'opacity-50 cursor-not-allowed border-neutral-muted bg-surface-l1'
        : 'cursor-pointer',
      !isFull && selected && !conflicting
        ? 'border-brand-emphasis bg-brand-muted-rest'
        : '',
      !isFull && !selected
        ? 'border-neutral-muted bg-surface-l0 hover:border-neutral-emphasis hover:bg-surface-l1'
        : '',
      conflicting && selected
        ? 'border-danger-emphasis bg-danger-muted-rest'
        : '',
    ]"
    @click="!isFull && emit('toggle', session.id)"
    @keydown.enter.space.prevent="!isFull && emit('toggle', session.id)"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-center gap-2 mb-1">
          <span
            class="inline-block px-2 py-0.5 rounded text-xs font-medium capitalize"
            :class="TRACK_COLORS[session.track] ?? 'bg-neutral-muted-rest text-neutral-muted'"
          >
            {{ session.track }}
          </span>
          <span v-if="conflicting && selected" class="inline-flex items-center gap-1 text-danger text-xs">
            <span class="material-icons text-sm">warning</span>
            Time conflict
          </span>
          <span v-if="isFull" class="text-neutral-quiet text-xs">Full</span>
        </div>
        <p class="text-subtitle2 text-neutral leading-snug">{{ session.title }}</p>
        <p class="text-sm text-neutral-muted mt-0.5">{{ session.speaker }} · {{ session.speakerTitle }}</p>
        <p class="text-sm text-neutral-quiet mt-1">
          {{ formatTime(session.date) }} – {{ formatTime(session.endDate) }}
          <span class="mx-1">·</span>
          <span :class="remaining <= 10 ? 'text-warning' : 'text-neutral-quiet'">
            {{ isFull ? 'No spots left' : `${remaining} spot${remaining === 1 ? '' : 's'} left` }}
          </span>
        </p>
      </div>
      <div
        v-if="!isFull"
        class="w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors"
        :class="selected
          ? (conflicting ? 'border-[var(--border-danger-emphasis)] bg-[var(--bg-danger-emphasis-rest)]' : 'border-[var(--border-brand-emphasis)] bg-[var(--bg-brand-emphasis-rest)]')
          : 'border-[var(--border-neutral-muted)]'"
      >
        <span v-if="selected" class="material-icons text-white text-sm">check</span>
      </div>
    </div>
  </div>
</template>

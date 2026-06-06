<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { TICKET_PRICES, formatPrice } from 'src/composables/usePricing.js'

const props = defineProps({
  type: { type: String, required: true },
  selected: { type: Boolean, default: false },
})

const emit = defineEmits(['select'])

const { t, tm } = useI18n()

const label = computed(() => t(`tickets.${props.type}.label`))
const price = computed(() => TICKET_PRICES[props.type] ?? 0)
const perks = computed(() => tm(`tickets.${props.type}.perks`))
</script>

<template>
  <div
    role="radio"
    :aria-checked="selected"
    tabindex="0"
    class="ticket-card cursor-pointer rounded-xl border-2 p-5 transition-all duration-150 select-none"
    :class="selected
      ? 'border-brand-emphasis bg-brand-muted-rest'
      : 'border-neutral-muted bg-surface-l0 hover:border-neutral-emphasis hover:bg-surface-l1'"
    @click="emit('select', type)"
    @keydown.enter.space.prevent="emit('select', type)"
  >
    <div class="flex items-start justify-between gap-2 mb-3">
      <div>
        <p class="text-subtitle1 text-neutral">{{ label }}</p>
        <p class="text-h3 text-brand mt-0.5">{{ formatPrice(price) }}</p>
      </div>
      <div
        class="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center transition-colors"
        :class="selected ? 'border-[var(--border-brand-emphasis)] bg-[var(--bg-brand-emphasis-rest)]' : 'border-[var(--border-neutral-muted)]'"
      >
        <div v-if="selected" class="w-2 h-2 rounded-full bg-white" />
      </div>
    </div>
    <ul class="space-y-1">
      <li
        v-for="(perk, idx) in perks"
        :key="idx"
        class="flex items-center gap-2 text-sm text-neutral-muted"
      >
        <span class="material-icons text-success text-base">check</span>
        {{ perk }}
      </li>
    </ul>
  </div>
</template>

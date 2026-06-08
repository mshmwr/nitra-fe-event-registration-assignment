<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { TICKET_PRICES, formatPrice } from 'src/composables/usePricing.js'
import BaseCard from 'src/components/BaseCard.vue'

const props = defineProps({
  type: { type: String, required: true },
  selected: { type: Boolean, default: false },
})

const emit = defineEmits(['select'])

const { t, tm } = useI18n()

const label = computed(() => t(`tickets.${props.type}.label`))
const description = computed(() => t(`tickets.${props.type}.description`))
const price = computed(() => TICKET_PRICES[props.type] ?? 0)
const perks = computed(() => tm(`tickets.${props.type}.perks`))
</script>

<template>
  <BaseCard
    role="radio"
    :aria-checked="selected"
    tabindex="0"
    :selected="selected"
    :thick="true"
    class="ticket-card cursor-pointer rounded-[6px] p-5 flex flex-col gap-3"
    :class="!selected ? 'border-neutral-muted bg-surface-l1 hover:border-neutral-emphasis hover:bg-surface-l0' : ''"
    style="box-shadow: 0px 4px 16px 0px rgba(0,0,0,0.08), 0px 1px 3px 0px rgba(0,0,0,0.04)"
    @click="emit('select', type)"
    @keydown.enter.space.prevent="emit('select', type)"
  >
    <!-- name + price -->
    <div class="flex items-center justify-between">
      <span class="text-subtitle1 font-semibold text-neutral">{{ label }}</span>
      <span class="text-subtitle1 font-semibold text-neutral">{{ formatPrice(price) }}</span>
    </div>

    <!-- description -->
    <p class="text-xs text-neutral-muted leading-4">{{ description }}</p>

    <!-- perks -->
    <ul class="flex flex-col gap-3 list-none p-0 m-0">
      <li
        v-for="(perk, idx) in perks"
        :key="idx"
        class="flex items-center gap-2 text-xs text-neutral-muted"
      >
        <span class="w-3.5 h-3.5 rounded-full bg-brand-emphasis-rest flex items-center justify-center flex-shrink-0">
          <span class="material-icons text-white" style="font-size: 9px; line-height: 1">check</span>
        </span>
        {{ perk }}
      </li>
    </ul>

    <!-- selected badge -->
    <div v-if="selected">
      <span
        class="inline-flex items-center gap-1 px-[5px] py-[3px] rounded-full text-white font-medium leading-[14px]"
        style="font-size: 11px; background-color: var(--bg-success-bold-rest)"
      >
        ✓ {{ t('tickets.selected') }}
      </span>
    </div>
  </BaseCard>
</template>

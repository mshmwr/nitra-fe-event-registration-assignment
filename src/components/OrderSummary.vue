<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRegistration } from 'src/composables/useRegistration.js'
import { usePricingInjected, formatPrice } from 'src/composables/usePricing.js'

const { t } = useI18n()

const state = useRegistration()
const { ticketPrice, addonLineItems, vipWorkshopDiscount, total } = usePricingInjected()

const ticketLabel = computed(() => t(`tickets.${state.ticketType}.label`))
</script>

<template>
  <div class="order-summary rounded-xl border border-neutral-muted bg-surface-l1 p-5 sticky top-4">
    <h3 class="text-subtitle1 text-neutral mb-4">{{ t('orderSummary.title') }}</h3>

    <!-- Ticket -->
    <div class="flex justify-between items-center py-2 border-b divider-muted">
      <span class="text-sm text-neutral">{{ t('orderSummary.ticketLine', { label: ticketLabel }) }}</span>
      <span class="text-sm font-medium text-neutral">{{ formatPrice(ticketPrice) }}</span>
    </div>

    <!-- Add-on line items -->
    <div
      v-for="item in addonLineItems"
      :key="item.id"
      class="flex justify-between items-start py-2 border-b divider-muted gap-2"
    >
      <div class="flex-1 min-w-0">
        <p class="text-sm text-neutral truncate">{{ item.name }}</p>
        <p v-if="item.size" class="text-xs text-neutral-quiet">{{ t('orderSummary.size', { size: item.size }) }}</p>
        <p v-if="item.quantity > 1" class="text-xs text-neutral-quiet">× {{ item.quantity }}</p>
      </div>
      <span class="text-sm font-medium text-neutral flex-shrink-0">{{ formatPrice(item.subtotal) }}</span>
    </div>

    <!-- Empty state -->
    <p
      v-if="addonLineItems.length === 0"
      class="text-sm text-neutral-quiet py-2 border-b divider-muted"
    >
      {{ t('orderSummary.noAddons') }}
    </p>

    <!-- VIP workshop discount -->
    <div
      v-if="vipWorkshopDiscount > 0"
      class="flex justify-between items-center py-2 border-b divider-muted gap-2"
    >
      <span class="text-sm text-neutral-quiet">Workshop discount (VIP 10%)</span>
      <span class="text-sm font-medium text-success">-{{ formatPrice(vipWorkshopDiscount) }}</span>
    </div>

    <!-- Total -->
    <div class="flex justify-between items-center pt-3 mt-1">
      <span class="text-subtitle2 text-neutral">{{ t('orderSummary.total') }}</span>
      <span class="text-subtitle1 text-brand">{{ formatPrice(total) }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRegistration } from 'src/composables/useRegistration.js'
import { usePricingInjected, TICKET_INFO, formatPrice } from 'src/composables/usePricing.js'

const state = useRegistration()
const { ticketPrice, addonLineItems, addonsTotal, total } = usePricingInjected()

const ticketLabel = computed(() => TICKET_INFO[state.ticketType]?.label ?? state.ticketType)
</script>

<template>
  <div class="order-summary rounded-xl border border-neutral-muted bg-surface-l1 p-5 sticky top-4">
    <h3 class="text-subtitle1 text-neutral mb-4">Order Summary</h3>

    <!-- Ticket -->
    <div class="flex justify-between items-center py-2 border-b divider-muted">
      <span class="text-sm text-neutral">{{ ticketLabel }} Ticket</span>
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
        <p v-if="item.size" class="text-xs text-neutral-quiet">Size: {{ item.size }}</p>
        <p v-if="item.quantity > 1" class="text-xs text-neutral-quiet">× {{ item.quantity }}</p>
      </div>
      <span class="text-sm font-medium text-neutral flex-shrink-0">{{ formatPrice(item.subtotal) }}</span>
    </div>

    <!-- Empty state -->
    <p
      v-if="addonLineItems.length === 0"
      class="text-sm text-neutral-quiet py-2 border-b divider-muted"
    >
      No add-ons selected
    </p>

    <!-- Total -->
    <div class="flex justify-between items-center pt-3 mt-1">
      <span class="text-subtitle2 text-neutral">Total</span>
      <span class="text-subtitle1 text-brand">{{ formatPrice(total) }}</span>
    </div>

    <p v-if="state.ticketType === 'vip' && addonLineItems.some(i => i.category === 'workshop')" class="mt-2 text-xs text-accent flex items-center gap-1">
      <span class="material-icons text-sm">local_offer</span>
      VIP discount (10%) applied to workshops
    </p>
  </div>
</template>

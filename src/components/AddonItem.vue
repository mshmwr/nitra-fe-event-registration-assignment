<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseCard from 'src/components/BaseCard.vue'
import QuantityPicker from 'src/components/QuantityPicker.vue'
import { workshopUnitPrice, formatPrice } from 'src/composables/usePricing.js'

const props = defineProps({
  addon: { type: Object, required: true },
  /** { quantity: number, size: string|null } or null if not selected */
  selection: { type: Object, default: null },
  isVip: { type: Boolean, default: false },
  conflictsWithSession: { type: Boolean, default: false },
})

const emit = defineEmits(['update'])

const { t, locale } = useI18n()

const isMerchandise = computed(() => props.addon.category === 'merchandise')
const isSelected = computed(() => props.selection !== null)
const isFull = computed(() => props.addon.capacity != null && props.addon.registered >= props.addon.capacity)
// Only truly disabled when can't be selected AND not already selected
const isDisabled = computed(() => (isFull.value || props.conflictsWithSession) && !isSelected.value)

const remaining = computed(() => {
  if (props.addon.capacity == null) return null
  return props.addon.capacity - props.addon.registered
})

const effectivePrice = computed(() => workshopUnitPrice(props.addon, props.isVip))
const hasVipDiscount = computed(() => props.isVip && props.addon.category === 'workshop')

function formatTimeRange(start, end) {
  const opts = { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }
  const dateOpts = { month: 'short', day: 'numeric', timeZone: 'UTC' }
  const loc = locale.value
  return `${new Date(start).toLocaleDateString(loc, dateOpts)}, ${new Date(start).toLocaleTimeString(loc, opts)} – ${new Date(end).toLocaleTimeString(loc, opts)}`
}

// Workshop / Meal: full-card click toggles selection
function toggleCard() {
  if (isMerchandise.value) return
  if (isDisabled.value) return
  if (isSelected.value) {
    emit('update', props.addon.id, null)
  } else {
    emit('update', props.addon.id, { quantity: 1, size: null })
  }
}

// Merchandise: qty-based — qty 0 = deselected
const currentQty = computed(() => props.selection?.quantity ?? 0)

function handleQtyChange(newQty) {
  if (newQty <= 0) {
    emit('update', props.addon.id, null)
  } else {
    emit('update', props.addon.id, { quantity: newQty, size: props.selection?.size ?? null })
  }
}

function updateSize(size) {
  emit('update', props.addon.id, { quantity: props.selection?.quantity ?? 1, size })
}
</script>

<template>
  <BaseCard
    :selected="isSelected && !(isFull || conflictsWithSession)"
    :error="isSelected && conflictsWithSession"
    :disabled="isDisabled"
    class="addon-item rounded-lg p-4"
    :class="[
      !isDisabled && !isSelected ? 'border-solid bg-surface-l0' : '',
      !isMerchandise && !isDisabled ? 'cursor-pointer' : '',
    ]"
    :style="!isDisabled && !isSelected ? { borderColor: 'var(--border-neutral-muted)' } : {}"
    @click="toggleCard"
  >
    <!-- Name + price -->
    <div class="flex items-start justify-between gap-3">
      <span class="text-subtitle2 text-neutral">{{ addon.name }}</span>
      <div class="flex flex-col items-end flex-shrink-0">
        <span class="text-subtitle2 text-neutral">{{ formatPrice(effectivePrice) }}</span>
        <template v-if="hasVipDiscount">
          <span class="text-xs text-neutral-muted line-through">{{ formatPrice(addon.price) }}</span>
          <span class="text-xs text-success font-medium">{{ t('addons.vipDiscount') }}</span>
        </template>
      </div>
    </div>

    <!-- Description -->
    <p class="text-sm text-neutral-muted mt-0.5 mb-2">{{ addon.description }}</p>

    <!-- Workshop: time + spots + conflict -->
    <div v-if="addon.category === 'workshop'" class="mt-1 flex flex-wrap items-center gap-3 text-xs text-neutral-quiet">
      <span class="flex items-center gap-1">
        <span class="material-icons text-sm">schedule</span>
        {{ formatTimeRange(addon.date, addon.endDate) }}
      </span>
      <span v-if="remaining !== null" :class="remaining <= 5 && !isFull ? 'text-warning' : ''">
        {{ isFull ? 'Sold Out' : t('addons.spotsLeft', remaining) }}
      </span>
      <span v-if="conflictsWithSession" class="flex items-center gap-1 text-danger">
        <span class="material-icons text-sm">warning</span>
        {{ t('addons.conflict') }}
      </span>
    </div>

    <!-- Merchandise: qty + size controls (always visible) -->
    <template v-if="isMerchandise">
      <div class="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2" @click.stop>
        <!-- Size selector (always shown if has sizes) -->
        <div v-if="addon.sizes?.length" class="flex items-center gap-2">
          <span class="text-sm text-neutral-muted">{{ t('addons.size') }}</span>
          <select
            :value="selection?.size ?? ''"
            class="px-2 py-0.5 rounded-md border border-neutral-muted bg-surface-l0 text-sm text-neutral cursor-pointer"
            @change="e => updateSize(e.target.value)"
          >
            <option value="" disabled>{{ t('addons.selectSize') }}</option>
            <option v-for="size in addon.sizes" :key="size" :value="size">{{ size }}</option>
          </select>
        </div>

        <!-- Qty picker (always shown, min=0) -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-neutral-muted">{{ t('addons.qty') }}</span>
          <QuantityPicker
            :model-value="currentQty"
            :min="0"
            :max="addon.maxQuantity ?? 99"
            @update:model-value="handleQtyChange"
          />
          <span class="text-xs text-neutral-quiet">{{ t('addons.max', { count: addon.maxQuantity }) }}</span>
        </div>
      </div>

      <!-- Added to order confirmation -->
      <p v-if="isSelected" class="mt-2 mb-0 text-xs text-success flex items-center gap-1 font-medium">
        <span class="material-icons text-sm">check_circle</span>
        Added to order
      </p>
    </template>
  </BaseCard>
</template>

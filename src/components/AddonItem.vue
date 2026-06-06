<script setup>
import { computed } from 'vue'
import { workshopUnitPrice, formatPrice } from 'src/composables/usePricing.js'

const props = defineProps({
  addon: { type: Object, required: true },
  /** { quantity: number, size: string|null } or undefined if not selected */
  selection: { type: Object, default: null },
  isVip: { type: Boolean, default: false },
  /** Whether workshop conflicts with selected sessions */
  conflictsWithSession: { type: Boolean, default: false },
})

const emit = defineEmits(['update'])

const isSelected = computed(() => props.selection !== null)
const isFull = computed(() => props.addon.capacity != null && props.addon.registered >= props.addon.capacity)
const isDisabled = computed(() => isFull.value || props.conflictsWithSession)

const effectivePrice = computed(() => workshopUnitPrice(props.addon, props.isVip))

const remaining = computed(() => {
  if (props.addon.capacity == null) return null
  return props.addon.capacity - props.addon.registered
})

/**
 * Format ISO date range as "Nov 15, 2:00 PM – 5:00 PM"
 * @param {string} start
 * @param {string} end
 * @returns {string}
 */
function formatTimeRange(start, end) {
  const opts = { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }
  const dateOpts = { month: 'short', day: 'numeric', timeZone: 'UTC' }
  return `${new Date(start).toLocaleDateString('en-US', dateOpts)}, ${new Date(start).toLocaleTimeString('en-US', opts)} – ${new Date(end).toLocaleTimeString('en-US', opts)}`
}

function toggleSelect() {
  if (isDisabled.value) return
  if (isSelected.value) {
    emit('update', props.addon.id, null)
  } else {
    const initial = { quantity: 1, size: props.addon.sizes?.[0] ?? null }
    emit('update', props.addon.id, initial)
  }
}

function updateSize(size) {
  if (!isSelected.value) return
  emit('update', props.addon.id, { ...props.selection, size })
}

function updateQuantity(delta) {
  if (!isSelected.value) return
  const newQty = (props.selection.quantity ?? 1) + delta
  const max = props.addon.maxQuantity ?? 99
  if (newQty < 1 || newQty > max) return
  emit('update', props.addon.id, { ...props.selection, quantity: newQty })
}
</script>

<template>
  <div
    class="addon-item rounded-lg border p-4 transition-all duration-150"
    :class="[
      isDisabled
        ? 'opacity-50 border-neutral-quiet bg-surface-l1'
        : isSelected
          ? 'border-brand-emphasis bg-brand-muted-rest'
          : 'border-neutral-muted bg-surface-l0',
    ]"
  >
    <div class="flex items-start gap-3">
      <!-- Checkbox / toggle area -->
      <button
        type="button"
        :disabled="isDisabled"
        class="mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
        :class="[
          isDisabled
            ? 'border-neutral-muted cursor-not-allowed'
            : isSelected
              ? 'border-[var(--border-brand-emphasis)] bg-[var(--bg-brand-emphasis-rest)] cursor-pointer'
              : 'border-[var(--border-neutral-muted)] cursor-pointer hover:border-[var(--border-brand-emphasis)]',
        ]"
        :aria-checked="isSelected"
        :aria-label="`Select ${addon.name}`"
        @click="toggleSelect"
      >
        <span v-if="isSelected" class="material-icons text-white text-sm">check</span>
      </button>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <span class="text-subtitle2 text-neutral">{{ addon.name }}</span>
            <span
              v-if="addon.category === 'workshop' && isVip"
              class="ml-2 text-xs bg-accent-muted-rest text-accent px-1.5 py-0.5 rounded"
            >
              VIP -10%
            </span>
          </div>
          <div class="text-right flex-shrink-0">
            <span v-if="addon.category === 'workshop' && isVip" class="text-neutral-quiet text-sm line-through mr-1">
              {{ formatPrice(addon.price) }}
            </span>
            <span class="text-subtitle2 text-neutral">{{ formatPrice(effectivePrice) }}</span>
          </div>
        </div>

        <p class="text-sm text-neutral-muted mt-0.5">{{ addon.description }}</p>

        <!-- Workshop time + capacity -->
        <div v-if="addon.category === 'workshop'" class="mt-1 flex flex-wrap items-center gap-3 text-xs text-neutral-quiet">
          <span class="flex items-center gap-1">
            <span class="material-icons text-sm">schedule</span>
            {{ formatTimeRange(addon.date, addon.endDate) }}
          </span>
          <span v-if="remaining !== null" :class="remaining <= 5 ? 'text-warning' : ''">
            {{ isFull ? 'Full' : `${remaining} spot${remaining === 1 ? '' : 's'} left` }}
          </span>
          <span v-if="conflictsWithSession" class="flex items-center gap-1 text-danger">
            <span class="material-icons text-sm">warning</span>
            Conflicts with a selected session
          </span>
        </div>

        <!-- Quantity picker (merchandise) -->
        <div v-if="isSelected && addon.maxQuantity && addon.maxQuantity > 1" class="mt-2 flex items-center gap-2">
          <span class="text-sm text-neutral-muted">Qty:</span>
          <button
            type="button"
            class="w-7 h-7 rounded border border-neutral-muted flex items-center justify-center text-neutral hover:bg-neutral-muted-rest disabled:opacity-40 transition-colors"
            :disabled="selection.quantity <= 1"
            @click="updateQuantity(-1)"
          >
            <span class="material-icons text-sm">remove</span>
          </button>
          <span class="text-sm font-medium text-neutral w-5 text-center">{{ selection.quantity }}</span>
          <button
            type="button"
            class="w-7 h-7 rounded border border-neutral-muted flex items-center justify-center text-neutral hover:bg-neutral-muted-rest disabled:opacity-40 transition-colors"
            :disabled="selection.quantity >= addon.maxQuantity"
            @click="updateQuantity(1)"
          >
            <span class="material-icons text-sm">add</span>
          </button>
          <span class="text-xs text-neutral-quiet">max {{ addon.maxQuantity }}</span>
        </div>

        <!-- Size selector (merchandise with sizes) -->
        <div v-if="isSelected && addon.sizes?.length" class="mt-2 flex flex-wrap items-center gap-2">
          <span class="text-sm text-neutral-muted">Size:</span>
          <button
            v-for="size in addon.sizes"
            :key="size"
            type="button"
            class="px-2.5 py-1 rounded border text-sm transition-colors"
            :class="selection.size === size
              ? 'border-brand-emphasis bg-brand-muted-rest text-brand font-medium'
              : 'border-neutral-muted text-neutral-muted hover:border-neutral-emphasis'"
            @click="updateSize(size)"
          >
            {{ size }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

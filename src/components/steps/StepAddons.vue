<script setup>
import { computed } from 'vue'
import { useRegistration } from 'src/composables/useRegistration.js'
import { useConflicts } from 'src/composables/useConflicts.js'
import { addons } from 'src/mocks/addons.js'
import AddonItem from 'src/components/AddonItem.vue'
import OrderSummary from 'src/components/OrderSummary.vue'

const state = useRegistration()
const selectedSessionIdsRef = computed(() => state.selectedSessionIds)
const { workshopConflictsWithSessions } = useConflicts(selectedSessionIdsRef)

const isVip = computed(() => state.ticketType === 'vip')

const hasMerchandise = computed(() =>
  Object.keys(state.selectedAddons).some(id => {
    const addon = addons.find(a => a.id === id)
    return addon?.category === 'merchandise'
  })
)

const categories = [
  { key: 'workshop', label: 'Workshops' },
  { key: 'meal', label: 'Meal Packages' },
  { key: 'merchandise', label: 'Merchandise' },
]

const addonsByCategory = computed(() => {
  const map = {}
  for (const cat of categories) {
    map[cat.key] = addons.filter(a => a.category === cat.key)
  }
  return map
})

/**
 * Update or remove an addon selection.
 * @param {string} id addon ID
 * @param {{ quantity: number, size: string|null }|null} selection null = deselect
 */
function handleAddonUpdate(id, selection) {
  if (selection === null) {
    delete state.selectedAddons[id]
  } else {
    state.selectedAddons[id] = selection
  }
}
</script>

<template>
  <div class="step-addons">
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Main content -->
      <div class="flex-1 min-w-0 space-y-8">
        <div>
          <h2 class="text-subtitle1 text-neutral mb-1">Add-ons</h2>
          <p class="text-sm text-neutral-muted">Enhance your conference experience with workshops, meals, and merchandise.</p>
        </div>

        <!-- Merchandise shipping banner -->
        <div
          v-if="hasMerchandise"
          class="flex items-start gap-3 p-3 rounded-lg bg-info-muted-rest border border-info-muted text-info text-sm"
        >
          <span class="material-icons text-base flex-shrink-0 mt-0.5">local_shipping</span>
          Merchandise items will be shipped to your address one week before the conference.
          Please ensure your shipping address in Step 1 is correct.
        </div>

        <div v-for="cat in categories" :key="cat.key" class="space-y-3">
          <h3 class="text-sm font-semibold text-neutral-muted uppercase tracking-wide border-b divider-default pb-2">
            {{ cat.label }}
          </h3>
          <div class="space-y-2">
            <AddonItem
              v-for="addon in addonsByCategory[cat.key]"
              :key="addon.id"
              :addon="addon"
              :selection="state.selectedAddons[addon.id] ?? null"
              :is-vip="isVip"
              :conflicts-with-session="addon.category === 'workshop' && workshopConflictsWithSessions(addon)"
              @update="handleAddonUpdate"
            />
          </div>
        </div>
      </div>

      <!-- Order summary sidebar -->
      <div class="lg:w-64 xl:w-72 flex-shrink-0">
        <OrderSummary />
      </div>
    </div>
  </div>
</template>

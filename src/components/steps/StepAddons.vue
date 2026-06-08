<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRegistration } from 'src/composables/useRegistration.js'
import { useConflicts } from 'src/composables/useConflicts.js'
import { addons } from 'src/mocks/addons.js'
import AddonItem from 'src/components/AddonItem.vue'
import OrderSummary from 'src/components/OrderSummary.vue'
import TabSwitcher from 'src/components/TabSwitcher.vue'

const props = defineProps({
  hasMerchandise: { type: Boolean, default: false },
  step3Errors: { type: Object, default: () => ({}) },
  showErrors: { type: Boolean, default: false },
})

const { t } = useI18n()

const state = useRegistration()
const selectedSessionIdsRef = computed(() => state.selectedSessionIds)
const { workshopConflictsWithSessions } = useConflicts(selectedSessionIdsRef)

const isVip = computed(() => state.ticketType === 'vip')

const categories = [
  { key: 'workshop', labelKey: 'addons.categories.workshop' },
  { key: 'meal', labelKey: 'addons.categories.meal' },
  { key: 'merchandise', labelKey: 'addons.categories.merchandise' },
]

const activeCategory = ref('workshop')

const categoryTabs = computed(() =>
  categories.map(c => ({ value: c.key, label: t(c.labelKey) }))
)

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
        <h2 class="text-h3 font-bold text-neutral">{{ t('addons.title') }}</h2>

        <!-- Workshop conflict validation error (shown after submit attempt) -->
        <div
          v-if="showErrors && step3Errors.workshopConflicts"
          class="flex items-start gap-3 p-3 rounded-lg bg-danger-muted-rest border border-danger-muted text-danger text-sm"
        >
          <span class="material-icons text-base flex-shrink-0 mt-0.5">warning</span>
          {{ step3Errors.workshopConflicts }}
        </div>

        <!-- Merchandise shipping banner (informational) -->
        <div
          v-if="hasMerchandise"
          class="p-4 rounded-lg bg-info-subtle-rest border border-solid text-sm"
          :style="{ borderColor: 'var(--border-info-opacity)' }"
        >
          <div class="flex items-center gap-2 mb-1">
            <span class="material-icons text-base text-info">info</span>
            <span class="font-semibold text-neutral">{{ t('addons.shippingTitle') }}</span>
          </div>
          <p class="text-neutral-muted">{{ t('addons.shippingBanner') }}</p>
        </div>

        <TabSwitcher v-model="activeCategory" :tabs="categoryTabs" />

        <div class="space-y-2">
          <AddonItem
            v-for="addon in addonsByCategory[activeCategory]"
            :key="addon.id"
            :addon="addon"
            :selection="state.selectedAddons[addon.id] ?? null"
            :is-vip="isVip"
            :conflicts-with-session="addon.category === 'workshop' && workshopConflictsWithSessions(addon)"
            @update="handleAddonUpdate"
          />
        </div>
      </div>

      <!-- Order summary sidebar -->
      <div class="lg:w-64 xl:w-72 flex-shrink-0">
        <OrderSummary />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRegistration } from 'src/composables/useRegistration.js'
import { usePricingInjected, formatPrice } from 'src/composables/usePricing.js'
import { sessions } from 'src/mocks/sessions.js'

const props = defineProps({
  stepHasErrors: { type: Object, default: () => ({}) },
  step3Errors: { type: Object, default: () => ({}) },
  showErrors: { type: Boolean, default: false },
})

const emit = defineEmits(['goto-step', 'submit'])

const { t, locale } = useI18n()

const state = useRegistration()
const { ticketPrice, addonLineItems, total } = usePricingInjected()

const ticketLabel = computed(() => t(`tickets.${state.ticketType}.label`))

const selectedSessions = computed(() =>
  sessions.filter(s => state.selectedSessionIds.includes(s.id))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
)

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString(locale.value, { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' })
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(locale.value, { month: 'long', day: 'numeric', timeZone: 'UTC' })
}
</script>

<template>
  <div class="step-review space-y-6">
    <div>
      <h2 class="text-subtitle1 text-neutral mb-1">{{ t('review.title') }}</h2>
      <p class="text-sm text-neutral-muted">{{ t('review.hint') }}</p>
    </div>

    <!-- Validation error summary -->
    <div
      v-if="showErrors && (stepHasErrors[1] || stepHasErrors[2] || stepHasErrors[3])"
      class="p-4 rounded-lg bg-danger-muted-rest border border-danger-muted space-y-2"
    >
      <div class="flex items-center gap-2 text-danger font-medium text-sm">
        <span class="material-icons text-base">error_outline</span>
        {{ t('review.fixIssues') }}
      </div>
      <ul class="space-y-1 pl-6">
        <li v-if="stepHasErrors[1]" class="text-sm text-danger">
          <button type="button" class="underline hover:no-underline" @click="emit('goto-step', 1)">
            {{ t('review.errorStep1') }}
          </button>
        </li>
        <li v-if="stepHasErrors[2]" class="text-sm text-danger">
          <button type="button" class="underline hover:no-underline" @click="emit('goto-step', 2)">
            {{ t('review.errorStep2') }}
          </button>
        </li>
        <li v-if="stepHasErrors[3]" class="text-sm text-danger">
          <button type="button" class="underline hover:no-underline" @click="emit('goto-step', 3)">
            {{ step3Errors.workshopConflicts
              ? t('review.errorStep3Workshop')
              : t('review.errorStep3Shipping') }}
          </button>
        </li>
      </ul>
    </div>

    <!-- Step 1: Attendee Info -->
    <section class="rounded-xl border border-neutral-muted bg-surface-l1 overflow-hidden">
      <div class="flex items-center justify-between px-5 py-3 bg-surface-l2 border-b divider-default">
        <h3 class="text-subtitle2 text-neutral flex items-center gap-2">
          <span v-if="stepHasErrors[1] && showErrors" class="material-icons text-danger text-base">error</span>
          {{ t('review.sectionAttendee') }}
        </h3>
        <button type="button" class="text-sm text-brand hover:text-brand-emphasis" @click="emit('goto-step', 1)">
          {{ t('review.edit') }}
        </button>
      </div>
      <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <p class="text-xs text-neutral-quiet mb-0.5">{{ t('review.fieldTicket') }}</p>
          <p class="text-sm text-neutral font-medium">{{ ticketLabel }}</p>
        </div>
        <div>
          <p class="text-xs text-neutral-quiet mb-0.5">{{ t('review.fieldName') }}</p>
          <p class="text-sm text-neutral">{{ state.attendee.name || '—' }}</p>
        </div>
        <div>
          <p class="text-xs text-neutral-quiet mb-0.5">{{ t('review.fieldEmail') }}</p>
          <p class="text-sm text-neutral">{{ state.attendee.email || '—' }}</p>
        </div>
        <div>
          <p class="text-xs text-neutral-quiet mb-0.5">{{ t('review.fieldPhone') }}</p>
          <p class="text-sm text-neutral">{{ state.attendee.phone || '—' }}</p>
        </div>
        <div>
          <p class="text-xs text-neutral-quiet mb-0.5">{{ t('review.fieldCompany') }}</p>
          <p class="text-sm text-neutral">{{ state.attendee.company || '—' }}</p>
        </div>
        <div>
          <p class="text-xs text-neutral-quiet mb-0.5">{{ t('review.fieldJobTitle') }}</p>
          <p class="text-sm text-neutral">{{ state.attendee.jobTitle || '—' }}</p>
        </div>
        <div v-if="state.attendee.shippingAddress" class="sm:col-span-2">
          <p class="text-xs text-neutral-quiet mb-0.5">{{ t('review.fieldShipping') }}</p>
          <p class="text-sm text-neutral">{{ state.attendee.shippingAddress }}</p>
        </div>
      </div>
    </section>

    <!-- Step 2: Sessions -->
    <section class="rounded-xl border border-neutral-muted bg-surface-l1 overflow-hidden">
      <div class="flex items-center justify-between px-5 py-3 bg-surface-l2 border-b divider-default">
        <h3 class="text-subtitle2 text-neutral flex items-center gap-2">
          <span v-if="stepHasErrors[2] && showErrors" class="material-icons text-danger text-base">error</span>
          {{ t('review.sectionSessions', { count: selectedSessions.length }) }}
        </h3>
        <button type="button" class="text-sm text-brand hover:text-brand-emphasis" @click="emit('goto-step', 2)">
          {{ t('review.edit') }}
        </button>
      </div>
      <div class="p-5">
        <p v-if="selectedSessions.length === 0" class="text-sm text-neutral-quiet">{{ t('review.noSessions') }}</p>
        <ul v-else class="space-y-2">
          <li
            v-for="s in selectedSessions"
            :key="s.id"
            class="flex items-start gap-2 text-sm text-neutral"
          >
            <span class="material-icons text-success text-base flex-shrink-0 mt-0.5">event</span>
            <div>
              <p class="font-medium">{{ s.title }}</p>
              <p class="text-neutral-muted text-xs">
                {{ formatDate(s.date) }} · {{ formatTime(s.date) }} – {{ formatTime(s.endDate) }}
              </p>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- Step 3: Add-ons -->
    <section class="rounded-xl border border-neutral-muted bg-surface-l1 overflow-hidden">
      <div class="flex items-center justify-between px-5 py-3 bg-surface-l2 border-b divider-default">
        <h3 class="text-subtitle2 text-neutral flex items-center gap-2">
          <span v-if="stepHasErrors[3] && showErrors" class="material-icons text-danger text-base">error</span>
          {{ t('review.sectionAddons', { count: addonLineItems.length }) }}
        </h3>
        <button type="button" class="text-sm text-brand hover:text-brand-emphasis" @click="emit('goto-step', 3)">
          {{ t('review.edit') }}
        </button>
      </div>
      <div class="p-5">
        <p v-if="addonLineItems.length === 0" class="text-sm text-neutral-quiet">{{ t('review.noAddons') }}</p>
        <ul v-else class="space-y-1">
          <li
            v-for="item in addonLineItems"
            :key="item.id"
            class="flex justify-between items-baseline gap-2 text-sm"
          >
            <span class="text-neutral min-w-0">
              {{ item.name }}
              <span v-if="item.size" class="text-neutral-muted text-xs">({{ item.size }})</span>
              <span v-if="item.quantity > 1" class="text-neutral-muted text-xs"> × {{ item.quantity }}</span>
            </span>
            <span class="text-neutral font-medium flex-shrink-0 whitespace-nowrap">{{ formatPrice(item.subtotal) }}</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- Pricing breakdown -->
    <section class="rounded-xl border border-neutral-muted bg-surface-l1 overflow-hidden">
      <div class="px-5 py-3 bg-surface-l2 border-b divider-default">
        <h3 class="text-subtitle2 text-neutral">{{ t('review.sectionPricing') }}</h3>
      </div>
      <div class="p-5 space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-neutral-muted">{{ t('review.ticketLine', { label: ticketLabel }) }}</span>
          <span class="text-neutral">{{ formatPrice(ticketPrice) }}</span>
        </div>
        <div
          v-for="item in addonLineItems"
          :key="item.id"
          class="flex justify-between gap-2 text-sm"
        >
          <span class="text-neutral-muted min-w-0">{{ item.name }}<span v-if="item.quantity > 1"> × {{ item.quantity }}</span></span>
          <span class="text-neutral flex-shrink-0 whitespace-nowrap">{{ formatPrice(item.subtotal) }}</span>
        </div>
        <div class="border-t divider-default pt-2 flex justify-between font-medium">
          <span class="text-neutral">{{ t('review.total') }}</span>
          <span class="text-brand text-subtitle1">{{ formatPrice(total) }}</span>
        </div>
      </div>
    </section>

    <!-- Submit -->
    <div class="flex justify-end">
      <q-btn
        :label="t('review.submit')"
        color="primary"
        unelevated
        size="md"
        class="px-8"
        @click="emit('submit')"
      />
    </div>
  </div>
</template>

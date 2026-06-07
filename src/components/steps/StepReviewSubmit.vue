<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRegistration } from 'src/composables/useRegistration.js'
import { usePricingInjected, formatPrice } from 'src/composables/usePricing.js'
import { sessions } from 'src/mocks/sessions.js'
import ReviewSection from 'src/components/ReviewSection.vue'
import ReviewRow from 'src/components/ReviewRow.vue'

const props = defineProps({
  stepHasErrors: { type: Object, required: true },
  step3Errors: { type: Object, required: true },
  showErrors: { type: Boolean, required: true },
})

const emit = defineEmits(['goto-step', 'submit'])

const { t, locale } = useI18n()

const state = useRegistration()
const { ticketPrice, addonLineItems, vipWorkshopDiscount, total } = usePricingInjected()

const ticketLabel = computed(() => t(`tickets.${state.ticketType}.label`))
const ticketDisplay = computed(() => `${ticketLabel.value} (${formatPrice(ticketPrice.value)})`)

const selectedSessions = computed(() =>
  sessions.filter(s => state.selectedSessionIds.includes(s.id))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
)

function formatDateTime(iso) {
  const d = new Date(iso)
  const date = d.toLocaleDateString(locale.value, { month: 'short', day: 'numeric', timeZone: 'UTC' })
  const time = d.toLocaleTimeString(locale.value, { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' })
  return `${date}, ${time}`
}

function categoryLabel(cat) {
  const map = { workshop: 'Workshop', meal: 'Meal Package', merchandise: 'Merchandise' }
  return map[cat] ?? cat
}
</script>

<template>
  <div class="step-review space-y-6">
    <h2 class="text-2xl font-semibold text-neutral">{{ t('review.title') }}</h2>

    <!-- Validation error summary -->
    <div
      v-if="showErrors && (stepHasErrors[1] || stepHasErrors[2] || stepHasErrors[3])"
      class="p-4 rounded-md bg-danger-muted-rest border border-danger-muted space-y-2"
    >
      <div class="flex items-center gap-2 text-danger font-medium text-sm">
        <span class="material-icons text-base">error_outline</span>
        {{ t('review.fixIssues') }}
      </div>
      <ul class="space-y-1 pl-6">
        <li v-if="stepHasErrors[1]" class="text-sm text-danger">
          <button type="button" class="underline hover:no-underline border-0 bg-transparent p-0 cursor-pointer" @click="emit('goto-step', 1)">
            {{ t('review.errorStep1') }}
          </button>
        </li>
        <li v-if="stepHasErrors[2]" class="text-sm text-danger">
          <button type="button" class="underline hover:no-underline border-0 bg-transparent p-0 cursor-pointer" @click="emit('goto-step', 2)">
            {{ t('review.errorStep2') }}
          </button>
        </li>
        <li v-if="stepHasErrors[3]" class="text-sm text-danger">
          <button type="button" class="underline hover:no-underline border-0 bg-transparent p-0 cursor-pointer" @click="emit('goto-step', 3)">
            {{ step3Errors.workshopConflicts ? t('review.errorStep3Workshop') : t('review.errorStep3Shipping') }}
          </button>
        </li>
      </ul>
    </div>

    <!-- Attendee Information -->
    <ReviewSection
      :title="t('review.sectionAttendee')"
      :step="1"
      :has-error="stepHasErrors[1]"
      :show-errors="showErrors"
      @edit="emit('goto-step', 1)"
    >
      <ReviewRow :label="t('review.fieldName')" :value="state.attendee.name" />
      <ReviewRow :label="t('review.fieldEmail')" :value="state.attendee.email" />
      <ReviewRow :label="t('review.fieldPhone')" :value="state.attendee.phone" />
      <ReviewRow :label="t('review.fieldCompany')" :value="state.attendee.company" />
      <ReviewRow :label="t('review.fieldJobTitle')" :value="state.attendee.jobTitle" />
      <ReviewRow :label="t('review.fieldTicket')" :value="ticketDisplay" />
      <ReviewRow v-if="state.attendee.shippingAddress" :label="t('review.fieldShipping')" :value="state.attendee.shippingAddress" />
    </ReviewSection>

    <!-- Selected Sessions -->
    <ReviewSection
      :title="t('review.sectionSessions')"
      :step="2"
      :has-error="stepHasErrors[2]"
      :show-errors="showErrors"
      @edit="emit('goto-step', 2)"
    >
      <p v-if="selectedSessions.length === 0" class="text-sm text-neutral-quiet">{{ t('review.noSessions') }}</p>
      <ReviewRow
        v-for="s in selectedSessions"
        :key="s.id"
        :label="formatDateTime(s.date)"
        :value="s.title"
      />
    </ReviewSection>

    <!-- Add-ons -->
    <ReviewSection
      :title="t('review.sectionAddons')"
      :step="3"
      :has-error="stepHasErrors[3]"
      :show-errors="showErrors"
      @edit="emit('goto-step', 3)"
    >
      <p v-if="addonLineItems.length === 0" class="text-sm text-neutral-quiet">{{ t('review.noAddons') }}</p>
      <ReviewRow
        v-for="item in addonLineItems"
        :key="item.id"
        :label="categoryLabel(item.category)"
        :value="`${item.name} (${formatPrice(item.unitPrice)})`"
      />
    </ReviewSection>

    <!-- Pricing Summary (no edit link) -->
    <ReviewSection
      :title="t('review.sectionPricing')"
      :step="0"
      :has-error="false"
      :show-errors="false"
    >
      <ReviewRow :label="t('review.ticketLine', { label: ticketLabel })" :value="formatPrice(ticketPrice)" />
      <ReviewRow
        v-for="item in addonLineItems"
        :key="item.id"
        :label="item.quantity > 1 ? `${item.name} × ${item.quantity}` : item.name"
        :value="formatPrice(item.subtotal)"
      />
      <div
        v-if="vipWorkshopDiscount > 0"
        class="flex justify-between gap-4"
        style="font-size: 11px; color: rgba(38,77,79,1);"
      >
        <span>{{ t('orderSummary.vipNote') }}</span>
        <span class="flex-shrink-0">-{{ formatPrice(vipWorkshopDiscount) }}</span>
      </div>
      <div class="border-t border-neutral-muted pt-2 flex justify-between text-sm font-medium">
        <span class="text-neutral">{{ t('review.total') }}</span>
        <span class="text-neutral">{{ formatPrice(total) }}</span>
      </div>
    </ReviewSection>

    <!-- Submit -->
    <div class="flex justify-end">
      <button
        type="button"
        class="px-6 py-3 rounded-lg text-white text-base font-semibold border-0 cursor-pointer"
        style="background-color: #fb7429;"
        @click="emit('submit')"
      >
        {{ t('review.submit') }}
      </button>
    </div>
  </div>
</template>

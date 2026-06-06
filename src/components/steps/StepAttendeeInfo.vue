<script setup>
import { useI18n } from 'vue-i18n'
import { useRegistration } from 'src/composables/useRegistration.js'
import { TICKET_TYPES } from 'src/composables/usePricing.js'
import TicketCard from 'src/components/TicketCard.vue'

const props = defineProps({
  errors: { type: Object, default: () => ({}) },
  showErrors: { type: Boolean, default: false },
})

const { t } = useI18n()

const state = useRegistration()

/**
 * Whether a field should show its error state.
 * @param {string} field
 * @returns {boolean}
 */
function hasError(field) {
  return props.showErrors && !!props.errors[field]
}
</script>

<template>
  <div class="step-attendee space-y-8">
    <!-- Ticket type -->
    <section>
      <h2 class="text-subtitle1 text-neutral mb-1">{{ t('tickets.sectionTitle') }}</h2>
      <p class="text-sm text-neutral-muted mb-4">{{ t('tickets.sectionHint') }}</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TicketCard
          v-for="type in TICKET_TYPES"
          :key="type"
          :type="type"
          :selected="state.ticketType === type"
          @select="state.ticketType = $event"
        />
      </div>
    </section>

    <!-- Personal info -->
    <section>
      <h2 class="text-subtitle1 text-neutral mb-4">{{ t('attendee.personalInfo') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <q-input
          v-model="state.attendee.name"
          :label="t('attendee.name')"
          outlined
          :error="hasError('name')"
          :error-message="errors.name"
          bg-color="white"
        />

        <q-input
          v-model="state.attendee.email"
          :label="t('attendee.email')"
          type="email"
          outlined
          :error="hasError('email')"
          :error-message="errors.email"
          bg-color="white"
        />

        <q-input
          v-model="state.attendee.phone"
          :label="t('attendee.phone')"
          type="tel"
          outlined
          :error="hasError('phone')"
          :error-message="errors.phone"
          bg-color="white"
        />

        <q-input
          v-model="state.attendee.company"
          :label="t('attendee.company')"
          outlined
          :error="hasError('company')"
          :error-message="errors.company"
          bg-color="white"
        />

        <q-input
          v-model="state.attendee.jobTitle"
          :label="t('attendee.jobTitle')"
          outlined
          :error="hasError('jobTitle')"
          :error-message="errors.jobTitle"
          bg-color="white"
          class="md:col-span-2"
        />

        <q-input
          v-model="state.attendee.shippingAddress"
          :label="t('attendee.shippingAddress')"
          :hint="t('attendee.shippingHint')"
          outlined
          :error="hasError('shippingAddress')"
          :error-message="errors.shippingAddress"
          bg-color="white"
          class="md:col-span-2"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useRegistration } from 'src/composables/useRegistration.js'
import { TICKET_TYPES } from 'src/composables/usePricing.js'
import TicketCard from 'src/components/TicketCard.vue'
import FormField from 'src/components/FormField.vue'

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
      <h2 class="text-subtitle1 font-semibold text-neutral mb-4">{{ t('tickets.sectionTitle') }}</h2>
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
      <h2 class="text-h3 font-bold text-neutral mb-4">{{ t('attendee.personalInfo') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

        <FormField
          v-model="state.attendee.name"
          :label="t('attendee.name')"
          :placeholder="t('attendee.namePlaceholder')"
          :error="hasError('name')"
          :error-message="errors.name"
        />

        <FormField
          v-model="state.attendee.email"
          type="email"
          :label="t('attendee.email')"
          :placeholder="t('attendee.emailPlaceholder')"
          :error="hasError('email')"
          :error-message="errors.email"
        />

        <FormField
          v-model="state.attendee.phone"
          type="tel"
          :label="t('attendee.phone')"
          :placeholder="t('attendee.phonePlaceholder')"
          :error="hasError('phone')"
          :error-message="errors.phone"
        />

        <FormField
          v-model="state.attendee.company"
          :label="t('attendee.company')"
          :placeholder="t('attendee.companyPlaceholder')"
          :error="hasError('company')"
          :error-message="errors.company"
        />

        <FormField
          v-model="state.attendee.jobTitle"
          :label="t('attendee.jobTitle')"
          :placeholder="t('attendee.jobTitlePlaceholder')"
          :error="hasError('jobTitle')"
          :error-message="errors.jobTitle"
          class="md:col-span-2"
        />

        <FormField
          v-model="state.attendee.shippingAddress"
          :label="t('attendee.shippingAddress')"
          :placeholder="t('attendee.shippingPlaceholder')"
          :error="hasError('shippingAddress')"
          :error-message="errors.shippingAddress"
          class="md:col-span-2"
        />
      </div>
    </section>
  </div>
</template>

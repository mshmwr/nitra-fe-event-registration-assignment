<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { provideRegistration } from 'src/composables/useRegistration.js'
import { useConflicts } from 'src/composables/useConflicts.js'
import { useValidation } from 'src/composables/useValidation.js'
import { providePricing } from 'src/composables/usePricing.js'
import StepperNav from 'src/components/StepperNav.vue'
import StepAttendeeInfo from 'src/components/steps/StepAttendeeInfo.vue'
import StepSessionSelection from 'src/components/steps/StepSessionSelection.vue'
import StepAddons from 'src/components/steps/StepAddons.vue'
import StepReviewSubmit from 'src/components/steps/StepReviewSubmit.vue'

const { t } = useI18n()

const state = provideRegistration()

const selectedSessionIdsRef = computed(() => state.selectedSessionIds)
const selectedAddonsRef = computed(() => state.selectedAddons)
const { conflictingSessionIds, conflictingWorkshopIds } = useConflicts(selectedSessionIdsRef, selectedAddonsRef)
const { step1Errors, step2Errors, step3Errors, stepHasErrors, isValid, hasMerchandise } = useValidation(state, conflictingSessionIds, conflictingWorkshopIds)

const ticketTypeRef = computed(() => state.ticketType)
providePricing(ticketTypeRef, selectedAddonsRef)

const currentStep = computed(() => state.currentStep)

/** Validation errors shown only after first submit attempt */
const showErrors = computed(() => state.validationTriggered)

const nextLabel = computed(() => {
  const labels = { 1: t('nav.nextSessions'), 2: t('nav.nextAddons'), 3: t('nav.nextReview') }
  return labels[currentStep.value] ?? t('nav.continue')
})

function goTo(step) {
  state.currentStep = step
}

function next() {
  if (state.currentStep < 4) state.currentStep++
}

function back() {
  if (state.currentStep > 1) state.currentStep--
}

function submit() {
  state.validationTriggered = true
  if (!isValid.value) return
  state.submitted = true
}

</script>

<template>
  <div class="registration-wizard max-w-4xl mx-auto">

    <!-- Success screen -->
    <Transition name="fade" mode="out-in">
      <div v-if="state.submitted" class="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <div class="w-16 h-16 rounded-full bg-success-muted-rest flex items-center justify-center">
          <span class="material-icons text-success text-4xl">check_circle</span>
        </div>
        <h2 class="text-h3 text-neutral">{{ t('success.title') }}</h2>
        <i18n-t keypath="success.message" tag="p" class="text-neutral-muted max-w-md" scope="global">
          <template #name><strong>{{ state.attendee.name }}</strong></template>
          <template #event><strong>{{ t('app.title') }}</strong></template>
          <template #email><strong>{{ state.attendee.email }}</strong></template>
        </i18n-t>
      </div>

      <!-- Wizard -->
      <div v-else class="space-y-6">
        <!-- Step header -->
        <StepperNav
          :current-step="currentStep"
          :show-errors="showErrors"
          :step-has-errors="stepHasErrors"
          @goto="goTo"
        />

        <!-- Step content card -->
        <div class="bg-surface-l0 rounded-2xl border border-neutral-muted p-6 md:p-8">
          <Transition name="slide" mode="out-in">
            <StepAttendeeInfo
              v-if="currentStep === 1"
              :key="1"
              :errors="step1Errors"
              :show-errors="showErrors"
            />
            <StepSessionSelection
              v-else-if="currentStep === 2"
              :key="2"
              :errors="step2Errors"
              :show-errors="showErrors"
            />
            <StepAddons
              v-else-if="currentStep === 3"
              :key="3"
              :has-merchandise="hasMerchandise"
              :step3-errors="step3Errors"
              :show-errors="showErrors"
            />
            <StepReviewSubmit
              v-else-if="currentStep === 4"
              :key="4"
              :step-has-errors="stepHasErrors"
              :step3-errors="step3Errors"
              :show-errors="showErrors"
              @goto-step="goTo"
              @submit="submit"
            />
          </Transition>
        </div>

        <!-- Navigation buttons -->
        <div class="flex items-center justify-between">
          <button
            v-if="currentStep > 1"
            type="button"
            class="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-neutral-muted-rest text-sm font-semibold text-neutral-muted transition-colors hover:bg-neutral-muted"
            @click="back"
          >
            <span class="material-icons text-base">arrow_back</span>
            {{ t('nav.back') }}
          </button>
          <span v-else />

          <q-btn
            v-if="currentStep < 4"
            :label="nextLabel"
            no-caps
            unelevated
            class="cta-btn"
            @click="next"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.slide-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

.cta-btn {
  background-color: #fb7429 !important;
  color: white !important;
  border-radius: 10px !important;
  font-weight: 600;
}
</style>

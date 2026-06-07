<script setup>
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRegistration } from 'src/composables/useRegistration.js'
import { useConflicts } from 'src/composables/useConflicts.js'
import { useValidation } from 'src/composables/useValidation.js'
import { providePricing } from 'src/composables/usePricing.js'
import StepAttendeeInfo from 'src/components/steps/StepAttendeeInfo.vue'
import StepSessionSelection from 'src/components/steps/StepSessionSelection.vue'
import StepAddons from 'src/components/steps/StepAddons.vue'
import StepReviewSubmit from 'src/components/steps/StepReviewSubmit.vue'
import Divider from 'src/components/Divider.vue'

const { t } = useI18n()

const state = useRegistration()

const selectedSessionIdsRef = computed(() => state.selectedSessionIds)
const selectedAddonsRef = computed(() => state.selectedAddons)
const { conflictingSessionIds, conflictingWorkshopIds } = useConflicts(selectedSessionIdsRef, selectedAddonsRef)
const { step1Errors, step2Errors, step3Errors, stepHasErrors, isValid, hasMerchandise } = useValidation(state, conflictingSessionIds, conflictingWorkshopIds)

const ticketTypeRef = computed(() => state.ticketType)
providePricing(ticketTypeRef, selectedAddonsRef)

const currentStep = computed(() => state.currentStep)

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

watch(() => state.currentStep, (step) => {
  if (step === 4) state.validationTriggered = true
})

</script>

<template>
  <div class="registration-wizard">

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
      <div v-else class="space-y-2">
        <!-- Step content -->
        <Transition name="slide" mode="out-in">
          <StepAttendeeInfo
            v-if="currentStep === 1"
            :key="1"
            :errors="step1Errors"
            :show-errors="showErrors"
            :has-merchandise="hasMerchandise"
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
            :step1-errors="step1Errors"
            :step2-errors="step2Errors"
            :step3-errors="step3Errors"
            :show-errors="showErrors"
            @goto-step="goTo"
            @submit="submit"
          />
        </Transition>

        <!-- Navigation buttons -->
        <div style="width: 100vw; margin-left: calc(50% - 50vw); margin-top: 40px;">
          <Divider />
        </div>
        <div class="flex items-center justify-between pt-4">
          <button
            v-if="currentStep > 1"
            type="button"
            class="px-4 py-2.5 rounded-[10px] border-0 bg-neutral-muted-rest text-sm font-semibold text-neutral-muted transition-colors hover:bg-neutral-muted cursor-pointer"
            @click="back"
          >
            {{ t('nav.back') }}
          </button>
          <span v-else />

          <q-btn
            v-if="currentStep < 4"
            :label="nextLabel"
            :disable="currentStep === 2 && !!step2Errors.conflicts"
            no-caps
            unelevated
            class="cta-btn"
            @click="next"
          />
          <q-btn
            v-else
            :label="t('review.submit')"
            :disable="showErrors && !isValid"
            no-caps
            unelevated
            class="cta-btn"
            @click="submit"
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
  background-color: var(--bg-accent-emphasis-rest) !important;
  color: white !important;
  border-radius: 10px !important;
  font-weight: 600;
  transition: background-color 0.15s ease;
}
.cta-btn:hover {
  background-color: var(--bg-accent-emphasis-hover) !important;
}
.cta-btn:active {
  background-color: var(--bg-accent-emphasis-active) !important;
}
</style>

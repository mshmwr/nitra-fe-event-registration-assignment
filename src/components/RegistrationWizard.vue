<script setup>
import { computed } from 'vue'
import { provideRegistration } from 'src/composables/useRegistration.js'
import { useConflicts } from 'src/composables/useConflicts.js'
import { useValidation } from 'src/composables/useValidation.js'
import { providePricing } from 'src/composables/usePricing.js'
import StepAttendeeInfo from 'src/components/steps/StepAttendeeInfo.vue'
import StepSessionSelection from 'src/components/steps/StepSessionSelection.vue'
import StepAddons from 'src/components/steps/StepAddons.vue'
import StepReviewSubmit from 'src/components/steps/StepReviewSubmit.vue'

const state = provideRegistration()

const selectedSessionIdsRef = computed(() => state.selectedSessionIds)
const selectedAddonsRef = computed(() => state.selectedAddons)
const { conflictingSessionIds, conflictingWorkshopIds } = useConflicts(selectedSessionIdsRef, selectedAddonsRef)
const { step1Errors, step2Errors, step3Errors, stepHasErrors, isValid, hasMerchandise } = useValidation(state, conflictingSessionIds, conflictingWorkshopIds)

const ticketTypeRef = computed(() => state.ticketType)
providePricing(ticketTypeRef, selectedAddonsRef)

const STEPS = [
  { number: 1, label: 'Attendee Info', icon: 'person' },
  { number: 2, label: 'Sessions', icon: 'event' },
  { number: 3, label: 'Add-ons', icon: 'shopping_cart' },
  { number: 4, label: 'Review & Submit', icon: 'check_circle' },
]

const currentStep = computed(() => state.currentStep)

/** Validation errors shown only after first submit attempt */
const showErrors = computed(() => state.validationTriggered)

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

/**
 * Step header status for a given step number.
 * @param {number} n
 * @returns {'active'|'done'|'error'|'pending'}
 */
function stepStatus(n) {
  if (n === currentStep.value) return 'active'
  if (n < currentStep.value) {
    return (showErrors.value && stepHasErrors.value[n]) ? 'error' : 'done'
  }
  return (showErrors.value && stepHasErrors.value[n]) ? 'error' : 'pending'
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
        <h2 class="text-h3 text-neutral">You're registered!</h2>
        <p class="text-neutral-muted max-w-md">
          Thanks, <strong>{{ state.attendee.name }}</strong>! Your registration for
          <strong>WebDev Summit 2028</strong> has been submitted. A confirmation will be sent to
          <strong>{{ state.attendee.email }}</strong>.
        </p>
      </div>

      <!-- Wizard -->
      <div v-else class="space-y-6">
        <!-- Step header -->
        <nav class="flex items-center gap-0" aria-label="Registration steps">
          <template v-for="(step, idx) in STEPS" :key="step.number">
            <!-- Step indicator -->
            <button
              type="button"
              class="flex items-center gap-2 py-2 px-2 sm:px-3 rounded-lg transition-colors group min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              :class="{
                'cursor-pointer': step.number < currentStep || stepStatus(step.number) === 'done' || stepStatus(step.number) === 'error',
                'cursor-default': step.number > currentStep && stepStatus(step.number) !== 'done' && stepStatus(step.number) !== 'error',
              }"
              :aria-current="step.number === currentStep ? 'step' : undefined"
              @click="(step.number < currentStep || stepStatus(step.number) === 'done' || stepStatus(step.number) === 'error') && goTo(step.number)"
            >
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 transition-colors"
                :class="{
                  'bg-brand-emphasis-rest text-white': stepStatus(step.number) === 'active',
                  'bg-success-muted-rest text-success': stepStatus(step.number) === 'done',
                  'bg-danger-muted-rest text-danger': stepStatus(step.number) === 'error',
                  'bg-neutral-muted-rest text-neutral-quiet': stepStatus(step.number) === 'pending',
                }"
              >
                <span v-if="stepStatus(step.number) === 'done'" class="material-icons text-sm">check</span>
                <span v-else-if="stepStatus(step.number) === 'error'" class="material-icons text-sm">error</span>
                <span v-else>{{ step.number }}</span>
              </div>
              <span
                class="text-sm font-medium transition-colors truncate"
                :class="{
                  'hidden sm:block': step.number !== currentStep,
                  'text-neutral': stepStatus(step.number) === 'active',
                  'text-success': stepStatus(step.number) === 'done',
                  'text-danger': stepStatus(step.number) === 'error',
                  'text-neutral-quiet': stepStatus(step.number) === 'pending',
                }"
              >
                {{ step.label }}
              </span>
            </button>

            <!-- Connector line (except after last step) -->
            <div
              v-if="idx < STEPS.length - 1"
              class="flex-1 h-px mx-1 transition-colors"
              :class="step.number < currentStep ? 'bg-[var(--bg-success-emphasis-rest)]' : 'bg-[var(--divider-default)]'"
            />
          </template>
        </nav>

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
          <q-btn
            v-if="currentStep > 1"
            flat
            label="Back"
            icon="arrow_back"
            color="primary"
            @click="back"
          />
          <span v-else />

          <q-btn
            v-if="currentStep < 4"
            label="Continue"
            icon-right="arrow_forward"
            color="primary"
            unelevated
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
</style>

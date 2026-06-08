<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { provideRegistration } from 'src/composables/useRegistration.js'
import { useConflicts } from 'src/composables/useConflicts.js'
import { useValidation } from 'src/composables/useValidation.js'
import StepperNav from 'src/components/StepperNav.vue'
import RegistrationWizard from 'src/components/RegistrationWizard.vue'
import { SUPPORTED_LOCALES } from 'src/i18n/index.js'
import { setLocale } from 'src/boot/i18n.js'

const { t, locale } = useI18n()

const state = provideRegistration()

const selectedSessionIdsRef = computed(() => state.selectedSessionIds)
const selectedAddonsRef = computed(() => state.selectedAddons)
const { conflictingSessionIds, conflictingWorkshopIds } = useConflicts(selectedSessionIdsRef, selectedAddonsRef)
const { stepHasErrors } = useValidation(state, conflictingSessionIds, conflictingWorkshopIds)

const currentStep = computed(() => state.currentStep)
const showErrors = computed(() => state.validationTriggered)

function goTo(step) {
  state.currentStep = step
}

function onLocaleChange(value) {
  setLocale(value)
}
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-surface-l0" style="border-bottom: 1px solid var(--divider-default);">
      <q-toolbar class="max-w-6xl mx-auto px-4 md:px-8 lg:px-[120px] py-3 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden" style="background-color: var(--bg-brand-emphasis-rest)">
            <span class="text-white font-bold text-lg leading-none">N</span>
          </div>
          <p class="m-0 text-h6 font-bold text-neutral leading-none truncate">{{ t('app.title') }}</p>
        </div>
        <q-select
          :model-value="locale"
          :options="SUPPORTED_LOCALES"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          dense
          outlined
          bg-color="white"
          :aria-label="t('lang.label')"
          class="flex-shrink-0 w-32"
          @update:model-value="onLocaleChange"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="bg-surface-l0">
        <!-- Full-width stepper bar -->
        <div v-if="!state.submitted" style="border-bottom: 1px solid var(--divider-default);">
          <div class="max-w-6xl mx-auto px-4 md:px-8 lg:px-[120px] py-4">
            <StepperNav
              :current-step="currentStep"
              :show-errors="showErrors"
              :step-has-errors="stepHasErrors"
              @goto="goTo"
            />
          </div>
        </div>

        <!-- Main content -->
        <div class="max-w-6xl mx-auto px-4 md:px-8 lg:px-[120px] py-8">
          <RegistrationWizard />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

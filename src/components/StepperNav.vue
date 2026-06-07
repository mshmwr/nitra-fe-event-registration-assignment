<script setup>
import { useI18n } from 'vue-i18n'

const props = defineProps({
  currentStep: { type: Number, required: true },
  showErrors: { type: Boolean, required: true },
  stepHasErrors: { type: Object, required: true },
})

const emit = defineEmits(['goto'])

const { t } = useI18n()

const STEPS = [
  { number: 1, labelKey: 'nav.steps.attendee' },
  { number: 2, labelKey: 'nav.steps.sessions' },
  { number: 3, labelKey: 'nav.steps.addons' },
  { number: 4, labelKey: 'nav.steps.review' },
]

function stepStatus(n) {
  if (n === props.currentStep) return 'active'
  if (n < props.currentStep) {
    return (props.showErrors && props.stepHasErrors[n]) ? 'error' : 'done'
  }
  return (props.showErrors && props.stepHasErrors[n]) ? 'error' : 'pending'
}

function handleClick(step) {
  if (step.number < props.currentStep || stepStatus(step.number) === 'done' || stepStatus(step.number) === 'error') {
    emit('goto', step.number)
  }
}
</script>

<template>
  <nav class="flex items-center gap-0" :aria-label="t('nav.ariaSteps')">
    <template v-for="(step, idx) in STEPS" :key="step.number">
      <button
        type="button"
        class="flex items-center gap-2 py-2 px-2 tablet:px-3 rounded-lg transition-colors group min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 border-0 bg-transparent cursor-default"
        :class="{
          'cursor-pointer': step.number < currentStep || stepStatus(step.number) === 'done' || stepStatus(step.number) === 'error',
          'cursor-default': step.number > currentStep && stepStatus(step.number) !== 'done' && stepStatus(step.number) !== 'error',
        }"
        :aria-current="step.number === currentStep ? 'step' : undefined"
        @click="handleClick(step)"
      >
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 transition-colors"
          :class="{
            'bg-brand-emphasis-rest text-white': stepStatus(step.number) === 'active' || stepStatus(step.number) === 'done',
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
            'text-neutral': stepStatus(step.number) === 'active' || stepStatus(step.number) === 'done',
            'text-danger': stepStatus(step.number) === 'error',
            'text-neutral-quiet': stepStatus(step.number) === 'pending',
          }"
        >
          {{ t(step.labelKey) }}
        </span>
      </button>

      <div
        v-if="idx < STEPS.length - 1"
        class="flex-1 h-px mx-1 transition-colors"
        :class="step.number < currentStep ? 'bg-brand-emphasis-rest' : 'bg-[var(--divider-default)]'"
      />
    </template>
  </nav>
</template>

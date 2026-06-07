<script setup>
import { useI18n } from 'vue-i18n'

const props = defineProps({
  title: { type: String, required: true },
  step: { type: Number, default: 0 },
  hasError: { type: Boolean, required: true },
  showErrors: { type: Boolean, required: true },
})

const emit = defineEmits(['edit'])
const { t } = useI18n()
</script>

<template>
  <section
    class="rounded-md border-solid bg-surface-l1 p-5 space-y-3"
    :class="hasError && showErrors ? 'border-2' : 'border'"
    :style="hasError && showErrors ? { borderColor: 'var(--border-danger-emphasis)' } : { borderColor: 'var(--border-neutral-muted)' }"
  >
    <div class="flex items-center justify-between">
      <div
        class="text-base font-semibold mt-0 mb-3"
        :class="hasError && showErrors ? 'text-danger' : 'text-neutral'"
      >
        {{ title }}
      </div>
      <button
        v-if="step > 0"
        type="button"
        class="flex items-center gap-0.5 text-xs font-semibold text-brand hover:text-brand-emphasis border-0 bg-transparent p-0 cursor-pointer"
        @click="emit('edit')"
      >
        {{ t('review.editStep', { step }) }}
      </button>
    </div>
    <slot />
  </section>
</template>

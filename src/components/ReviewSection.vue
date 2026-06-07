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
  <section class="rounded-md border border-neutral-muted bg-surface-l1 p-5 space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-base font-semibold text-neutral flex items-center gap-2">
        <span v-if="hasError && showErrors" class="material-icons text-danger text-base">error</span>
        {{ title }}
      </h3>
      <button
        v-if="step > 0"
        type="button"
        class="flex items-center gap-0.5 text-xs font-semibold text-brand hover:text-brand-emphasis border-0 bg-transparent p-0 cursor-pointer"
        @click="emit('edit')"
      >
        {{ t('review.editStep', { step }) }}
        <span class="material-icons" style="font-size: 14px;">arrow_forward</span>
      </button>
    </div>
    <slot />
  </section>
</template>

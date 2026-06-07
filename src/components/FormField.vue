<script setup>
defineProps({
  label: { type: String, required: true },
  modelValue: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  error: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label class="text-xs font-medium text-neutral-muted">{{ label }}</label>
    <input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      class="w-full px-3 py-2.5 text-sm text-neutral bg-white rounded-[6px] border outline-none transition-colors"
      :class="error
        ? 'border-danger-emphasis'
        : 'border-neutral-muted focus:border-[var(--border-brand-emphasis)]'"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <p v-if="error && errorMessage" class="text-xs text-danger">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
input::placeholder {
  color: var(--text-neutral-quiet);
}
</style>

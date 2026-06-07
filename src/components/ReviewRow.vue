<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: String, default: '' },
  errorText: { type: String, default: '' },
})
</script>

<template>
  <div class="flex justify-between gap-4 text-sm">
    <span class="text-neutral-quiet flex-shrink-0">{{ label }}</span>
    <span v-if="!value && errorText" class="text-danger text-right">— ({{ errorText }})</span>
    <span v-else class="text-neutral text-right">{{ value || '—' }}</span>
  </div>
</template>

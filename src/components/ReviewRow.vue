<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: String, default: '—' },
})
</script>

<template>
  <div class="flex justify-between gap-4 text-sm">
    <span class="text-neutral flex-shrink-0">{{ label }}</span>
    <span class="text-neutral text-right">{{ value || '—' }}</span>
  </div>
</template>

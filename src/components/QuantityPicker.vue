<script setup>
defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 99 },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      type="button"
      class="w-6 h-6 rounded border border-neutral-muted flex items-center justify-center text-neutral hover:bg-neutral-muted-rest disabled:opacity-40 transition-colors"
      :disabled="modelValue <= min"
      @click="$emit('update:modelValue', modelValue - 1)"
    >
      <span class="material-icons text-sm">remove</span>
    </button>
    <span class="w-5 text-center text-sm font-medium text-neutral">{{ modelValue }}</span>
    <button
      type="button"
      class="w-6 h-6 rounded border border-neutral-muted flex items-center justify-center text-neutral hover:bg-neutral-muted-rest disabled:opacity-40 transition-colors"
      :disabled="modelValue >= max"
      @click="$emit('update:modelValue', modelValue + 1)"
    >
      <span class="material-icons text-sm">add</span>
    </button>
  </div>
</template>

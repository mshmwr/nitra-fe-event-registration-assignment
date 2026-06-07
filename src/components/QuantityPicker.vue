<script setup>
const model = defineModel({ type: Number, required: true })

defineProps({
  min: { type: Number, default: 0 },
  max: { type: Number, default: 99 },
})
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      type="button"
      class="w-6 h-6 rounded border border-neutral-muted flex items-center justify-center text-neutral hover:bg-neutral-muted-rest disabled:opacity-40 transition-colors"
      :disabled="model <= min"
      @click="model--"
    >
      <span class="material-icons text-sm">remove</span>
    </button>
    <span class="w-5 text-center text-sm font-medium text-neutral">{{ model }}</span>
    <button
      type="button"
      class="w-6 h-6 rounded border border-neutral-muted flex items-center justify-center text-neutral hover:bg-neutral-muted-rest disabled:opacity-40 transition-colors"
      :disabled="model >= max"
      @click="model++"
    >
      <span class="material-icons text-sm">add</span>
    </button>
  </div>
</template>

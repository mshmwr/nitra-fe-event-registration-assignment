<script setup>
const model = defineModel({ type: String, required: true })

defineProps({
  tabs: { type: Array, required: true }, // [{ value: string, label: string }]
})
</script>

<template>
  <div class="flex gap-1 p-1 rounded-[10px] bg-surface-l2 flex-shrink-0 w-fit">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      class="px-5 py-2 rounded-[8px] text-[13px] transition-colors whitespace-nowrap border-0 outline-none cursor-pointer"
      :class="model === tab.value
        ? 'bg-brand-emphasis-rest text-white font-semibold'
        : 'bg-transparent text-neutral-muted font-medium'"
      @click="model = tab.value"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

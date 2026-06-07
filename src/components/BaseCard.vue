<script setup>
defineProps({
  selected: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  thick: { type: Boolean, default: false },
})
</script>

<template>
  <div
    class="transition-all duration-150 select-none"
    :class="[
      (thick || selected) ? 'border-2 border-solid' : 'border',
      disabled
        ? 'opacity-50 border-neutral-quiet bg-surface-l1'
        : error
          ? 'border-danger-emphasis bg-danger-muted-rest'
          : selected
            ? 'bg-brand-subtle-rest'
            : '',
    ]"
    :style="selected && !disabled && !error ? { borderColor: 'var(--border-brand-emphasis)' } : {}"
  >
    <slot />
  </div>
</template>

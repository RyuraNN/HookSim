<script setup lang="ts">
const props = withDefaults(defineProps<{ size?: number }>(), { size: 24 })
</script>

<template>
  <svg
    :width="props.size"
    :height="props.size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M12 17v5" />
    <path d="M5 17h14" />
    <path d="M7.5 17l1-7H9a1 1 0 0 0 1-1V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5a1 1 0 0 0 1 1h.5l1 7" />
  </svg>
</template>

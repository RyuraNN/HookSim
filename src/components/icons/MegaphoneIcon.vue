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
    <path d="M18 3v18l-7-4.5H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h6L18 3z" />
    <path d="M11 16.5V20a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2.5" />
    <line x1="21" y1="10" x2="23" y2="10" />
    <line x1="21" y1="6" x2="22.5" y2="4.5" />
    <line x1="21" y1="14" x2="22.5" y2="15.5" />
  </svg>
</template>

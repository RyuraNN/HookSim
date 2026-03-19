<script setup lang="ts">
defineProps<{
  serverName: string
}>()
</script>

<template>
  <header
    class="h-12 min-h-[48px] flex items-center px-4 shadow-[0_1px_0_0_rgba(0,0,0,0.2),0_1.5px_0_0_rgba(0,0,0,0.05),0_2px_0_0_rgba(0,0,0,0.025)] cursor-pointer hover:bg-dc-bg-modifier-hover transition-colors"
  >
    <h2 class="text-dc-text-normal font-semibold text-[15px] truncate flex-1">
      {{ serverName }}
    </h2>
    <svg width="18" height="18" viewBox="0 0 24 24" class="text-dc-text-normal shrink-0">
      <path fill="currentColor" d="M7 10l5 5 5-5H7z" />
    </svg>
  </header>
</template>

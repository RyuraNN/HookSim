<script setup lang="ts">
defineProps<{
  date: string
}>()
</script>

<template>
  <div class="flex items-center mx-4 my-2">
    <div class="flex-1 h-px bg-dc-divider" />
    <span class="px-2 text-[11px] font-semibold text-dc-text-muted select-none">
      {{ date }}
    </span>
    <div class="flex-1 h-px bg-dc-divider" />
  </div>
</template>

<script setup lang="ts">
export interface BadgeProps {
  count: number
}

defineProps<BadgeProps>()
</script>

<template>
  <span
    v-if="count > 0"
    class="inline-flex min-w-[16px] items-center justify-center rounded-full bg-dc-text-danger px-1 h-4 text-xs font-bold text-white"
  >
    {{ count }}
  </span>
</template>

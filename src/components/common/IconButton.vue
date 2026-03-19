<script setup lang="ts">
export interface IconButtonProps {
  label: string
}

defineProps<IconButtonProps>()
</script>

<template>
  <button
    :aria-label="label"
    class="flex h-8 w-8 items-center justify-center rounded-full text-dc-interactive-normal transition-colors hover:bg-dc-bg-modifier-hover hover:text-dc-interactive-hover"
  >
    <slot />
  </button>
</template>

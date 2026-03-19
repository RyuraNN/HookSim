<script setup lang="ts">
withDefaults(defineProps<{
  state: 'hidden' | 'dot' | 'active'
}>(), {
  state: 'hidden',
})
</script>

<template>
  <div class="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
    <div
      class="w-1 rounded-r-full bg-white transition-all duration-200"
      :class="{
        'h-0 opacity-0': state === 'hidden',
        'h-2': state === 'dot',
        'h-10': state === 'active',
      }"
    />
  </div>
</template>

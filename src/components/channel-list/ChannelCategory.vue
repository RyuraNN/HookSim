<script setup lang="ts">
import type { ChannelCategory as CategoryType } from '@/types'

defineProps<{
  category: CategoryType
}>()

defineEmits<{
  toggle: []
}>()
</script>

<template>
  <div class="pt-4">
    <button
      class="flex items-center w-full px-0.5 text-[11px] font-bold uppercase tracking-[0.02em] text-dc-channel-default hover:text-dc-channel-hover cursor-pointer select-none"
      @click="$emit('toggle')"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        class="mr-0.5 transition-transform duration-200 shrink-0"
        :class="{ '-rotate-90': category.collapsed }"
      >
        <path fill="currentColor" d="M7 10l5 5 5-5H7z" />
      </svg>
      <span class="truncate">{{ category.name }}</span>
    </button>
  </div>
</template>

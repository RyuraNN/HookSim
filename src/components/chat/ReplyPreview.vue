<script setup lang="ts">
import type { MessageReference } from '@/types'

defineProps<{
  reference: MessageReference
}>()
</script>

<template>
  <div class="flex items-center gap-1 ml-[72px] mb-0.5 text-[13px]">
    <div class="w-8 flex justify-end pr-1">
      <div class="w-[33px] h-[13px] border-l-2 border-t-2 border-dc-interactive-normal rounded-tl-[6px] ml-[16px] mt-[6px]" />
    </div>
    <span class="text-dc-text-muted font-medium hover:text-dc-text-normal cursor-pointer">
      @{{ reference.authorName }}
    </span>
    <span class="text-dc-text-muted truncate max-w-[300px] hover:text-dc-text-normal cursor-pointer">
      {{ reference.content }}
    </span>
  </div>
</template>

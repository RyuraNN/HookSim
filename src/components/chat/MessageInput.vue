<script setup lang="ts">
import { ref } from 'vue'
import type { Message } from '@/types'

const props = defineProps<{
  channelName: string
  replyingTo?: Message | null
}>()

const emit = defineEmits<{
  send: [content: string]
  cancelReply: []
}>()

const inputText = ref('')

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    submit()
  }
  if (e.key === 'Escape' && props.replyingTo) {
    emit('cancelReply')
  }
}

function submit() {
  const text = inputText.value.trim()
  if (!text) return
  emit('send', text)
  inputText.value = ''
}
</script>

<template>
  <div class="px-4 pb-6 pt-0.5">
    <!-- Reply preview -->
    <div
      v-if="replyingTo"
      class="flex items-center gap-2 px-4 py-2 mb-1 bg-dc-bg-secondary rounded-t-lg border-l-2 border-dc-brand"
    >
      <span class="text-xs text-dc-text-muted">回复</span>
      <span class="text-xs text-dc-text-normal font-medium">{{ replyingTo.author.displayName }}</span>
      <span class="text-xs text-dc-text-muted truncate flex-1">{{ replyingTo.content.slice(0, 50) }}{{ replyingTo.content.length > 50 ? '...' : '' }}</span>
      <button
        class="text-dc-text-muted hover:text-dc-text-normal"
        @click="$emit('cancelReply')"
      >
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path fill="currentColor" d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z" />
        </svg>
      </button>
    </div>
    <div class="flex items-end bg-dc-input-bg rounded-lg">
      <!-- Attach button -->
      <button class="w-11 h-11 flex items-center justify-center text-dc-interactive-normal hover:text-dc-interactive-hover cursor-pointer shrink-0">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2.5a1 1 0 0 1 1 1V11h7.5a1 1 0 1 1 0 2H13v7.5a1 1 0 1 1-2 0V13H3.5a1 1 0 1 1 0-2H11V3.5a1 1 0 0 1 1-1Z" />
        </svg>
      </button>

      <!-- Text input -->
      <div class="flex-1 min-h-[44px] flex items-center">
        <textarea
          v-model="inputText"
          :placeholder="`Message #${channelName}`"
          class="w-full bg-transparent text-dc-text-normal placeholder:text-dc-text-faint text-[15px] resize-none outline-none py-[11px] max-h-[50vh] leading-[1.375rem]"
          rows="1"
          @keydown="handleKeydown"
        />
      </div>

      <!-- Right side buttons -->
      <div class="flex items-center gap-0.5 px-1">
        <button class="w-9 h-11 flex items-center justify-center text-dc-interactive-normal hover:text-dc-interactive-hover cursor-pointer">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M2 2C0.895431 2 0 2.89543 0 4V20C0 21.1046 0.895431 22 2 22H22C23.1046 22 24 21.1046 24 20V4C24 2.89543 23.1046 2 22 2H2ZM9.76445 11.448V15.48C8.90512 16.044 7.84891 16.356 6.74891 16.356C4.12891 16.356 2.49691 14.664 2.49691 12.084C2.49691 9.504 4.12891 7.764 6.74891 7.764C7.85291 7.764 8.90512 8.112 9.76445 8.736V12.768H7.14445V11.1C6.98891 11.052 6.84091 11.028 6.66445 11.028C5.69291 11.028 5.06845 11.46 5.06845 12.084C5.06845 12.684 5.69291 13.14 6.66445 13.14C7.26845 13.14 7.82045 13.08 9.76445 11.448ZM11.0484 7.92H13.6404V16.2H11.0484V7.92ZM15.2884 7.92H21.5765V10.236H17.8564V11.04H21.5765V16.2H15.2884V13.68H18.8644V13.068H15.2884V7.92Z" />
          </svg>
        </button>
        <button class="w-9 h-11 flex items-center justify-center text-dc-interactive-normal hover:text-dc-interactive-hover cursor-pointer">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C6.486 2 2 6.487 2 12C2 17.515 6.486 22 12 22C17.514 22 22 17.515 22 12C22 6.487 17.514 2 12 2ZM12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12C20 16.411 16.411 20 12 20Z" />
            <path fill="currentColor" d="M9 10C9.552 10 10 9.552 10 9C10 8.448 9.552 8 9 8C8.448 8 8 8.448 8 9C8 9.552 8.448 10 9 10Z" />
            <path fill="currentColor" d="M15 10C15.552 10 16 9.552 16 9C16 8.448 15.552 8 15 8C14.448 8 14 8.448 14 9C14 9.552 14.448 10 15 10Z" />
            <path fill="currentColor" d="M16.5 14.5C15.813 15.973 14.028 17 12 17C9.972 17 8.187 15.973 7.5 14.5H16.5Z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

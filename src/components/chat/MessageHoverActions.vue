<script setup lang="ts">
const emit = defineEmits<{
  reply: []
}>()

function handleReply() {
  emit('reply')
}
</script>

<template>
  <div
    class="absolute -top-4 right-4 flex items-center bg-dc-bg-primary border border-dc-divider rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
  >
    <!-- Emoji -->
    <button
      class="w-8 h-8 flex items-center justify-center text-dc-interactive-normal hover:text-dc-interactive-hover hover:bg-dc-bg-modifier-hover cursor-pointer rounded-l-md"
    >
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 2C6.486 2 2 6.487 2 12C2 17.515 6.486 22 12 22C17.514 22 22 17.515 22 12C22 6.487 17.514 2 12 2ZM12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12C20 16.411 16.411 20 12 20Z" />
        <path fill="currentColor" d="M9 10C9.552 10 10 9.552 10 9C10 8.448 9.552 8 9 8C8.448 8 8 8.448 8 9C8 9.552 8.448 10 9 10Z" />
        <path fill="currentColor" d="M15 10C15.552 10 16 9.552 16 9C16 8.448 15.552 8 15 8C14.448 8 14 8.448 14 9C14 9.552 14.448 10 15 10Z" />
        <path fill="currentColor" d="M16.5 14.5C15.813 15.973 14.028 17 12 17C9.972 17 8.187 15.973 7.5 14.5H16.5Z" />
      </svg>
    </button>
    <!-- Reply -->
    <button
      class="w-8 h-8 flex items-center justify-center text-dc-interactive-normal hover:text-dc-interactive-hover hover:bg-dc-bg-modifier-hover cursor-pointer"
      title="回复"
      @click="handleReply"
    >
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="currentColor" d="M10 8.26667V4L3 11.4667L10 18.9333V14.56C15 14.56 18.5 16.2667 21 20C20 14.6667 17 9.33333 10 8.26667Z" />
      </svg>
    </button>
    <!-- More -->
    <button
      class="w-8 h-8 flex items-center justify-center text-dc-interactive-normal hover:text-dc-interactive-hover hover:bg-dc-bg-modifier-hover cursor-pointer rounded-r-md"
    >
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="currentColor" d="M7 12.001C7 10.8964 6.10457 10.001 5 10.001C3.89543 10.001 3 10.8964 3 12.001C3 13.1055 3.89543 14.001 5 14.001C6.10457 14.001 7 13.1055 7 12.001ZM14 12.001C14 10.8964 13.1046 10.001 12 10.001C10.8954 10.001 10 10.8964 10 12.001C10 13.1055 10.8954 14.001 12 14.001C13.1046 14.001 14 13.1055 14 12.001ZM21 12.001C21 10.8964 20.1046 10.001 19 10.001C17.8954 10.001 17 10.8964 17 12.001C17 13.1055 17.8954 14.001 19 14.001C20.1046 14.001 21 13.1055 21 12.001Z" />
      </svg>
    </button>
  </div>
</template>

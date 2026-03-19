<script setup lang="ts">
import { currentUser } from '@/mock'
import Avatar from '@/components/common/Avatar.vue'
</script>

<template>
  <div class="h-[52px] min-h-[52px] bg-[#232428] flex items-center px-2 gap-0.5">
    <!-- User info -->
    <div class="flex items-center gap-2 flex-1 min-w-0 rounded-md px-1 py-0.5 hover:bg-dc-bg-modifier-hover cursor-pointer">
      <Avatar
        :src="currentUser.avatarUrl"
        :status="currentUser.status"
        size="sm"
      />
      <div class="flex flex-col min-w-0 leading-tight">
        <span class="text-[13px] font-medium text-dc-text-normal truncate">
          {{ currentUser.displayName }}
        </span>
        <span class="text-[11px] text-dc-text-muted truncate">
          {{ currentUser.status === 'online' ? 'Online' : currentUser.status }}
        </span>
      </div>
    </div>

    <!-- Action buttons -->
    <button class="w-8 h-8 flex items-center justify-center rounded-md text-dc-interactive-normal hover:text-dc-interactive-hover hover:bg-dc-bg-modifier-hover cursor-pointer">
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="currentColor" d="M6.7 11H5C5 12.19 5.34 13.3 5.9 14.28l1.23-1.23c-.27-.62-.43-1.3-.43-2.05zm4.8 5.76l-1.23 1.23c.98.56 2.09.9 3.28.9V16.5c-.75 0-1.43-.16-2.05-.43zM14 3.23v-1.7c-4.97.45-8.97 4.45-9.42 9.42h1.7c.46-3.95 3.77-7.26 7.72-7.72zM17.72 10c-.46-3.39-3.16-6.03-6.56-6.42V2c4.51.47 8.06 4.02 8.53 8.5h-1.97z" />
        <path fill="currentColor" d="M12 4V2C7.03 2.47 3.03 6.47 2.58 11.42h2C5.04 7.95 8.04 4.95 12 4z" opacity="0" />
        <path fill="currentColor" d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
      </svg>
    </button>
    <button class="w-8 h-8 flex items-center justify-center rounded-md text-dc-interactive-normal hover:text-dc-interactive-hover hover:bg-dc-bg-modifier-hover cursor-pointer">
      <svg width="20" height="20" viewBox="0 0 24 24">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2.00305C6.486 2.00305 2 6.48805 2 12.0031V20.0031C2 21.1071 2.895 22.0031 4 22.0031H6C7.104 22.0031 8 21.1071 8 20.0031V17.0031C8 15.8991 7.104 15.0031 6 15.0031H4V12.0031C4 7.59105 7.589 4.00305 12 4.00305C16.411 4.00305 20 7.59105 20 12.0031V15.0031H18C16.896 15.0031 16 15.8991 16 17.0031V20.0031C16 21.1071 16.896 22.0031 18 22.0031H20C21.104 22.0031 22 21.1071 22 20.0031V12.0031C22 6.48805 17.514 2.00305 12 2.00305Z" />
        </svg>
      </svg>
    </button>
    <button class="w-8 h-8 flex items-center justify-center rounded-md text-dc-interactive-normal hover:text-dc-interactive-hover hover:bg-dc-bg-modifier-hover cursor-pointer">
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="currentColor" d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
      </svg>
    </button>
  </div>
</template>

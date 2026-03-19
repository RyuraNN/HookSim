<script setup lang="ts">
import type { Channel } from '@/types'
import { useUIStore } from '@/stores'
import { useResponsive } from '@/composables/useResponsive'

defineProps<{
  channel: Channel
}>()

const uiStore = useUIStore()
const { isMobile, isTablet } = useResponsive()
</script>

<template>
  <header
    class="h-12 min-h-[48px] flex items-center px-4 gap-2 shadow-[0_1px_0_0_rgba(0,0,0,0.2),0_1.5px_0_0_rgba(0,0,0,0.05),0_2px_0_0_rgba(0,0,0,0.025)]"
  >
    <!-- Mobile back button -->
    <button
      v-if="isMobile"
      class="w-8 h-8 flex items-center justify-center text-dc-interactive-normal hover:text-dc-interactive-hover cursor-pointer mr-1"
      @click="uiStore.navigateTo('channels')"
    >
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
      </svg>
    </button>

    <!-- Tablet sidebar toggle -->
    <button
      v-if="isTablet"
      class="w-8 h-8 flex items-center justify-center text-dc-interactive-normal hover:text-dc-interactive-hover cursor-pointer mr-1"
      @click="uiStore.toggleChannelList()"
    >
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
      </svg>
    </button>

    <!-- Channel icon -->
    <svg width="24" height="24" viewBox="0 0 24 24" class="text-dc-channel-default shrink-0">
      <path
        fill="currentColor"
        fill-rule="evenodd"
        d="M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41045 9L8.35045 15H14.3504L15.4104 9H9.41045Z"
      />
    </svg>

    <!-- Channel name -->
    <h1 class="text-dc-text-normal font-semibold text-base">
      {{ channel.name }}
    </h1>

    <!-- Topic divider -->
    <div v-if="channel.topic" class="w-px h-6 bg-dc-divider mx-1" />

    <!-- Topic -->
    <span v-if="channel.topic" class="text-sm text-dc-text-muted truncate flex-1">
      {{ channel.topic }}
    </span>
    <span v-else class="flex-1" />

    <!-- Toolbar icons -->
    <div class="flex items-center gap-1">
      <button
        v-for="icon in ['threads', 'bell', 'pin', 'people', 'search']"
        :key="icon"
        class="w-8 h-8 flex items-center justify-center rounded-md text-dc-interactive-normal hover:text-dc-interactive-hover cursor-pointer"
      >
        <!-- Pin icon -->
        <svg v-if="icon === 'pin'" width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22 12L12.101 2.10101L10.686 3.51401L12.101 4.92901L7.15 9.87801V11.293L4.322 14.121L5.736 15.536L8.565 12.707H9.979L14.929 7.75701L16.343 9.17201L6.444 19.071L7.858 20.485L17.757 10.586L19.172 12H22Z" />
        </svg>
        <!-- People icon -->
        <svg v-else-if="icon === 'people'" width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M14 8.00598C14 10.211 12.206 12.006 10 12.006C7.795 12.006 6 10.211 6 8.00598C6 5.80098 7.794 4.00598 10 4.00598C12.206 4.00598 14 5.80098 14 8.00598ZM2 19.006C2 15.473 5.29 13.006 10 13.006C14.711 13.006 18 15.473 18 19.006V20.006H2V19.006ZM20 20.006H22V19.006C22 16.165 19.834 14.06 16.757 13.254C18.26 14.38 19 15.849 19 17.506V20.006H20Z" />
          <path fill="currentColor" d="M14 8.00598C14 10.211 12.206 12.006 10 12.006C7.795 12.006 6 10.211 6 8.00598C6 5.80098 7.794 4.00598 10 4.00598C12.206 4.00598 14 5.80098 14 8.00598Z" opacity="0" />
          <path fill="currentColor" d="M18 8.006C18 9.10698 17.103 10.006 16 10.006C14.896 10.006 14 9.10698 14 8.006C14 6.90498 14.897 6.00598 16 6.00598C17.103 6.00598 18 6.90498 18 8.006Z" />
        </svg>
        <!-- Search icon -->
        <svg v-else-if="icon === 'search'" width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M21.707 20.293L16.314 14.9C17.403 13.504 18 11.799 18 10C18 5.589 14.411 2 10 2C5.589 2 2 5.589 2 10C2 14.411 5.589 18 10 18C11.799 18 13.504 17.404 14.9 16.314L20.293 21.706L21.707 20.293ZM10 16C6.691 16 4 13.309 4 10C4 6.691 6.691 4 10 4C13.309 4 16 6.691 16 10C16 13.309 13.309 16 10 16Z" />
        </svg>
        <!-- Generic fallback -->
        <svg v-else width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2C6.486 2 2 6.487 2 12C2 17.515 6.486 22 12 22C17.514 22 22 17.515 22 12C22 6.487 17.514 2 12 2ZM12 18.25C11.31 18.25 10.75 17.69 10.75 17C10.75 16.31 11.31 15.75 12 15.75C12.69 15.75 13.25 16.31 13.25 17C13.25 17.69 12.69 18.25 12 18.25ZM13 13.875V15H11V12H12C13.104 12 14 11.104 14 10C14 8.896 13.104 8 12 8C10.896 8 10 8.896 10 10H8C8 7.795 9.795 6 12 6C14.205 6 16 7.795 16 10C16 11.861 14.723 13.429 13 13.875Z" />
        </svg>
      </button>
    </div>
  </header>
</template>

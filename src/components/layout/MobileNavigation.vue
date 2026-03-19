<script setup lang="ts">
import { useUIStore } from '@/stores'
import { useResponsive } from '@/composables/useResponsive'
import { useSwipe } from '@vueuse/core'
import { ref } from 'vue'

const uiStore = useUIStore()
const { isMobile } = useResponsive()

const swipeTarget = ref<HTMLElement>()

useSwipe(swipeTarget, {
  onSwipeEnd(_e, direction) {
    if (!isMobile.value) return
    if (direction === 'right') {
      if (uiStore.mobileActivePanel === 'chat') {
        uiStore.navigateTo('channels')
      } else if (uiStore.mobileActivePanel === 'channels') {
        uiStore.navigateTo('servers')
      }
    } else if (direction === 'left') {
      if (uiStore.mobileActivePanel === 'servers') {
        uiStore.navigateTo('channels')
      } else if (uiStore.mobileActivePanel === 'channels') {
        uiStore.navigateTo('chat')
      }
    }
  },
})
</script>

<template>
  <div ref="swipeTarget" class="h-full w-full">
    <slot />
  </div>
</template>

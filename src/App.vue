<script setup lang="ts">
import { watch } from 'vue'
import { useUIStore } from '@/stores'
import { useResponsive } from '@/composables/useResponsive'
import ServerSidebar from '@/components/server-sidebar/ServerSidebar.vue'
import ChannelListSidebar from '@/components/channel-list/ChannelListSidebar.vue'
import ChatArea from '@/components/chat/ChatArea.vue'
import MobileNavigation from '@/components/layout/MobileNavigation.vue'
import RulesVerification from '@/components/welcome/RulesVerification.vue'

const uiStore = useUIStore()
const { isMobile, isTablet } = useResponsive()

watch(isMobile, (mobile) => {
  if (!mobile) {
    uiStore.showChannelList()
  }
})
</script>

<template>
  <!-- Rules Verification Screen -->
  <Transition name="fade">
    <RulesVerification v-if="!uiStore.gameStarted" />
  </Transition>

  <!-- Main App -->
  <Transition name="fade">
    <MobileNavigation v-if="uiStore.gameStarted">
      <div class="flex h-full overflow-hidden">
        <!-- Server sidebar: always visible on desktop/tablet, panel-switched on mobile -->
        <Transition name="slide-left">
          <ServerSidebar
            v-show="!isMobile || uiStore.mobileActivePanel === 'servers'"
          />
        </Transition>

        <!-- Channel list: visible on desktop, togglable on tablet, panel-switched on mobile -->
        <Transition name="slide-left">
          <div
            v-show="
              isMobile
                ? uiStore.mobileActivePanel === 'channels'
                : isTablet
                  ? uiStore.isChannelListVisible
                  : true
            "
            class="flex"
            :class="[
              isTablet && uiStore.isChannelListVisible ? 'absolute z-20 left-[72px] top-0 bottom-0 shadow-2xl' : '',
            ]"
          >
            <ChannelListSidebar />
          </div>
        </Transition>

        <!-- Tablet overlay when channel list is open -->
        <Transition name="fade">
          <div
            v-if="isTablet && uiStore.isChannelListVisible"
            class="fixed inset-0 bg-black/50 z-10"
            @click="uiStore.hideChannelList()"
          />
        </Transition>

        <!-- Chat area: always visible on desktop/tablet, panel-switched on mobile -->
        <Transition name="slide-right">
          <ChatArea
            v-show="!isMobile || uiStore.mobileActivePanel === 'chat'"
          />
        </Transition>
      </div>
    </MobileNavigation>
  </Transition>
</template>

<style>
/* Slide transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.25s ease;
}

.slide-left-enter-from {
  transform: translateX(-100%);
}
.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-right-enter-from {
  transform: translateX(100%);
}
.slide-right-leave-to {
  transform: translateX(100%);
}

/* Fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Bounce animation for typing indicator */
@keyframes bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-4px);
  }
}
</style>

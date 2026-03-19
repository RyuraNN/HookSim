<script setup lang="ts">
import { useServerStore, useChannelStore, useUIStore } from '@/stores'
import { useResponsive } from '@/composables/useResponsive'
import ServerHeader from './ServerHeader.vue'
import ChannelCategory from './ChannelCategory.vue'
import ChannelItem from './ChannelItem.vue'
import UserPanel from './UserPanel.vue'

const serverStore = useServerStore()
const channelStore = useChannelStore()
const uiStore = useUIStore()
const { isMobile } = useResponsive()

function handleChannelClick(channelId: string) {
  channelStore.setActiveChannel(channelId)
  uiStore.navigateTo('chat')
}
</script>

<template>
  <aside
    v-if="serverStore.activeServer"
    class="flex flex-col bg-dc-bg-secondary"
    :class="isMobile ? 'w-full' : 'w-60 min-w-60'"
  >
    <ServerHeader :server-name="serverStore.activeServer.name" />

    <!-- Channel list -->
    <div class="flex-1 overflow-y-auto thin-scrollbar pt-4 px-2">
      <template
        v-for="category in channelStore.categoriesForServer(serverStore.activeServerId!)"
        :key="category.id"
      >
        <ChannelCategory
          :category="category"
          @toggle="channelStore.toggleCategory(category.id)"
        />
        <div
          v-show="!category.collapsed"
          class="mt-[1px]"
        >
          <ChannelItem
            v-for="channel in channelStore.channelsForCategory(category.id)"
            :key="channel.id"
            :channel="channel"
            :is-active="channelStore.activeChannelId === channel.id"
            @click="handleChannelClick(channel.id)"
          />
        </div>
      </template>
    </div>

    <UserPanel />
  </aside>
</template>

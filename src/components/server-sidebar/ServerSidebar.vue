<script setup lang="ts">
import { useServerStore, useChannelStore, useUIStore } from '@/stores'
import HomeButton from './HomeButton.vue'
import ServerIcon from './ServerIcon.vue'
import AddServerButton from './AddServerButton.vue'
import Divider from '@/components/common/Divider.vue'

const serverStore = useServerStore()
const channelStore = useChannelStore()
const uiStore = useUIStore()

function handleServerClick(serverId: string) {
  serverStore.setActiveServer(serverId)
  const channels = channelStore.channelsForServer(serverId)
  const firstText = channels.find(c => c.type === 'text')
  if (firstText) {
    channelStore.setActiveChannel(firstText.id)
  }
  uiStore.navigateTo('channels')
}
</script>

<template>
  <nav
    class="flex flex-col items-center w-[72px] min-w-[72px] bg-dc-bg-tertiary pt-3 pb-3 overflow-y-auto thin-scrollbar"
    aria-label="Servers"
  >
    <HomeButton
      :is-active="false"
      @click="() => {}"
    />
    <Divider />
    <ServerIcon
      v-for="server in serverStore.servers"
      :key="server.id"
      :server="server"
      :is-active="serverStore.activeServerId === server.id"
      :has-unread="server.hasUnread"
      @click="handleServerClick(server.id)"
    />
    <Divider />
    <AddServerButton />
  </nav>
</template>

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Channel, ChannelCategory } from '@/types'
import { mockChannels, mockCategories } from '@/mock'

export const useChannelStore = defineStore('channel', () => {
  const channels = ref<readonly Channel[]>(mockChannels)
  const categories = ref<ChannelCategory[]>([...mockCategories])
  const activeChannelId = ref<string | null>('ch-1-1')

  const activeChannel = computed(() =>
    channels.value.find(c => c.id === activeChannelId.value) ?? null,
  )

  function channelsForServer(serverId: string): readonly Channel[] {
    return channels.value.filter(c => c.serverId === serverId)
  }

  function categoriesForServer(serverId: string): readonly ChannelCategory[] {
    return categories.value.filter(c => c.serverId === serverId)
  }

  function channelsForCategory(categoryId: string): readonly Channel[] {
    return channels.value.filter(c => c.categoryId === categoryId)
  }

  function setActiveChannel(id: string) {
    activeChannelId.value = id
  }

  function toggleCategory(categoryId: string) {
    categories.value = categories.value.map(cat =>
      cat.id === categoryId ? { ...cat, collapsed: !cat.collapsed } : cat,
    )
  }

  return {
    channels,
    categories,
    activeChannelId,
    activeChannel,
    channelsForServer,
    categoriesForServer,
    channelsForCategory,
    setActiveChannel,
    toggleCategory,
  }
})

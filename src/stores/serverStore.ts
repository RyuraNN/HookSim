import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Server } from '@/types'
import { mockServers } from '@/mock'

export const useServerStore = defineStore('server', () => {
  const servers = ref<readonly Server[]>(mockServers)
  const activeServerId = ref<string | null>('s-1')

  const activeServer = computed(() =>
    servers.value.find(s => s.id === activeServerId.value) ?? null,
  )

  function setActiveServer(id: string) {
    activeServerId.value = id
  }

  return { servers, activeServerId, activeServer, setActiveServer }
})

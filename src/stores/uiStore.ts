import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ViewPanel } from '@/types'

export const useUIStore = defineStore('ui', () => {
  const mobileActivePanel = ref<ViewPanel>('servers')
  const isChannelListVisible = ref(true)
  const gameStarted = ref(false)

  function navigateTo(panel: ViewPanel) {
    mobileActivePanel.value = panel
  }

  function toggleChannelList() {
    isChannelListVisible.value = !isChannelListVisible.value
  }

  function showChannelList() {
    isChannelListVisible.value = true
  }

  function hideChannelList() {
    isChannelListVisible.value = false
  }

  function startGame() {
    gameStarted.value = true
  }

  return {
    mobileActivePanel,
    isChannelListVisible,
    gameStarted,
    navigateTo,
    toggleChannelList,
    showChannelList,
    hideChannelList,
    startGame,
  }
})

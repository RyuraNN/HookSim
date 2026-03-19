<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  round: number
  resolved: number
  total: number
  score: number
  isGenerating: boolean
}>()

const isExpanded = ref(false)
</script>

<template>
  <!-- Collapsed: small floating button -->
  <button
    v-if="!isExpanded"
    class="absolute top-16 right-4 z-20 w-8 h-8 rounded-full bg-dc-bg-tertiary/80 hover:bg-dc-bg-tertiary border border-dc-border shadow-md flex items-center justify-center text-dc-text-muted hover:text-dc-text-normal transition-all"
    title="显示游戏状态"
    @click="isExpanded = true"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span v-if="resolved > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-[10px] text-white flex items-center justify-center">
      {{ resolved }}
    </span>
  </button>

  <!-- Expanded: full status bar -->
  <Transition name="slide-down">
    <div
      v-if="isExpanded"
      class="flex items-center justify-between px-4 py-2 bg-dc-bg-secondary border-b border-dc-border text-sm"
    >
      <div class="flex items-center gap-4">
        <span class="text-dc-text-muted">
          🎮 第 <span class="text-dc-text-normal font-medium">{{ round }}</span> 轮
        </span>
        <span class="text-dc-text-muted">
          ✅ 已解决: <span class="text-green-400 font-medium">{{ resolved }}</span> / {{ total }}
        </span>
        <span class="text-dc-text-muted">
          ⭐ 总分: <span class="text-yellow-400 font-medium">{{ score }}</span>
        </span>
      </div>
      <div class="flex items-center gap-2">
        <div v-if="isGenerating" class="flex items-center gap-2 text-dc-brand">
          <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <button
          class="w-6 h-6 flex items-center justify-center text-dc-text-muted hover:text-dc-text-normal rounded hover:bg-dc-bg-modifier-hover"
          title="隐藏"
          @click="isExpanded = false"
        >
          <svg width="14" height="14" viewBox="0 0 24 24">
            <path fill="currentColor" d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"/>
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import type { Server } from '@/types'
import ServerPill from './ServerPill.vue'
import Badge from '@/components/common/Badge.vue'

const props = defineProps<{
  server: Server
  isActive: boolean
  hasUnread: boolean
}>()

defineEmits<{
  click: []
}>()

const pillState = computed(() => {
  if (props.isActive) return 'active' as const
  if (props.hasUnread) return 'dot' as const
  return 'hidden' as const
})

const initials = computed(() => {
  return props.server.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()
})

const bgColor = computed(() => {
  const hash = props.server.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const colors = [
    'bg-[#5865f2]', 'bg-[#57f287]', 'bg-[#fee75c]',
    'bg-[#eb459e]', 'bg-[#ed4245]',
  ]
  return colors[hash % colors.length]
})
</script>

<template>
  <div class="relative flex justify-center mb-0.5 group">
    <ServerPill :state="pillState" />
    <div class="relative">
      <div
        class="w-12 h-12 flex items-center justify-center cursor-pointer transition-all duration-200 text-white font-semibold text-sm select-none"
        :class="[
          isActive
            ? `rounded-2xl ${bgColor}`
            : `rounded-[24px] bg-dc-bg-tertiary hover:rounded-2xl group-hover:${bgColor}`,
          { 'group-hover:text-white': !isActive },
        ]"
        @click="$emit('click')"
      >
        <img
          v-if="server.iconUrl"
          :src="server.iconUrl"
          :alt="server.name"
          class="w-full h-full object-cover rounded-[inherit]"
        />
        <span v-else>{{ initials }}</span>
      </div>
      <Badge
        v-if="server.mentionCount > 0"
        :count="server.mentionCount"
        class="absolute -bottom-0.5 -right-0.5"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
export interface AvatarProps {
  src: string
  size?: 'sm' | 'md' | 'lg'
  status?: 'online' | 'idle' | 'dnd' | 'offline'
  rounded?: boolean
}

const props = withDefaults(defineProps<AvatarProps>(), {
  size: 'md',
  rounded: true,
})

const sizeClasses: Record<string, string> = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
}

const statusDotSize: Record<string, string> = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
}

const statusColors: Record<string, string> = {
  online: 'bg-dc-status-online',
  idle: 'bg-dc-status-idle',
  dnd: 'bg-dc-status-dnd',
  offline: 'bg-dc-status-offline',
}
</script>

<template>
  <div class="relative inline-flex shrink-0">
    <img
      :src="props.src"
      :class="[
        sizeClasses[props.size],
        props.rounded ? 'rounded-full' : 'rounded-lg',
        'object-cover',
      ]"
      alt=""
      draggable="false"
    />
    <span
      v-if="props.status"
      :class="[
        'absolute bottom-0 right-0 rounded-full ring-[3px] ring-dc-bg-secondary',
        statusDotSize[props.size],
        statusColors[props.status],
      ]"
    />
  </div>
</template>

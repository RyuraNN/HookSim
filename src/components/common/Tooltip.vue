<script setup lang="ts">
import { ref } from 'vue'

export interface TooltipProps {
  text: string
  position?: 'top' | 'right' | 'bottom' | 'left'
}

const props = withDefaults(defineProps<TooltipProps>(), {
  position: 'right',
})

const visible = ref(false)
let showTimeout: ReturnType<typeof setTimeout> | null = null

function onMouseEnter() {
  showTimeout = setTimeout(() => {
    visible.value = true
  }, 200)
}

function onMouseLeave() {
  if (showTimeout) {
    clearTimeout(showTimeout)
    showTimeout = null
  }
  visible.value = false
}

const positionClasses: Record<string, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
}
</script>

<template>
  <div
    class="relative inline-flex"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <slot />
    <Transition
      enter-active-class="transition-opacity duration-100"
      leave-active-class="transition-opacity duration-75"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        role="tooltip"
        :class="[
          'absolute z-50 whitespace-nowrap rounded-md bg-dc-bg-tertiary px-2.5 py-1.5 text-sm font-medium text-dc-text-normal shadow-lg pointer-events-none',
          positionClasses[props.position],
        ]"
      >
        {{ props.text }}
      </div>
    </Transition>
  </div>
</template>

import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'

export function useResponsive() {
  const { width } = useWindowSize()

  const isMobile = computed(() => width.value < 768)
  const isTablet = computed(() => width.value >= 768 && width.value < 1200)
  const isDesktop = computed(() => width.value >= 1200)

  return { width, isMobile, isTablet, isDesktop }
}

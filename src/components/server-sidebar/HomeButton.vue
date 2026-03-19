<script setup lang="ts">
defineProps<{
  isActive: boolean
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <div class="relative flex justify-center mb-0.5">
    <div
      class="w-12 h-12 flex items-center justify-center cursor-pointer transition-all duration-200 bg-dc-bg-tertiary"
      :class="[
        isActive
          ? 'rounded-2xl bg-dc-brand'
          : 'rounded-[24px] hover:rounded-2xl hover:bg-dc-brand',
      ]"
      @click="$emit('click')"
    >
      <svg width="28" height="20" viewBox="0 0 28 20" class="text-white">
        <path
          fill="currentColor"
          d="M23.021 1.677A21.227 21.227 0 0 0 17.658 0c-.252.462-.483.935-.687 1.418a19.931 19.931 0 0 0-5.943 0C10.82.935 10.59.462 10.337 0c-1.896.326-3.72.893-5.363 1.677C.533 7.093-.327 12.373.103 17.584A21.31 21.31 0 0 0 6.58 20a15.684 15.684 0 0 0 1.396-2.27 13.37 13.37 0 0 1-2.2-1.059c.186-.136.367-.276.541-.418a15.21 15.21 0 0 0 13.037 0c.177.15.358.29.54.418a13.449 13.449 0 0 1-2.2 1.06 15.72 15.72 0 0 0 1.396 2.27 21.28 21.28 0 0 0 6.48-2.418c.508-5.293-.862-9.882-3.549-13.906ZM9.347 14.404c-1.173 0-2.14-1.085-2.14-2.41 0-1.326.942-2.41 2.14-2.41 1.196 0 2.16 1.084 2.14 2.41 0 1.325-.952 2.41-2.14 2.41Zm7.911 0c-1.175 0-2.14-1.085-2.14-2.41 0-1.326.943-2.41 2.14-2.41 1.197 0 2.152 1.084 2.14 2.41 0 1.325-.943 2.41-2.14 2.41Z"
        />
      </svg>
    </div>
  </div>
</template>

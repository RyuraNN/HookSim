<script setup lang="ts">
defineProps<{
  users: readonly string[]
}>()
</script>

<template>
  <div v-if="users.length > 0" class="h-6 px-4 flex items-center gap-1 text-[11px] text-dc-text-muted">
    <div class="flex gap-[3px]">
      <span
        v-for="i in 3"
        :key="i"
        class="w-1.5 h-1.5 rounded-full bg-dc-text-muted animate-bounce"
        :style="{ animationDelay: `${(i - 1) * 0.2}s` }"
      />
    </div>
    <span class="font-semibold text-dc-text-normal">
      {{ users.join(', ') }}
    </span>
    <span>{{ users.length === 1 ? 'is typing...' : 'are typing...' }}</span>
  </div>
  <div v-else class="h-6" />
</template>

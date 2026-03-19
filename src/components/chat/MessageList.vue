<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { Message } from '@/types'
import { useMessageGrouping } from '@/composables/useMessageGrouping'
import DateSeparator from './DateSeparator.vue'
import MessageItem from './MessageItem.vue'

const props = defineProps<{
  messages: readonly Message[]
}>()

const emit = defineEmits<{
  reply: [message: Message]
}>()

const scrollContainer = ref<HTMLElement>()

const messageGroups = useMessageGrouping(() => props.messages)

watch(
  () => props.messages.length,
  async () => {
    await nextTick()
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  },
)

function handleReply(message: Message) {
  emit('reply', message)
}
</script>

<template>
  <div
    ref="scrollContainer"
    class="flex-1 overflow-y-auto"
  >
    <div class="min-h-full flex flex-col justify-end">
      <template v-for="dayGroup in messageGroups" :key="dayGroup.date">
        <DateSeparator :date="dayGroup.date" />
        <template v-for="authorGroup in dayGroup.groups" :key="authorGroup.messages[0].id">
          <MessageItem
            v-for="(message, idx) in authorGroup.messages"
            :key="message.id"
            :message="message"
            :is-group-start="idx === 0"
            @reply="handleReply"
          />
        </template>
      </template>
    </div>
  </div>
</template>

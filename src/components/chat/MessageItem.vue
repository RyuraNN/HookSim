<script setup lang="ts">
import { computed } from 'vue'
import type { Message } from '@/types'
import Avatar from '@/components/common/Avatar.vue'
import ReplyPreview from './ReplyPreview.vue'
import MessageHoverActions from './MessageHoverActions.vue'

const props = defineProps<{
  message: Message
  isGroupStart: boolean
}>()

const emit = defineEmits<{
  reply: [message: Message]
}>()

const timeStr = computed(() => {
  const d = props.message.timestamp
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
})

const fullTimestamp = computed(() => {
  const d = props.message.timestamp
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
})

const isVolunteer = computed(() => props.message.author.id.startsWith('vol-'))

const questionStatusClass = computed(() => {
  if (!props.message.isQuestion) return ''
  switch (props.message.questionStatus) {
    case 'pending': return 'border-l-2 border-yellow-500 pl-2'
    case 'resolved': return 'border-l-2 border-green-500 pl-2'
    case 'needs_info': return 'border-l-2 border-blue-500 pl-2'
    case 'volunteer_answered': return 'border-l-2 border-gray-500 pl-2'
    default: return ''
  }
})

const questionStatusIcon = computed(() => {
  if (!props.message.isQuestion) return ''
  switch (props.message.questionStatus) {
    case 'pending': return '❓'
    case 'resolved': return '✅'
    case 'needs_info': return '💬'
    case 'volunteer_answered': return '🤖'
    default: return ''
  }
})

function handleReply() {
  emit('reply', props.message)
}
</script>

<template>
  <div class="group relative">
    <!-- Reply reference -->
    <ReplyPreview v-if="message.reference" :reference="message.reference" />

    <div
      class="flex px-4 py-0.5 hover:bg-dc-bg-modifier-hover"
      :class="[
        { 'mt-4': isGroupStart && !message.reference },
        questionStatusClass
      ]"
    >
      <!-- Avatar or timestamp gutter -->
      <div class="w-10 shrink-0 mr-4 flex justify-center">
        <Avatar
          v-if="isGroupStart"
          :src="message.author.avatarUrl"
          :status="undefined"
          size="lg"
          class="mt-0.5 cursor-pointer"
        />
        <span
          v-else
          class="text-[10px] text-dc-text-faint opacity-0 group-hover:opacity-100 leading-[22px] select-none"
        >
          {{ timeStr }}
        </span>
      </div>

      <!-- Message content -->
      <div class="flex-1 min-w-0">
        <!-- Author line -->
        <div v-if="isGroupStart" class="flex items-baseline gap-2">
          <span
            class="font-medium text-[15px] cursor-pointer hover:underline"
            :class="message.author.isBot ? 'text-dc-brand' : isVolunteer ? 'text-emerald-400' : 'text-dc-text-normal'"
          >
            {{ message.author.displayName }}
          </span>
          <span
            v-if="message.author.isBot"
            class="text-[10px] px-1 py-px bg-dc-brand text-white rounded font-medium leading-none"
          >
            BOT
          </span>
          <span
            v-if="isVolunteer"
            class="text-[10px] px-1.5 py-px bg-emerald-600 text-white rounded font-medium leading-none"
          >
            类脑自研答疑AI
          </span>
          <time class="text-[11px] text-dc-text-muted" :title="fullTimestamp">
            {{ timeStr }}
          </time>
        </div>

        <!-- Message text -->
        <div class="text-[15px] text-dc-text-normal leading-[1.375rem] break-words whitespace-pre-wrap">
          <span v-if="questionStatusIcon" class="mr-1">{{ questionStatusIcon }}</span>
          {{ message.content }}
          <span v-if="message.score !== undefined" class="ml-2 text-xs text-yellow-400">
            (得分: {{ message.score }})
          </span>
        </div>

        <!-- Reactions -->
        <div v-if="message.reactions.length > 0" class="flex flex-wrap gap-1 mt-1">
          <button
            v-for="(reaction, i) in message.reactions"
            :key="i"
            class="flex items-center gap-1 px-1.5 h-6 rounded-md border text-[13px] cursor-pointer"
            :class="[
              reaction.reacted
                ? 'bg-dc-mention-bg border-dc-brand text-dc-brand'
                : 'bg-dc-bg-secondary border-dc-divider text-dc-text-normal hover:border-dc-interactive-normal',
            ]"
          >
            <span>{{ reaction.emoji }}</span>
            <span class="font-medium">{{ reaction.count }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Hover actions -->
    <MessageHoverActions @reply="handleReply" />
  </div>
</template>

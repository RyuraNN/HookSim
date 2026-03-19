<script setup lang="ts">
import { computed, onMounted, provide } from 'vue'
import { useChannelStore, useMessageStore, useGameStore } from '@/stores'
import { useGameController } from '@/composables/useGameController'
import ChatHeader from './ChatHeader.vue'
import MessageList from './MessageList.vue'
import MessageInput from './MessageInput.vue'
import TypingIndicator from './TypingIndicator.vue'
import GameStatusBar from './GameStatusBar.vue'
import EvaluationPanel, { type QuestionEvaluation } from './EvaluationPanel.vue'
import type { Message } from '@/types'

const channelStore = useChannelStore()
const messageStore = useMessageStore()
const gameStore = useGameStore()
const gameController = useGameController()

provide('gameController', gameController)

const messages = computed(() => {
  if (!channelStore.activeChannelId) return []
  return messageStore.messagesForChannel(channelStore.activeChannelId)
})

const typingUserNames = computed(() => {
  if (!channelStore.activeChannelId) return []
  return messageStore.typingUsers.get(channelStore.activeChannelId) || []
})

const evaluations = computed<QuestionEvaluation[]>(() => {
  return gameStore.evaluatedQuestions.map((state) => ({
    questionId: state.messageId,
    questionContent: state.questionContent || '',
    playerAnswer: state.playerReplies[state.playerReplies.length - 1] || '',
    evaluation: state.evaluation!,
    timestamp: new Date(),
  }))
})

function handleSend(content: string) {
  if (!channelStore.activeChannelId) return
  
  if (gameController.replyingTo.value) {
    gameController.sendReply(content)
  } else {
    messageStore.sendMessage(channelStore.activeChannelId, content)
  }
}

function handleReply(message: Message) {
  gameController.setReplyTarget(message)
}

function handleCancelReply() {
  gameController.setReplyTarget(null)
}

onMounted(() => {
  gameController.startGame()
})
</script>

<template>
  <main class="flex-1 flex flex-col min-w-0 bg-dc-bg-primary">
    <template v-if="channelStore.activeChannel">
      <ChatHeader :channel="channelStore.activeChannel" />
      <GameStatusBar
        :round="gameStore.roundNumber"
        :resolved="gameStore.resolvedCount"
        :total="gameStore.totalQuestions"
        :score="gameStore.totalScore"
        :is-generating="gameStore.isGenerating"
      />
      <MessageList
        :messages="messages"
        @reply="handleReply"
      />
      <TypingIndicator :users="typingUserNames" />
      <MessageInput
        :channel-name="channelStore.activeChannel.name"
        :replying-to="gameController.replyingTo.value"
        @send="handleSend"
        @cancel-reply="handleCancelReply"
      />
      <EvaluationPanel :evaluations="evaluations" />
    </template>
    <div v-else class="flex-1 flex items-center justify-center text-dc-text-muted">
      Select a channel to start chatting
    </div>
  </main>
</template>

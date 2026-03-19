import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Message, MessageReference } from '@/types'
import { currentUser } from '@/mock'

const STORAGE_KEY = 'hooksim_messages'

function loadMessages(): Message[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return parsed.map((m: Message & { timestamp: string }) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }))
    }
  } catch (e) {
    console.warn('Failed to load messages:', e)
  }
  return []
}

function saveMessages(messages: Message[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  } catch (e) {
    console.warn('Failed to save messages:', e)
  }
}

export const useMessageStore = defineStore('message', () => {
  const messages = ref<Message[]>(loadMessages())
  const typingUsers = ref<Map<string, string[]>>(new Map())

  function messagesForChannel(channelId: string): readonly Message[] {
    return messages.value
      .filter(m => m.channelId === channelId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  function sendMessage(
    channelId: string,
    content: string,
    replyTo?: { messageId: string; authorName: string; content: string }
  ): Message {
    const reference: MessageReference | undefined = replyTo
      ? {
          messageId: replyTo.messageId,
          authorName: replyTo.authorName,
          content: replyTo.content.slice(0, 100),
        }
      : undefined

    const newMessage: Message = {
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      channelId,
      author: currentUser,
      content,
      timestamp: new Date(),
      attachments: [],
      reactions: [],
      pinned: false,
      reference,
    }
    messages.value = [...messages.value, newMessage]
    saveMessages(messages.value)
    return newMessage
  }

  function addMessage(message: Message) {
    messages.value = [...messages.value, message]
    saveMessages(messages.value)
  }

  function updateMessage(messageId: string, updates: Partial<Message>) {
    messages.value = messages.value.map((m) =>
      m.id === messageId ? { ...m, ...updates } : m
    )
    saveMessages(messages.value)
  }

  function getMessageById(messageId: string): Message | undefined {
    return messages.value.find((m) => m.id === messageId)
  }

  function clearMessages() {
    messages.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  function setTypingInChannel(channelId: string, userIds: string[]) {
    typingUsers.value.set(channelId, userIds)
  }

  function clearTypingInChannel(channelId: string) {
    typingUsers.value.delete(channelId)
  }

  return {
    messages,
    typingUsers,
    messagesForChannel,
    sendMessage,
    addMessage,
    updateMessage,
    getMessageById,
    clearMessages,
    setTypingInChannel,
    clearTypingInChannel,
  }
})

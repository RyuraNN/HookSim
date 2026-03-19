import { computed } from 'vue'
import type { Message } from '@/types'

export interface MessageGroup {
  readonly date: string
  readonly groups: readonly AuthorGroup[]
}

export interface AuthorGroup {
  readonly authorId: string
  readonly messages: readonly Message[]
}

const GROUP_THRESHOLD_MS = 7 * 60 * 1000 // 7 minutes

function formatDateSeparator(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.floor((today.getTime() - target.getTime()) / 86400000)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export function useMessageGrouping(messagesGetter: () => readonly Message[]) {
  return computed<readonly MessageGroup[]>(() => {
    const messages = messagesGetter()
    if (messages.length === 0) return []

    const dayBuckets = new Map<string, Message[]>()

    for (const msg of messages) {
      const key = dateKey(msg.timestamp)
      const bucket = dayBuckets.get(key)
      if (bucket) {
        bucket.push(msg)
      } else {
        dayBuckets.set(key, [msg])
      }
    }

    const result: MessageGroup[] = []

    for (const [, dayMessages] of dayBuckets) {
      const authorGroups: AuthorGroup[] = []
      let currentGroup: { authorId: string; messages: Message[] } | null = null

      for (const msg of dayMessages) {
        const shouldStartNewGroup =
          !currentGroup ||
          currentGroup.authorId !== msg.author.id ||
          msg.reference != null ||
          msg.timestamp.getTime() -
            currentGroup.messages[currentGroup.messages.length - 1].timestamp.getTime() >
            GROUP_THRESHOLD_MS

        if (shouldStartNewGroup) {
          currentGroup = { authorId: msg.author.id, messages: [msg] }
          authorGroups.push(currentGroup)
        } else {
          currentGroup!.messages.push(msg)
        }
      }

      result.push({
        date: formatDateSeparator(dayMessages[0].timestamp),
        groups: authorGroups,
      })
    }

    return result
  })
}

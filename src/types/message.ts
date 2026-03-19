export type UserStatus = 'online' | 'idle' | 'dnd' | 'offline'

export interface User {
  readonly id: string
  readonly username: string
  readonly displayName: string
  readonly avatarUrl: string
  readonly status: UserStatus
  readonly isBot: boolean
}

export interface Attachment {
  readonly id: string
  readonly filename: string
  readonly url: string
  readonly contentType: string
  readonly width?: number
  readonly height?: number
}

export interface Reaction {
  readonly emoji: string
  readonly count: number
  readonly reacted: boolean
}

export interface MessageReference {
  readonly messageId: string
  readonly authorName: string
  readonly content: string
}

export type MessageStatus = 'pending' | 'resolved' | 'needs_info' | 'volunteer_answered'

export interface Message {
  readonly id: string
  readonly channelId: string
  readonly author: User
  readonly content: string
  readonly timestamp: Date
  readonly editedAt?: Date
  readonly attachments: readonly Attachment[]
  readonly reactions: readonly Reaction[]
  readonly reference?: MessageReference
  readonly pinned: boolean
  readonly isQuestion?: boolean
  readonly questionStatus?: MessageStatus
  readonly wikiTopicId?: string
  readonly score?: number
}

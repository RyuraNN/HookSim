export type ChannelType = 'text' | 'voice' | 'announcement'

export interface Channel {
  readonly id: string
  readonly name: string
  readonly type: ChannelType
  readonly categoryId: string
  readonly serverId: string
  readonly topic?: string
  readonly hasUnread: boolean
  readonly mentionCount: number
}

export interface ChannelCategory {
  readonly id: string
  readonly name: string
  readonly serverId: string
  readonly collapsed: boolean
}

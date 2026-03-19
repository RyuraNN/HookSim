import type { Channel, ChannelCategory } from '@/types'

export const mockCategories: readonly ChannelCategory[] = [
  // Server 1 - 类脑ΟΔΥΣΣΕΙΑ
  { id: 'cat-1-1', name: '新手指南', serverId: 's-1', collapsed: false },
]

export const mockChannels: readonly Channel[] = [
  // Server 1 - 类脑ΟΔΥΣΣΕΙΑ
  { id: 'ch-1-1', name: '❓︱看完再问：新手答疑', type: 'text', categoryId: 'cat-1-1', serverId: 's-1', topic: '新手答疑频道', hasUnread: false, mentionCount: 0 },
]

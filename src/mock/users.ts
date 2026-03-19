import type { User } from '@/types'

export const currentUser: User = {
  id: 'u-me',
  username: 'player_one',
  displayName: 'Player One',
  avatarUrl: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=player1',
  status: 'online',
  isBot: false,
}

export const mockUsers: readonly User[] = [
  currentUser,
  {
    id: 'u-2',
    username: 'dark_mage',
    displayName: 'Dark Mage',
    avatarUrl: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=darkmage',
    status: 'online',
    isBot: false,
  },
  {
    id: 'u-3',
    username: 'swift_arrow',
    displayName: 'Swift Arrow',
    avatarUrl: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=swiftarrow',
    status: 'idle',
    isBot: false,
  },
  {
    id: 'u-4',
    username: 'iron_shield',
    displayName: 'Iron Shield',
    avatarUrl: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=ironshield',
    status: 'dnd',
    isBot: false,
  },
  {
    id: 'u-5',
    username: 'Odysseia-Main',
    displayName: 'Odysseia-Main',
    avatarUrl: 'https://cdn.discordapp.com/avatars/1374372307916554351/7dc8532a639087a6875ad97505ef04f4.png?size=128',
    status: 'online',
    isBot: true,
  },
  {
    id: 'u-6',
    username: 'shadow_rogue',
    displayName: 'Shadow Rogue',
    avatarUrl: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=shadowrogue',
    status: 'offline',
    isBot: false,
  },
]

export const simulatedNewbies: readonly User[] = [
  {
    id: 'sim-1',
    username: 'confused_newbie',
    displayName: '迷茫的新人',
    avatarUrl: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=newbie1',
    status: 'online',
    isBot: false,
  },
  {
    id: 'sim-2',
    username: 'st_beginner',
    displayName: '酒馆萌新',
    avatarUrl: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=newbie2',
    status: 'online',
    isBot: false,
  },
  {
    id: 'sim-3',
    username: 'help_seeker',
    displayName: '求助者',
    avatarUrl: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=newbie3',
    status: 'online',
    isBot: false,
  },
  {
    id: 'sim-4',
    username: 'ai_explorer',
    displayName: 'AI探索者',
    avatarUrl: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=newbie4',
    status: 'idle',
    isBot: false,
  },
  {
    id: 'sim-5',
    username: 'tech_noob',
    displayName: '技术小白',
    avatarUrl: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=newbie5',
    status: 'online',
    isBot: false,
  },
  {
    id: 'sim-6',
    username: 'desperate_user',
    displayName: '急需帮助',
    avatarUrl: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=newbie6',
    status: 'online',
    isBot: false,
  },
]

// 真实志愿者名单（类脑社区答疑志愿者客串）
export const volunteerUsers: readonly User[] = [
  {
    id: 'vol-1',
    username: 'mmmmhv',
    displayName: 'mmmmhv',
    avatarUrl: 'https://cdn.discordapp.com/avatars/1420816979643727915/3be846df2ef900759b5a290e81f931f4.png?size=128',
    status: 'online',
    isBot: false,
  },
  {
    id: 'vol-2',
    username: 'MarSan',
    displayName: '𝓜𝓪𝓻𝓢𝓪𝓷',
    avatarUrl: 'https://cdn.discordapp.com/avatars/1362434826287972457/c1022a7c41d840f396d6a8fcbf04f8a1.png?size=128',
    status: 'online',
    isBot: false,
  },
]

export function getRandomNewbie(): User {
  const index = Math.floor(Math.random() * simulatedNewbies.length)
  const template = simulatedNewbies[index]
  // 生成唯一ID，避免不同问题的用户被分组在一起
  return {
    ...template,
    id: `${template.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  }
}

export function getRandomVolunteer(): User {
  const index = Math.floor(Math.random() * volunteerUsers.length)
  const template = volunteerUsers[index]
  // 生成唯一ID，保留vol-前缀以便徽标识别
  return {
    ...template,
    id: `vol-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  }
}

export function getUserById(id: string): User {
  return mockUsers.find(u => u.id === id) ?? currentUser
}

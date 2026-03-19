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

// Discord默认头像（6种颜色）
const DISCORD_DEFAULT_AVATARS = [
  'https://cdn.discordapp.com/embed/avatars/0.png', // 蓝色
  'https://cdn.discordapp.com/embed/avatars/1.png', // 灰色
  'https://cdn.discordapp.com/embed/avatars/2.png', // 绿色
  'https://cdn.discordapp.com/embed/avatars/3.png', // 黄色
  'https://cdn.discordapp.com/embed/avatars/4.png', // 红色
  'https://cdn.discordapp.com/embed/avatars/5.png', // 粉色
]

// 根据用户名生成一致的头像索引
function getAvatarForName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i)
    hash |= 0
  }
  return DISCORD_DEFAULT_AVATARS[Math.abs(hash) % DISCORD_DEFAULT_AVATARS.length]
}

// 真实Discord风格用户名池
const NEWBIE_NAMES: string[] = [
  // 纯数字
  '114514', '998877', '2024xin', '66778899', '123456abc',
  // 数字+字母混合
  'zzz2233', 'abc12306', 'test0721', 'qq8848', 'wx1375',
  // 拼音/中文昵称
  '酒馆萌新', '迷路的小白', '求助ing', '刚下课', '技术小白',
  '新人报到', '路过的咸鱼', '摸鱼选手', '半夜爬起来修bug',
  // 英文昵称
  'sleepycat', 'xiao_ming', 'just_a_noob', 'RP_lover', 'darknessss',
  'silentmoon', 'foxfox', 'cloudwalker', 'starfall_7',
  // 常见乱起名风格
  'asdfghjkl', 'qwerty', 'aaaaaaa', 'undefined', '无名氏',
  // 带特殊字符
  '.sunset.', '_夜雨_', 'x_x', '...', 'nico_nico_ni',
  // 偏二次元
  '某不知名魔法师', '被封号的勇者', '咕咕咕', '鸽子精',
  'miku_fan', '我推的AI', 'Claude酱好可爱',
  // 更多真实风格
  'wangwu55', 'zhangsan', 'lisi_2025', 'student_zzz',
  '打工人', '周末摆烂', '不想上班', '今天也在摸鱼',
]

// 已使用的名字缓存，避免同一轮重复
const usedNames = new Set<string>()

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
  // 如果所有名字都用过了，重置
  if (usedNames.size >= NEWBIE_NAMES.length) {
    usedNames.clear()
  }
  
  // 随机选一个未使用的名字
  let name: string
  do {
    name = NEWBIE_NAMES[Math.floor(Math.random() * NEWBIE_NAMES.length)]
  } while (usedNames.has(name))
  usedNames.add(name)
  
  return {
    id: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    username: name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
    displayName: name,
    avatarUrl: getAvatarForName(name),
    status: 'online',
    isBot: false,
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

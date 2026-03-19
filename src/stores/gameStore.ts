import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { wikiTopics, type WikiTopic } from '@/data/wikiIndex'
import type { Message, User } from '@/types'
import type { EvaluationResult } from '@/services/aiService'

const GAME_STATE_KEY = 'hooksim_game_state'

interface SavedGameState {
  roundNumber: number
  totalScore: number
  volunteerAnsweredCount: number
  missedThirdPartyCount: number
  caughtThirdPartyCount: number
  topicWeights: [string, number][]
}

function loadGameState(): SavedGameState | null {
  try {
    const saved = localStorage.getItem(GAME_STATE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.warn('Failed to load game state:', e)
  }
  return null
}

function saveGameState(state: SavedGameState) {
  try {
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('Failed to save game state:', e)
  }
}

export interface QuestionState {
  topicId: string
  messageId: string
  status: 'pending' | 'answered' | 'resolved' | 'needs_info' | 'volunteer_answered'
  score?: number
  playerReplies: string[]
  questionContent?: string
  evaluation?: EvaluationResult
  isThirdPartyUser?: boolean // 是否为不合规第三方API用户
  thirdPartyChecked?: boolean // 玩家是否询问了API/插头/后台
}

export interface TopicWeight {
  topicId: string
  weight: number
}

export const useGameStore = defineStore('game', () => {
  const savedState = loadGameState()
  
  const isGenerating = ref(false)
  const typingUsers = ref<User[]>([])
  const currentRoundTopics = ref<WikiTopic[]>([])
  const questionStates = ref<Map<string, QuestionState>>(new Map())
  const topicWeights = ref<Map<string, number>>(savedState?.topicWeights ? new Map(savedState.topicWeights) : new Map())
  const totalScore = ref(savedState?.totalScore ?? 0)
  const roundNumber = ref(savedState?.roundNumber ?? 0)
  const pendingMessages = ref<{ message: Message; delay: number }[]>([])
  const evaluationTimers = ref<Map<string, number>>(new Map())
  const volunteerTimers = ref<Map<string, number>>(new Map())
  const volunteerAnsweredCount = ref(0) // 被志愿者抢答的数量
  const missedThirdPartyCount = ref(0) // 被放过的第三方数量
  const caughtThirdPartyCount = ref(0) // 抓到的第三方数量
  const PLAYER_IDLE_TIMEOUT = 120_000 // 2分钟无消息则暂停
  const lastPlayerActivityTime = ref(Date.now())
  const isPlayerIdle = computed(() => Date.now() - lastPlayerActivityTime.value > PLAYER_IDLE_TIMEOUT)
  const isPaused = ref(false) // 因玩家闲置而暂停

  const resolvedCount = computed(() => {
    let count = 0
    questionStates.value.forEach((state) => {
      if (state.status === 'resolved') count++
    })
    return count
  })

  const completedCount = computed(() => {
    let count = 0
    questionStates.value.forEach((state) => {
      if (state.status === 'resolved' || state.status === 'volunteer_answered') count++
    })
    return count
  })

  const totalQuestions = computed(() => questionStates.value.size)

  const completionRate = computed(() => {
    if (totalQuestions.value === 0) return 0
    return completedCount.value / totalQuestions.value
  })

  const pendingQuestions = computed(() => {
    const pending: QuestionState[] = []
    questionStates.value.forEach((state) => {
      if (state.status === 'pending' || state.status === 'needs_info') {
        pending.push(state)
      }
    })
    return pending
  })

  function initializeWeights() {
    wikiTopics.forEach((topic) => {
      if (!topicWeights.value.has(topic.id)) {
        topicWeights.value.set(topic.id, 1.0)
      }
    })
  }

  function selectRandomTopics(count: number): WikiTopic[] {
    initializeWeights()
    
    const availableTopics = wikiTopics.filter((topic) => {
      const weight = topicWeights.value.get(topic.id) || 1.0
      return weight > 0.1
    })

    if (availableTopics.length === 0) {
      topicWeights.value.forEach((_, key) => {
        topicWeights.value.set(key, 1.0)
      })
      return selectRandomTopics(count)
    }

    const totalWeight = availableTopics.reduce((sum, topic) => {
      return sum + (topicWeights.value.get(topic.id) || 1.0)
    }, 0)

    const selected: WikiTopic[] = []
    const selectedIds = new Set<string>()

    while (selected.length < count && selected.length < availableTopics.length) {
      let random = Math.random() * totalWeight
      
      for (const topic of availableTopics) {
        if (selectedIds.has(topic.id)) continue
        
        const weight = topicWeights.value.get(topic.id) || 1.0
        random -= weight
        
        if (random <= 0) {
          selected.push(topic)
          selectedIds.add(topic.id)
          const currentWeight = topicWeights.value.get(topic.id) || 1.0
          topicWeights.value.set(topic.id, currentWeight * 0.3)
          break
        }
      }
    }

    return selected
  }

  function persistState() {
    saveGameState({
      roundNumber: roundNumber.value,
      totalScore: totalScore.value,
      volunteerAnsweredCount: volunteerAnsweredCount.value,
      missedThirdPartyCount: missedThirdPartyCount.value,
      caughtThirdPartyCount: caughtThirdPartyCount.value,
      topicWeights: Array.from(topicWeights.value.entries()),
    })
  }

  function startNewRound() {
    roundNumber.value++
    const topicCount = Math.min(4 + Math.floor(roundNumber.value / 2), 8)
    currentRoundTopics.value = selectRandomTopics(topicCount)
    questionStates.value.clear()
    persistState()
  }

  function addQuestionState(topicId: string, messageId: string, questionContent?: string) {
    // 随机决定是否为不合规第三方用户（约15%概率）
    const isThirdPartyUser = Math.random() < 0.15
    
    questionStates.value.set(messageId, {
      topicId,
      messageId,
      status: 'pending',
      playerReplies: [],
      questionContent,
      isThirdPartyUser,
      thirdPartyChecked: false,
    })
  }

  function updateQuestionStatus(
    messageId: string,
    status: QuestionState['status'],
    score?: number,
    evaluation?: EvaluationResult
  ) {
    const state = questionStates.value.get(messageId)
    if (state) {
      state.status = status
      if (score !== undefined) {
        state.score = score
        totalScore.value += score
        persistState()
      }
      if (evaluation) {
        state.evaluation = evaluation
      }
    }
  }

  const evaluatedQuestions = computed(() => {
    const result: QuestionState[] = []
    questionStates.value.forEach((state) => {
      if (state.evaluation) {
        result.push(state)
      }
    })
    return result
  })

  function addPlayerReply(questionMessageId: string, replyContent: string) {
    const state = questionStates.value.get(questionMessageId)
    if (state) {
      state.playerReplies.push(replyContent)
      state.status = 'answered'
    }
  }

  function setTypingUser(user: User) {
    // 按displayName去重，避免同名用户重复显示
    if (!typingUsers.value.find((u) => u.displayName === user.displayName)) {
      typingUsers.value.push(user)
    }
  }

  function removeTypingUser(userId: string) {
    typingUsers.value = typingUsers.value.filter((u) => u.id !== userId)
  }

  function clearTypingUsers() {
    typingUsers.value = []
  }

  function scheduleMessage(message: Message, delayMs: number) {
    pendingMessages.value.push({ message, delay: delayMs })
  }

  function getRandomDelay(minSeconds: number, maxSeconds: number): number {
    return (minSeconds + Math.random() * (maxSeconds - minSeconds)) * 1000
  }

  function shouldStartNewRound(): boolean {
    if (isPaused.value) return false
    return completionRate.value >= 0.75
  }

  function recordPlayerActivity() {
    lastPlayerActivityTime.value = Date.now()
    isPaused.value = false
  }

  function checkAndPauseIfIdle(): boolean {
    if (Date.now() - lastPlayerActivityTime.value > PLAYER_IDLE_TIMEOUT) {
      isPaused.value = true
      return true
    }
    return false
  }

  function setEvaluationTimer(messageId: string, timerId: number) {
    evaluationTimers.value.set(messageId, timerId)
  }

  function clearEvaluationTimer(messageId: string) {
    const timerId = evaluationTimers.value.get(messageId)
    if (timerId) {
      clearTimeout(timerId)
      evaluationTimers.value.delete(messageId)
    }
  }

  function setVolunteerTimer(messageId: string, timerId: number) {
    volunteerTimers.value.set(messageId, timerId)
  }

  function clearVolunteerTimer(messageId: string) {
    const timerId = volunteerTimers.value.get(messageId)
    if (timerId) {
      clearTimeout(timerId)
      volunteerTimers.value.delete(messageId)
    }
  }

  function markVolunteerAnswered(messageId: string) {
    const state = questionStates.value.get(messageId)
    if (state && state.status === 'pending') {
      state.status = 'volunteer_answered'
      volunteerAnsweredCount.value++
    }
    volunteerTimers.value.delete(messageId)
  }

  function isVolunteerAnswered(messageId: string): boolean {
    const state = questionStates.value.get(messageId)
    return state?.status === 'volunteer_answered'
  }

  // 检测玩家回复是否包含询问API/插头/后台的关键词
  const thirdPartyCheckKeywords = [
    '插头', '看看插头', '插头截图',
    'api', 'API', 'Api',
    '后台', '酒馆后台', '看看后台',
    '接入点', 'API接入点',
    '截图', '发个截图', '截图看看',
    '用的什么', '什么渠道', '什么api',
    '哪个渠道', '渠道', '第三方',
    '贩子', '淘宝', '闲鱼',
  ]

  function checkForThirdPartyInquiry(content: string): boolean {
    const lowerContent = content.toLowerCase()
    return thirdPartyCheckKeywords.some(keyword => 
      lowerContent.includes(keyword.toLowerCase())
    )
  }

  // 标记玩家已询问第三方
  function markThirdPartyChecked(messageId: string) {
    const state = questionStates.value.get(messageId)
    if (state) {
      state.thirdPartyChecked = true
    }
  }

  // 处理第三方检测结果，返回是否需要显示警告
  function processThirdPartyCheck(messageId: string, playerReply: string): { 
    shouldWarn: boolean
    isMissed: boolean 
  } {
    const state = questionStates.value.get(messageId)
    if (!state || !state.isThirdPartyUser) {
      return { shouldWarn: false, isMissed: false }
    }

    const askedAboutApi = checkForThirdPartyInquiry(playerReply)
    
    if (askedAboutApi) {
      state.thirdPartyChecked = true
      caughtThirdPartyCount.value++
      return { shouldWarn: true, isMissed: false }
    }
    
    return { shouldWarn: false, isMissed: false }
  }

  // 在问题解决时检查是否放过了第三方
  function finalizeThirdPartyCheck(messageId: string): boolean {
    const state = questionStates.value.get(messageId)
    if (!state) return false
    
    if (state.isThirdPartyUser && !state.thirdPartyChecked) {
      missedThirdPartyCount.value++
      return true // 放过了一个第三方
    }
    return false
  }

  function reset() {
    isGenerating.value = false
    typingUsers.value = []
    currentRoundTopics.value = []
    questionStates.value.clear()
    totalScore.value = 0
    roundNumber.value = 0
    pendingMessages.value = []
    evaluationTimers.value.forEach((timerId) => clearTimeout(timerId))
    evaluationTimers.value.clear()
    volunteerTimers.value.forEach((timerId) => clearTimeout(timerId))
    volunteerTimers.value.clear()
    volunteerAnsweredCount.value = 0
    missedThirdPartyCount.value = 0
    caughtThirdPartyCount.value = 0
    lastPlayerActivityTime.value = Date.now()
    isPaused.value = false
  }

  return {
    isGenerating,
    typingUsers,
    currentRoundTopics,
    questionStates,
    topicWeights,
    totalScore,
    roundNumber,
    pendingMessages,
    resolvedCount,
    completedCount,
    totalQuestions,
    completionRate,
    pendingQuestions,
    evaluatedQuestions,
    missedThirdPartyCount,
    caughtThirdPartyCount,
    volunteerAnsweredCount,
    isPlayerIdle,
    isPaused,
    lastPlayerActivityTime,
    initializeWeights,
    selectRandomTopics,
    startNewRound,
    addQuestionState,
    updateQuestionStatus,
    addPlayerReply,
    setTypingUser,
    removeTypingUser,
    clearTypingUsers,
    scheduleMessage,
    getRandomDelay,
    shouldStartNewRound,
    recordPlayerActivity,
    checkAndPauseIfIdle,
    setEvaluationTimer,
    clearEvaluationTimer,
    setVolunteerTimer,
    clearVolunteerTimer,
    markVolunteerAnswered,
    isVolunteerAnswered,
    checkForThirdPartyInquiry,
    markThirdPartyChecked,
    processThirdPartyCheck,
    finalizeThirdPartyCheck,
    reset,
  }
})

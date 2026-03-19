import { ref, computed } from 'vue'
import { useGameStore, useMessageStore, useChannelStore } from '@/stores'
import { generateQuestions, evaluateAnswer, generateFollowup, generateBatchVolunteerAnswers, parseGeneratedQuestions, type BatchQuestion } from '@/services/aiService'
import { wikiTopics } from '@/data/wikiIndex'
import { getRandomNewbie, getRandomVolunteer } from '@/mock/users'
import type { Message, User } from '@/types'

export function useGameController() {
  const gameStore = useGameStore()
  const messageStore = useMessageStore()
  const channelStore = useChannelStore()

  const isStartingRound = ref(false)
  const streamBuffer = ref('')
  const replyingTo = ref<Message | null>(null)
  
  // 批量志愿者回答系统
  const pendingVolunteerQuestions = ref<Map<string, { message: Message; topicId: string; addedAt: number }>>(new Map())
  let volunteerBatchTimerId: number | null = null
  const VOLUNTEER_BATCH_INTERVAL = 30_000 // 30秒批处理一次
  const VOLUNTEER_MIN_WAIT = 20_000 // 问题至少等待20秒才会被志愿者回答

  const activeChannelId = computed(() => channelStore.activeChannelId || 'ch-1-1')

  async function startGame() {
    gameStore.reset()
    messageStore.clearMessages()
    await startNewRound()
  }

  async function startNewRound() {
    if (isStartingRound.value) return
    isStartingRound.value = true
    gameStore.isGenerating = true
    streamBuffer.value = ''

    try {
      gameStore.startNewRound()
      const topics = gameStore.currentRoundTopics

      if (topics.length === 0) {
        console.error('No topics selected')
        return
      }

      await generateQuestions(topics, {
        onChunk: (chunk) => {
          streamBuffer.value += chunk
          processStreamBuffer()
        },
        onComplete: () => {
          processRemainingBuffer()
          gameStore.isGenerating = false
          gameStore.clearTypingUsers()
        },
        onError: (error) => {
          console.error('Question generation error:', error)
          gameStore.isGenerating = false
          gameStore.clearTypingUsers()
        },
      })
    } finally {
      isStartingRound.value = false
    }
  }

  const pendingQuestions: { content: string; messages: string[]; topicId: string; user: User }[] = []
  let questionIndex = 0

  function processStreamBuffer() {
    const questions = parseGeneratedQuestions(streamBuffer.value)
    
    while (questionIndex < questions.length) {
      const q = questions[questionIndex]
      const user = getRandomNewbie()
      pendingQuestions.push({ ...q, user })
      
      scheduleQuestionMessages(q.messages, q.content, q.topicId, user)
      questionIndex++
    }
  }

  function processRemainingBuffer() {
    processStreamBuffer()
    questionIndex = 0
    pendingQuestions.length = 0
  }

  function scheduleQuestionMessages(messages: string[], fullContent: string, topicId: string, user: User) {
    const baseDelay = gameStore.getRandomDelay(10, 45)
    
    gameStore.setTypingUser(user)
    messageStore.setTypingInChannel(activeChannelId.value, 
      gameStore.typingUsers.map(u => u.displayName)
    )

    let cumulativeDelay = baseDelay

    messages.forEach((msgContent, idx) => {
      const isLastMsg = idx === messages.length - 1
      const currentDelay = cumulativeDelay

      setTimeout(() => {
        const message: Message = {
          id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          channelId: activeChannelId.value,
          author: user,
          content: msgContent,
          timestamp: new Date(),
          attachments: [],
          reactions: [],
          pinned: false,
          isQuestion: isLastMsg,
          questionStatus: isLastMsg ? 'pending' : undefined,
          wikiTopicId: isLastMsg ? topicId : undefined,
        }

        messageStore.addMessage(message)

        if (isLastMsg) {
          gameStore.addQuestionState(topicId, message.id, fullContent)
          gameStore.removeTypingUser(user.id)
          
          if (gameStore.typingUsers.length === 0) {
            messageStore.clearTypingInChannel(activeChannelId.value)
          } else {
            messageStore.setTypingInChannel(activeChannelId.value,
              gameStore.typingUsers.map(u => u.displayName)
            )
          }

          // 启动志愿者抢答定时器（20~60秒后触发）
          scheduleVolunteerAnswer(message, topicId)
        }
      }, currentDelay)

      // Stagger subsequent messages by a short interval (simulating fast typing)
      cumulativeDelay += gameStore.getRandomDelay(3, 12)
    })
  }

  // 将问题加入待回答队列
  function scheduleVolunteerAnswer(questionMessage: Message, topicId: string) {
    pendingVolunteerQuestions.value.set(questionMessage.id, {
      message: questionMessage,
      topicId,
      addedAt: Date.now(),
    })
    
    // 启动批处理定时器（如果还没启动）
    if (volunteerBatchTimerId === null) {
      volunteerBatchTimerId = window.setInterval(() => {
        processVolunteerBatch()
      }, VOLUNTEER_BATCH_INTERVAL)
    }
  }

  // 批量处理志愿者回答
  async function processVolunteerBatch() {
    // 检查玩家是否闲置
    if (gameStore.checkAndPauseIfIdle()) {
      return
    }

    const now = Date.now()
    const readyQuestions: Array<{ id: string; message: Message; topicId: string }> = []

    // 收集已等待足够时间且仍待回答的问题
    pendingVolunteerQuestions.value.forEach((item, id) => {
      if (now - item.addedAt < VOLUNTEER_MIN_WAIT) return // 还没等够时间
      
      const state = gameStore.questionStates.get(id)
      if (!state || state.status !== 'pending') {
        pendingVolunteerQuestions.value.delete(id)
        return
      }
      if (gameStore.isVolunteerAnswered(id)) {
        pendingVolunteerQuestions.value.delete(id)
        return
      }
      
      readyQuestions.push({ id, message: item.message, topicId: item.topicId })
    })

    if (readyQuestions.length === 0) return

    // 构建批量请求
    const batchQuestions: BatchQuestion[] = readyQuestions.map(q => {
      const topic = wikiTopics.find((t: { id: string }) => t.id === q.topicId)
      const state = gameStore.questionStates.get(q.id)
      return {
        id: q.id,
        question: state?.questionContent || q.message.content,
        wikiContent: topic?.content || '',
      }
    })

    // 显示志愿者正在输入
    const volunteer = getRandomVolunteer()
    gameStore.setTypingUser(volunteer)
    messageStore.setTypingInChannel(activeChannelId.value,
      gameStore.typingUsers.map(u => u.displayName)
    )

    // 等待一段时间模拟思考/打字
    await new Promise(resolve => setTimeout(resolve, gameStore.getRandomDelay(8, 12)))

    try {
      // 批量生成回答
      const answers = await generateBatchVolunteerAnswers(batchQuestions)

      // 依次发送每个问题的回答
      let totalDelay = 0
      readyQuestions.forEach((q, qIdx) => {
        const answerContent = answers.get(q.id)?.[0] || '这个问题我也不太清楚呢'
        
        // 标记为志愿者已回答
        gameStore.markVolunteerAnswered(q.id)
        messageStore.updateMessage(q.id, { questionStatus: 'volunteer_answered' })
        pendingVolunteerQuestions.value.delete(q.id)

        setTimeout(() => {
          const volMessage: Message = {
            id: `vol-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            channelId: activeChannelId.value,
            author: volunteer,
            content: answerContent,
            timestamp: new Date(),
            attachments: [],
            reactions: [],
            pinned: false,
            reference: {
              messageId: q.message.id,
              authorName: q.message.author.displayName,
              content: q.message.content.slice(0, 100),
            },
          }
          messageStore.addMessage(volMessage)

          // 最后一个回答后清除输入状态
          if (qIdx === readyQuestions.length - 1) {
            gameStore.removeTypingUser(volunteer.id)
            if (gameStore.typingUsers.length === 0) {
              messageStore.clearTypingInChannel(activeChannelId.value)
            }

            // 新手用户回复感谢（只对最后一个）
            setTimeout(() => {
              addUserReply(q.message.author, '好的谢谢大佬！', volMessage.id)

              if (!gameStore.isPaused && gameStore.shouldStartNewRound()) {
                setTimeout(() => startNewRound(), 5000)
              }
            }, gameStore.getRandomDelay(5, 10))
          }
        }, totalDelay)

        totalDelay += gameStore.getRandomDelay(3, 6)
      })
    } catch (error) {
      console.error('Batch volunteer answer error:', error)
      gameStore.removeTypingUser(volunteer.id)
      if (gameStore.typingUsers.length === 0) {
        messageStore.clearTypingInChannel(activeChannelId.value)
      }
      addBotError('志愿者回答生成失败', error instanceof Error ? error.message : String(error))
    }
  }

  function setReplyTarget(message: Message | null) {
    replyingTo.value = message
  }

  async function sendReply(content: string) {
    if (!replyingTo.value) return

    // 记录玩家活动，如果之前暂停了则恢复游戏
    const wasPaused = gameStore.isPaused
    gameStore.recordPlayerActivity()
    if (wasPaused) {
      // 玩家回来了，开始新一轮
      setTimeout(() => startNewRound(), 2000)
    }

    const targetMessage = replyingTo.value
    messageStore.sendMessage(
      activeChannelId.value,
      content,
      {
        messageId: targetMessage.id,
        authorName: targetMessage.author.displayName,
        content: targetMessage.content,
      }
    )

    if (targetMessage.isQuestion && targetMessage.wikiTopicId) {
      // 玩家回复了，从待回答队列中移除
      pendingVolunteerQuestions.value.delete(targetMessage.id)
      gameStore.clearVolunteerTimer(targetMessage.id)
      
      gameStore.addPlayerReply(targetMessage.id, content)
      
      // 检测玩家是否询问了API/插头/后台
      const thirdPartyResult = gameStore.processThirdPartyCheck(targetMessage.id, content)
      
      if (thirdPartyResult.shouldWarn) {
        // 玩家询问了，且该用户是第三方用户，显示警告
        setTimeout(() => {
          addBotWarning(targetMessage.author.displayName)
        }, gameStore.getRandomDelay(2, 5))
      }
      
      const delay = gameStore.getRandomDelay(15, 45)
      const timerId = window.setTimeout(() => {
        evaluatePlayerAnswer(targetMessage, content)
      }, delay)
      
      gameStore.setEvaluationTimer(targetMessage.id, timerId)
    }

    replyingTo.value = null
  }

  async function evaluatePlayerAnswer(questionMessage: Message, playerAnswer: string) {
    const topic = wikiTopics.find(t => t.id === questionMessage.wikiTopicId)
    if (!topic) return

    try {
      const evaluation = await evaluateAnswer(
        questionMessage.content,
        playerAnswer,
        topic.content
      )

      if (evaluation.isCorrect && !evaluation.needsMoreInfo && evaluation.score >= 70) {
        // 在问题解决时检查是否放过了第三方用户
        gameStore.finalizeThirdPartyCheck(questionMessage.id)
        
        gameStore.updateQuestionStatus(questionMessage.id, 'resolved', evaluation.score, evaluation)
        messageStore.updateMessage(questionMessage.id, { questionStatus: 'resolved', score: evaluation.score })
        
        const followup = await generateFollowup(questionMessage.content, playerAnswer, evaluation)
        addUserReply(questionMessage.author, followup, questionMessage.id)
        
        if (gameStore.shouldStartNewRound()) {
          setTimeout(() => startNewRound(), 5000)
        }
      } else if (evaluation.needsMoreInfo) {
        gameStore.updateQuestionStatus(questionMessage.id, 'needs_info', evaluation.score, evaluation)
        messageStore.updateMessage(questionMessage.id, { questionStatus: 'needs_info' })
        
        const followup = await generateFollowup(questionMessage.content, playerAnswer, evaluation)
        addUserReply(questionMessage.author, followup, questionMessage.id)
        
      } else {
        gameStore.updateQuestionStatus(questionMessage.id, 'pending', evaluation.score, evaluation)
        
        const followup = await generateFollowup(questionMessage.content, playerAnswer, evaluation)
        addUserReply(questionMessage.author, followup, questionMessage.id)
        
      }
    } catch (error) {
      console.error('Evaluation error:', error)
    }
  }

  function addUserReply(user: User, content: string, replyToId: string) {
    const originalMessage = messageStore.getMessageById(replyToId)
    
    const message: Message = {
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      channelId: activeChannelId.value,
      author: user,
      content,
      timestamp: new Date(),
      attachments: [],
      reactions: [],
      pinned: false,
      reference: originalMessage ? {
        messageId: replyToId,
        authorName: originalMessage.author.displayName,
        content: originalMessage.content.slice(0, 100),
      } : undefined,
    }

    messageStore.addMessage(message)
  }

  function addSystemMessage(content: string) {
    const systemUser: User = {
      id: 'system',
      username: 'system',
      displayName: '🎮 游戏系统',
      avatarUrl: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=system',
      status: 'online',
      isBot: true,
    }

    const message: Message = {
      id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      channelId: activeChannelId.value,
      author: systemUser,
      content,
      timestamp: new Date(),
      attachments: [],
      reactions: [],
      pinned: false,
    }

    messageStore.addMessage(message)
  }

  // 添加第三方警告消息（Bot消息）
  function addBotWarning(userName: string) {
    const botUser: User = {
      id: 'Odysseia-bot',
      username: 'Odysseia-Main',
      displayName: 'Odysseia-Main',
      avatarUrl: 'https://cdn.discordapp.com/avatars/1374372307916554351/7dc8532a639087a6875ad97505ef04f4.png?size=128',
      status: 'online',
      isBot: true,
    }

    const warningContent = `⚠️ **警告** ⚠️\n\n用户 **${userName}** 因使用不合规第三方API（淘宝/闲鱼等贩子渠道）而被打回重新答题。\n\n📋 **类脑社区规定：**\n- 禁止使用淘宝/闲鱼等平台购买的API\n- 禁止使用未经验证的"半公益站"\n- 这类渠道可能参水（用垃圾模型冒充先进模型）\n- 使用贩子API是对免费分享角色卡/预设作者的不尊重\n\n✅ **允许使用的渠道：**\n- Google AI Studio官方API\n- 硅基流动、OpenRouter、AWS等正规聚合商\n- 社区认可的公益站和反代`

    const message: Message = {
      id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      channelId: activeChannelId.value,
      author: botUser,
      content: warningContent,
      timestamp: new Date(),
      attachments: [],
      reactions: [],
      pinned: false,
    }

    messageStore.addMessage(message)
  }

  // 添加错误提示消息（Bot消息）
  function addBotError(title: string, errorMessage: string) {
    const botUser: User = {
      id: 'Odysseia-bot',
      username: 'Odysseia-Main',
      displayName: 'Odysseia-Main',
      avatarUrl: 'https://cdn.discordapp.com/avatars/1374372307916554351/7dc8532a639087a6875ad97505ef04f4.png?size=128',
      status: 'online',
      isBot: true,
    }

    const errorContent = `❌ **${title}**\n\n\`\`\`\n${errorMessage}\n\`\`\`\n\n请检查API配置是否正确，或稍后重试。`

    const message: Message = {
      id: `bot-err-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      channelId: activeChannelId.value,
      author: botUser,
      content: errorContent,
      timestamp: new Date(),
      attachments: [],
      reactions: [],
      pinned: false,
    }

    messageStore.addMessage(message)
  }

  return {
    isStartingRound,
    replyingTo,
    startGame,
    startNewRound,
    setReplyTarget,
    sendReply,
    addSystemMessage,
    addBotWarning,
  }
}

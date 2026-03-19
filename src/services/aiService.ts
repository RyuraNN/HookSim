import { useApiStore } from '@/stores/apiStore'
import type { WikiTopic } from '@/data/wikiIndex'

export interface GeneratedQuestion {
  content: string
  messages: string[]
  topicId: string
}

export interface EvaluationResult {
  isCorrect: boolean
  needsMoreInfo: boolean
  score: number
  feedback: string
  correctParts: string[]
  incorrectParts: string[]
  missedPoints: string[]
  detailedReason: string
}

export interface StreamCallbacks {
  onChunk: (chunk: string) => void
  onComplete: (fullContent: string) => void
  onError: (error: Error) => void
}

const QUESTION_GENERATION_PROMPT = `你是一个模拟Discord社区新手答疑频道的AI。你需要扮演多个不同的新手用户，根据给定的Wiki知识库内容，生成极其真实自然的提问。

核心要求：模拟真实Discord答疑区的混乱场景，多个用户同时在频道里提问，有的人一条消息说完，有的人分好几条消息才把问题说清楚。

每个用户的提问用 [Q] 开始 [/Q] 结束，关联topicId用 [TOPIC:topicId]。
关键：一个用户可以发多条消息！用 [MSG] 分隔同一用户的不同消息。

示例格式：
[Q]
[MSG]救命 酒馆打不开了
[MSG]刚才还好好的突然就进不去了
[MSG]后台也没报错啊
[/Q]
[TOPIC:some-topic-id]

[Q]
[MSG]大佬们问一下 为什么我连gemini一直报错啊 试了好几次了
[/Q]
[TOPIC:another-topic-id]

模拟风格要求（非常重要，每种风格都要出现一些）：
1. 极简型：就一两句话甚至几个字，信息严重不足（"酒馆报错了" "api连不上" "求助"）
2. 焦急型：语气急切，可能发好几条消息，带感叹号（"急！！" "在线等" "救命啊"）
3. 啰嗦型：说了一大堆但关键信息反而没给（把自己做了什么都说了一遍但就是不说报错内容）
4. 小白型：用词不准确，把概念搞混（把"预设"说成"设置"，把"插头"说成"那个连接的东西"）
5. 半懂型：有一定基础但遇到了具体问题，能给出较多信息
6. 拍屏党：提到自己拍了屏幕照片（"我拍了个照片你看看" 虽然实际没图）
7. 复读型：之前问过没人理，又来问一遍（"之前问过没人回我再问一次"）
8. 自作聪明型：自己猜了个原因来问是不是（"是不是谷歌又炸了？"）

【重要】第三方贩子API用户的特征（约15%的用户是这类，他们的问题要体现以下特点）：
- 模型降智/胡言乱语：抱怨AI回复很傻、不理解问题、答非所问、重复说话、忘记上下文
- 输出慢/卡顿：抱怨生成速度很慢、经常卡住、要等很久
- 频繁报错：429太多请求、503服务不可用、连接超时、SSL错误
- 模型不对：明明选的是Claude/GPT但回复感觉像是垃圾模型、智商下降
- 可疑来源：可能提到"淘宝买的""闲鱼上的""某个群里的""便宜的中转"等
- 不稳定：一会儿能用一会儿不能用、白天好晚上差、高峰期就炸

示例第三方用户问题：
- "为什么我的克最近变傻了 说话颠三倒四的"
- "我这个API怎么这么慢啊 一句话要等半分钟"
- "刚买的key 用了两天就一直429"
- "感觉模型被换了 之前挺聪明的现在跟智障一样"
- "我用的那个中转站最近老是报错 是不是跑路了"

额外细节：
- 有些人会用缩写或黑话（ST=酒馆，哈基米=Gemini，克=Claude，DS/小鲸鱼=DeepSeek，3p=3pro）
- 有些人会先发一句"有人在吗"或"问个问题"然后才说正题
- 偶尔有人会在提问里夹带无关信息（"刚下课回来发现酒馆报错了"）
- 有些人会@钩子或@答疑志愿者（用文字模拟如"@类脑自研答疑AI"）
- 分多条消息的人，后面的消息可能是补充截图说明、补充报错信息、或者自己又试了什么

生成{QUESTION_COUNT}个不同用户的提问，难度要有层次。

Wiki知识库内容：
{WIKI_CONTENT}

请生成问题：`

const COMMUNITY_CONTEXT = `以下是类脑社区的重要背景知识，用于辅助评估：

【社区与规则】
- 类脑OΔYΣΣEIA是DC上最大的AI相关简中社群，非盈利开源共享社区
- "类脑自研答疑AI"（钩子）不是真AI，是真人志愿者身份组，禁止随便at
- 新人验证后获得缓冲区(8天)，通过基础道馆获高级缓冲区(3天)，缓冲结束获已验证
- 红线违规（商业化/开盒/恶意代码等）立即永封，不可申诉
- 第三方违规API第一次重新答题，第二次禁言+警告，第三次永封
- 合规渠道：官方API、硅基流动、OpenRouter等有资质中转、社区公益站
- 违规渠道：淘宝闲鱼买的贩子API、假公益站、半公益站

【贩子API危害】
- 掺水：用差模型冒充旗舰模型（如用Flash冒充Pro）
- 不稳定：随时跑路无法退款
- 偷资源：截留用户预设、角色卡、聊天记录甚至倒卖
- 假公益站可能窃取用户凭证给商业站补充额度

【酒馆技术细节】
- 推荐版本1.13.4或1.14.0，不要1.13.5(bug多)，不要用Launcher
- NodeJS用v22 LTS不要最新版
- git和酒馆流量默认不走系统代理，需开TUN模式或手动配置代理
- config.yaml必须设置hostWhitelist的enabled为true
- 安卓从F-Droid或GitHub下Termux，不要Google Play，必须挂小窗保活
- 酒馆路径不能有中文，不能在C盘受保护目录

【API渠道】
- Gemini推荐CLI渠道（额度高审核低），AIS额度极少不推荐
- CLI用JSON凭证不是API Key，通过GG公益站或本地gcli2api获取
- Claude目前没好的免费渠道，官网反代需海外卡风险大，Kiro温度低不适合RP
- DS的chat不开思维链，reasoner开，都是V3.2

【预设与世界书】
- 上下文长度是酒馆内部限制，最大回复长度是API参数和实际回复长度无关
- 反截断实际是反空回用的
- 世界书蓝灯一直触发，绿灯关键词触发（英文逗号分隔）
- 大世界观放角色定义前，小世界观放角色定义后，D0放强效指令，D1-D4不放东西
- 深度从聊天最底部往上数，D0最强，D999到最上方
- 正则仅格式显示只改显示，仅格式提示词只改提示词，都不勾会直接改文件不可逆
- 酒馆助手和小白X渲染器同时只能开一个
- 写卡推荐JSON/YAML/TOON格式，不推荐Markdown
- 总结步骤：hide/unhide分批，总结放蓝灯D999，最后6-10楼保留全文`

const EVALUATION_PROMPT = `你是一个答疑质量评估AI。请评估志愿者的回答是否正确解决了用户的问题。

${COMMUNITY_CONTEXT}

原始问题：
{QUESTION}

相关Wiki知识：
{WIKI_CONTENT}

志愿者的回答：
{ANSWER}

请评估并返回JSON格式：
{
  "isCorrect": true/false,  // 回答是否基本正确
  "needsMoreInfo": true/false,  // 是否需要用户提供更多信息才能完全解决
  "score": 0-100,  // 回答质量分数
  "feedback": "简短评价",
  "correctParts": ["回答中正确的部分1", "正确的部分2"],  // 列出回答中正确的要点
  "incorrectParts": ["回答中错误的部分1"],  // 列出回答中错误或误导的内容
  "missedPoints": ["遗漏的重要信息1", "遗漏的重要信息2"],  // 列出应该提到但没提到的关键点
  "detailedReason": "详细的评分理由，解释为什么给这个分数，哪些地方做得好，哪些地方需要改进"
}

只返回JSON，不要其他内容。`

const BATCH_VOLUNTEER_ANSWER_PROMPT = `你是一个模拟Discord社区答疑志愿者的AI。类脑社区本质上是一个RP（角色扮演）爱好者社区，大家都是来玩AI角色扮演的，所以语气要轻松友好，不要用极客/技术宅的说话方式。

现在有多个用户在群里提问，你需要为每个问题生成一个志愿者的回答。每个回答应该有不同的风格和语气，模拟不同的志愿者。

可选风格（每个回答随机选一种）：
1. 温柔姐姐型：耐心解答，语气温和
2. 热心群友型：积极帮忙，偶尔带点emoji
3. 老玩家型：见多识广但不傲慢
4. 随意闲聊型：回答的同时聊几句
5. 简洁型：直接给答案但语气友好
6. 追问型：先确认情况再回答

重要：
- 这是RP社区，语气要轻松自然，像朋友聊天
- 不要用"您"，用"你"
- 可以用缩写（ST、G、3p等）和表情
- 回答1-3句话就够了，不要太长

{QUESTIONS}

输出格式（严格遵守）：
[ANS:问题ID]
回答内容
[/ANS]

每个问题一个[ANS]块，问题ID必须与输入一致。`

const FOLLOWUP_PROMPT = `你是一个模拟Discord社区用户的AI。根据志愿者的回答，生成用户的后续反应。

原始问题：{QUESTION}
志愿者回答：{ANSWER}
评估结果：{EVALUATION}

根据评估结果生成用户反应：
- 如果问题完全解决了(isCorrect=true且score>=80)：表示感谢，语气自然（"谢谢大佬！"、"懂了懂了"、"好的我试试看"、"感谢！搞定了"等）
- 如果部分解决但还有疑问(score在50-80之间)：表示部分理解但追问细节（"这个我懂了，但是xxx怎么办？"、"试了一下，但是还有个问题..."）
- 如果问题没解决(isCorrect=false或score<50)：表示问题还在，继续求助。使用类似这样的表达：
  - "还是有问题啊大佬，现在的报错变成了xxx"
  - "试了但是不行，现在报错还是xxx"
  - "嗯...按你说的做了但是没用，还是一样的问题"
  - "大佬救命，还是不行啊，现在显示xxx"
- 如果需要更多信息(needsMoreInfo=true)：提供更多细节或补充信息

语气要自然、口语化，像真实的Discord用户。可以适当使用表情符号。

只输出用户的回复内容，不要其他说明。`

export async function generateQuestions(
  topics: WikiTopic[],
  callbacks: StreamCallbacks,
  questionCount?: number
): Promise<void> {
  const wikiContent = topics
    .map((t) => `[TOPIC:${t.id}]\n标题：${t.title}\n内容：${t.content}`)
    .join('\n\n---\n\n')

  const count = questionCount ?? topics.length
  const prompt = QUESTION_GENERATION_PROMPT
    .replace('{WIKI_CONTENT}', wikiContent)
    .replace('{QUESTION_COUNT}', String(count))

  try {
    await streamChat(
      [{ role: 'user', content: prompt }],
      callbacks
    )
  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error(String(error)))
  }
}

export async function evaluateAnswer(
  question: string,
  answer: string,
  wikiContent: string
): Promise<EvaluationResult> {
  const prompt = EVALUATION_PROMPT
    .replace('{QUESTION}', question)
    .replace('{WIKI_CONTENT}', wikiContent)
    .replace('{ANSWER}', answer)

  try {
    const response = await chatCompletion([{ role: 'user', content: prompt }])
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return {
      isCorrect: false,
      needsMoreInfo: true,
      score: 50,
      feedback: '无法解析评估结果',
      correctParts: [],
      incorrectParts: [],
      missedPoints: [],
      detailedReason: '评估结果解析失败',
    }
  } catch (error) {
    console.error('Evaluation error:', error)
    return {
      isCorrect: false,
      needsMoreInfo: true,
      score: 0,
      feedback: '评估过程出错',
      correctParts: [],
      incorrectParts: [],
      missedPoints: [],
      detailedReason: '评估过程发生错误',
    }
  }
}

export interface BatchQuestion {
  id: string
  question: string
  wikiContent: string
}

export async function generateBatchVolunteerAnswers(
  questions: BatchQuestion[]
): Promise<Map<string, string[]>> {
  if (questions.length === 0) return new Map()
  
  // 构建问题列表
  const questionsText = questions.map((q, i) => 
    `问题${i + 1} [ID:${q.id}]\n用户问：${q.question}\n参考知识：${q.wikiContent.slice(0, 500)}`
  ).join('\n\n')
  
  const prompt = BATCH_VOLUNTEER_ANSWER_PROMPT.replace('{QUESTIONS}', questionsText)

  try {
    const response = await chatCompletion([{ role: 'user', content: prompt }])
    const results = new Map<string, string[]>()
    
    // 解析 [ANS:id]...[/ANS] 块
    const ansRegex = /\[ANS:([^\]]+)\]([\s\S]*?)\[\/ANS\]/g
    let match
    while ((match = ansRegex.exec(response)) !== null) {
      const id = match[1].trim()
      const content = match[2].trim()
      results.set(id, [content])
    }
    
    // 如果解析失败，为每个问题返回默认回答
    if (results.size === 0) {
      questions.forEach(q => results.set(q.id, ['这个问题我也不太清楚，看看置顶吧']))
    }
    
    return results
  } catch (error) {
    console.error('Batch volunteer answer generation error:', error)
    const results = new Map<string, string[]>()
    questions.forEach(q => results.set(q.id, ['看一下道馆教程吧，里面有写']))
    return results
  }
}

export async function generateVolunteerAnswer(
  question: string,
  wikiContent: string
): Promise<string[]> {
  // 单个问题直接用批量接口
  const results = await generateBatchVolunteerAnswers([
    { id: 'single', question, wikiContent }
  ])
  return results.get('single') || ['看一下道馆教程吧，里面有写']
}

export async function generateFollowup(
  question: string,
  answer: string,
  evaluation: EvaluationResult
): Promise<string> {
  const prompt = FOLLOWUP_PROMPT
    .replace('{QUESTION}', question)
    .replace('{ANSWER}', answer)
    .replace('{EVALUATION}', JSON.stringify(evaluation))

  try {
    return await chatCompletion([{ role: 'user', content: prompt }])
  } catch (error) {
    console.error('Followup generation error:', error)
    return evaluation.isCorrect ? '好的，谢谢！' : '嗯...我再看看'
  }
}

export function parseGeneratedQuestions(content: string): GeneratedQuestion[] {
  const questions: GeneratedQuestion[] = []
  const regex = /\[Q\]([\s\S]*?)\[\/Q\][\s\S]*?\[TOPIC:([^\]]+)\]/g
  
  let match
  while ((match = regex.exec(content)) !== null) {
    const rawContent = match[1].trim()
    const topicId = match[2].trim()
    
    // Parse [MSG] blocks if present, strip [/MSG] tags
    const cleanContent = rawContent.replace(/\[\/MSG\]/g, '')
    const msgParts = cleanContent.split(/\[MSG\]/).filter(s => s.trim())
    const messages = msgParts.length > 0 ? msgParts.map(s => s.trim()) : [cleanContent.trim()]
    
    questions.push({
      content: messages.join('\n'),
      messages,
      topicId,
    })
  }
  
  return questions
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

async function streamChat(
  messages: ChatMessage[],
  callbacks: StreamCallbacks
): Promise<void> {
  const apiStore = useApiStore()
  const url = apiStore.baseUrl.replace(/\/$/, '') + '/chat/completions'

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiStore.apiKey}`,
    },
    body: JSON.stringify({
      model: apiStore.selectedModel,
      messages,
      stream: true,
    }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('No response body')
  }

  const decoder = new TextDecoder()
  let fullContent = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content
            if (content) {
              fullContent += content
              callbacks.onChunk(content)
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }

    callbacks.onComplete(fullContent)
  } finally {
    reader.releaseLock()
  }
}

async function chatCompletion(messages: ChatMessage[], maxRetries = 3): Promise<string> {
  const apiStore = useApiStore()
  const url = apiStore.baseUrl.replace(/\/$/, '') + '/chat/completions'

  let lastError: Error | null = null
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiStore.apiKey}`,
        },
        body: JSON.stringify({
          model: apiStore.selectedModel,
          messages,
          stream: false,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices?.[0]?.message?.content || ''
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(`API call failed (attempt ${attempt + 1}/${maxRetries}):`, lastError.message)
      
      if (attempt < maxRetries - 1) {
        // 等待后重试，指数退避
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)))
      }
    }
  }
  
  throw lastError || new Error('API call failed after retries')
}

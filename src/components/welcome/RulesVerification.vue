<script setup lang="ts">
import { ref, computed } from 'vue'
import { serverInfo, communityRules } from '@/mock'
import { useUIStore, useApiStore } from '@/stores'
import { currentUser } from '@/mock/users'

const uiStore = useUIStore()
const apiStore = useApiStore()

const currentStep = ref<'rules' | 'api' | 'profile'>('rules')

const playerName = ref(currentUser.displayName)
const playerAvatarSeed = ref('player1')
const customAvatarUrl = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const avatarSeeds = [
  'player1', 'gamer', 'helper', 'newbie', 'expert', 
  'coder', 'artist', 'music', 'night', 'sunny',
  'ocean', 'forest', 'fire', 'ice', 'thunder'
]

const playerAvatarUrl = computed(() => {
  if (customAvatarUrl.value) {
    return customAvatarUrl.value
  }
  return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${playerAvatarSeed.value}`
})

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }
  
  if (file.size > 2 * 1024 * 1024) {
    alert('图片大小不能超过2MB')
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    customAvatarUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function clearCustomAvatar() {
  customAvatarUrl.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

const canStartGame = computed(() => {
  return apiStore.baseUrl && apiStore.apiKey && apiStore.selectedModel
})

function handleRulesAccepted() {
  currentStep.value = 'profile'
}

function handleProfileComplete() {
  Object.assign(currentUser, {
    displayName: playerName.value || '志愿者',
    avatarUrl: playerAvatarUrl.value,
  })
  currentStep.value = 'api'
}

function handleComplete() {
  if (canStartGame.value) {
    uiStore.startGame()
  }
}

async function handleFetchModels() {
  await apiStore.fetchModels()
}
</script>

<template>
  <div class="fixed inset-0 bg-[#313338] flex items-center justify-center p-4">
    <div class="w-full max-w-[520px] bg-[#2b2d31] rounded-lg shadow-2xl flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="p-6 pb-4 text-center border-b border-[#3f4147]">
        <img
          :src="serverInfo.iconUrl"
          :alt="serverInfo.name"
          class="w-20 h-20 rounded-full mx-auto mb-4"
        />
        <h1 class="text-xl font-bold text-white mb-1">
          欢迎来到 {{ serverInfo.name }}
        </h1>
        <p class="text-sm text-[#b5bac1]">
          {{ currentStep === 'rules' ? '在继续之前，请阅读并同意以下规则' : currentStep === 'profile' ? '自定义你的身份（可选）' : '配置AI API以开始游戏' }}
        </p>
        <!-- Step indicator -->
        <div class="flex justify-center gap-2 mt-3">
          <div
            class="w-2 h-2 rounded-full transition-colors"
            :class="currentStep === 'rules' ? 'bg-[#5865f2]' : 'bg-[#4e5058]'"
          />
          <div
            class="w-2 h-2 rounded-full transition-colors"
            :class="currentStep === 'profile' ? 'bg-[#5865f2]' : 'bg-[#4e5058]'"
          />
          <div
            class="w-2 h-2 rounded-full transition-colors"
            :class="currentStep === 'api' ? 'bg-[#5865f2]' : 'bg-[#4e5058]'"
          />
        </div>
      </div>

      <!-- Step 1: Rules Content -->
      <template v-if="currentStep === 'rules'">
        <div class="flex-1 overflow-y-auto p-6 thin-scrollbar">
          <div
            v-for="(section, index) in communityRules"
            :key="index"
            class="mb-6 last:mb-0"
          >
            <h2 class="text-base font-semibold text-white mb-3">
              {{ section.title }}
            </h2>
            <ul v-if="section.content.length > 0" class="space-y-2">
              <li
                v-for="(item, itemIndex) in section.content"
                :key="itemIndex"
                class="text-sm text-[#dbdee1] leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-[#5865f2]"
              >
                {{ item }}
              </li>
            </ul>

            <!-- Subsections -->
            <div
              v-if="section.subsections"
              class="mt-4 space-y-4"
            >
              <div
                v-for="(sub, subIndex) in section.subsections"
                :key="subIndex"
                class="pl-4 border-l-2 border-[#3f4147]"
              >
                <h3 class="text-sm font-medium text-[#f2f3f5] mb-2">
                  {{ sub.title }}
                </h3>
                <ul class="space-y-1.5">
                  <li
                    v-for="(subItem, subItemIndex) in sub.content"
                    :key="subItemIndex"
                    class="text-xs text-[#b5bac1] leading-relaxed pl-3 relative before:content-['–'] before:absolute before:left-0 before:text-[#4e5058]"
                  >
                    {{ subItem }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer with Button -->
        <div class="p-4 border-t border-[#3f4147]">
          <button
            class="w-full py-3 px-4 bg-[#248046] hover:bg-[#1a6334] text-white font-medium rounded transition-colors duration-200"
            @click="handleRulesAccepted"
          >
            我已阅读并同意以上规则
          </button>
        </div>
      </template>

      <!-- Step 2: Profile Customization -->
      <template v-else-if="currentStep === 'profile'">
        <div class="flex-1 overflow-y-auto p-6 thin-scrollbar">
          <!-- Avatar Preview -->
          <div class="flex flex-col items-center mb-6">
            <img
              :src="playerAvatarUrl"
              alt="Your avatar"
              class="w-24 h-24 rounded-full mb-4 bg-[#1e1f22] object-cover"
            />
            <div class="flex gap-2">
              <button
                class="text-xs px-3 py-1.5 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded transition-colors"
                @click="triggerFileInput"
              >
                上传头像
              </button>
              <button
                v-if="customAvatarUrl"
                class="text-xs px-3 py-1.5 bg-[#4f545c] hover:bg-[#5d6269] text-white rounded transition-colors"
                @click="clearCustomAvatar"
              >
                清除
              </button>
            </div>
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleFileSelect"
            />
            <p class="text-xs text-[#6d6f78] mt-2">或选择一个预设头像</p>
          </div>

          <!-- Avatar Selection -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-[#b5bac1] mb-3">
              预设头像
            </label>
            <div class="grid grid-cols-5 gap-2">
              <button
                v-for="seed in avatarSeeds"
                :key="seed"
                class="w-12 h-12 rounded-lg overflow-hidden border-2 transition-all hover:scale-105"
                :class="playerAvatarSeed === seed && !customAvatarUrl ? 'border-[#5865f2]' : 'border-transparent'"
                @click="customAvatarUrl = ''; playerAvatarSeed = seed"
              >
                <img
                  :src="`https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}`"
                  :alt="seed"
                  class="w-full h-full bg-[#1e1f22]"
                />
              </button>
            </div>
          </div>

          <!-- Display Name -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-[#b5bac1] mb-2">
              显示名称
            </label>
            <input
              v-model="playerName"
              type="text"
              placeholder="志愿者"
              maxlength="20"
              class="w-full px-3 py-2.5 bg-[#1e1f22] border border-[#3f4147] rounded text-sm text-white placeholder-[#6d6f78] focus:outline-none focus:border-[#5865f2] transition-colors"
            />
            <p class="mt-1.5 text-xs text-[#6d6f78]">
              这是其他用户看到的你的名字
            </p>
          </div>
        </div>

        <!-- Footer with Buttons -->
        <div class="p-4 border-t border-[#3f4147] flex gap-3">
          <button
            class="flex-1 py-3 px-4 bg-[#4f545c] hover:bg-[#5d6269] text-white font-medium rounded transition-colors duration-200"
            @click="currentStep = 'rules'"
          >
            返回
          </button>
          <button
            class="flex-1 py-3 px-4 bg-[#248046] hover:bg-[#1a6334] text-white font-medium rounded transition-colors duration-200"
            @click="handleProfileComplete"
          >
            继续
          </button>
        </div>
      </template>

      <!-- Step 3: API Configuration -->
      <template v-else>
        <div class="flex-1 overflow-y-auto p-6 thin-scrollbar">
          <!-- Tip -->
          <div class="mb-6 p-3 bg-[#2f3136] rounded-lg border border-[#5865f2]/30">
            <p class="text-xs text-[#b5bac1] leading-relaxed">
              <span class="text-[#5865f2] font-medium">💡 提示：</span>
              钩子模拟器调用AI的次数可能相对较多，推荐使用 <span class="text-white font-medium">Gemini 3.0 Flash</span> 等低成本模型。
            </p>
          </div>

          <!-- API Base URL -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-[#b5bac1] mb-2">
              API 地址
            </label>
            <input
              v-model="apiStore.baseUrl"
              type="text"
              placeholder="https://api.openai.com/v1"
              class="w-full px-3 py-2.5 bg-[#1e1f22] border border-[#3f4147] rounded text-sm text-white placeholder-[#6d6f78] focus:outline-none focus:border-[#5865f2] transition-colors"
            />
            <p class="mt-1.5 text-xs text-[#6d6f78]">
              支持 OpenAI 兼容格式的 API 地址
            </p>
          </div>

          <!-- API Key -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-[#b5bac1] mb-2">
              API 密钥
            </label>
            <input
              v-model="apiStore.apiKey"
              type="password"
              placeholder="sk-..."
              class="w-full px-3 py-2.5 bg-[#1e1f22] border border-[#3f4147] rounded text-sm text-white placeholder-[#6d6f78] focus:outline-none focus:border-[#5865f2] transition-colors"
            />
          </div>

          <!-- Fetch Models Button -->
          <div class="mb-4">
            <button
              class="w-full py-2.5 px-4 bg-[#4f545c] hover:bg-[#5d6269] text-white text-sm font-medium rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              :disabled="!apiStore.baseUrl || !apiStore.apiKey || apiStore.isLoadingModels"
              @click="handleFetchModels"
            >
              <svg
                v-if="apiStore.isLoadingModels"
                class="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {{ apiStore.isLoadingModels ? '获取中...' : '拉取模型列表' }}
            </button>
            <p v-if="apiStore.modelError" class="mt-1.5 text-xs text-[#ed4245]">
              {{ apiStore.modelError }}
            </p>
          </div>

          <!-- Model Selection -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-[#b5bac1] mb-2">
              选择模型
            </label>
            <select
              v-model="apiStore.selectedModel"
              class="w-full px-3 py-2.5 bg-[#1e1f22] border border-[#3f4147] rounded text-sm text-white focus:outline-none focus:border-[#5865f2] transition-colors disabled:opacity-50"
              :disabled="apiStore.availableModels.length === 0"
            >
              <option value="" disabled>
                {{ apiStore.availableModels.length === 0 ? '请先拉取模型列表' : '选择一个模型' }}
              </option>
              <option
                v-for="model in apiStore.availableModels"
                :key="model.id"
                :value="model.id"
              >
                {{ model.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Footer with Buttons -->
        <div class="p-4 border-t border-[#3f4147] flex gap-3">
          <button
            class="flex-1 py-3 px-4 bg-[#4f545c] hover:bg-[#5d6269] text-white font-medium rounded transition-colors duration-200"
            @click="currentStep = 'profile'"
          >
            返回
          </button>
          <button
            class="flex-1 py-3 px-4 bg-[#248046] hover:bg-[#1a6334] text-white font-medium rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!canStartGame"
            @click="handleComplete"
          >
            开始游戏
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

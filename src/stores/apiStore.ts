import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface ApiConfig {
  baseUrl: string
  apiKey: string
  selectedModel: string
}

export interface ModelInfo {
  id: string
  name: string
}

export const useApiStore = defineStore('api', () => {
  const baseUrl = ref('')
  const apiKey = ref('')
  const selectedModel = ref('')
  const availableModels = ref<ModelInfo[]>([])
  const isLoadingModels = ref(false)
  const modelError = ref<string | null>(null)

  const isConfigured = computed(() => baseUrl.value && apiKey.value && selectedModel.value)

  async function fetchModels() {
    if (!baseUrl.value || !apiKey.value) {
      modelError.value = '请先填写API地址和密钥'
      return
    }

    isLoadingModels.value = true
    modelError.value = null
    availableModels.value = []

    try {
      const url = baseUrl.value.replace(/\/$/, '') + '/models'
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey.value}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.data && Array.isArray(data.data)) {
        availableModels.value = data.data.map((model: { id: string }) => ({
          id: model.id,
          name: model.id,
        }))
      } else if (Array.isArray(data)) {
        availableModels.value = data.map((model: { id: string } | string) => ({
          id: typeof model === 'string' ? model : model.id,
          name: typeof model === 'string' ? model : model.id,
        }))
      }

      if (availableModels.value.length === 0) {
        modelError.value = '未找到可用模型'
      }
    } catch (error) {
      modelError.value = error instanceof Error ? error.message : '获取模型列表失败'
    } finally {
      isLoadingModels.value = false
    }
  }

  function setConfig(config: Partial<ApiConfig>) {
    if (config.baseUrl !== undefined) baseUrl.value = config.baseUrl
    if (config.apiKey !== undefined) apiKey.value = config.apiKey
    if (config.selectedModel !== undefined) selectedModel.value = config.selectedModel
  }

  return {
    baseUrl,
    apiKey,
    selectedModel,
    availableModels,
    isLoadingModels,
    modelError,
    isConfigured,
    fetchModels,
    setConfig,
  }
})

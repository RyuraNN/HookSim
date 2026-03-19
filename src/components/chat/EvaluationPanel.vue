<script setup lang="ts">
import { ref, computed } from 'vue'
import type { EvaluationResult } from '@/services/aiService'

export interface QuestionEvaluation {
  questionId: string
  questionContent: string
  playerAnswer: string
  evaluation: EvaluationResult
  timestamp: Date
}

const props = defineProps<{
  evaluations: QuestionEvaluation[]
}>()

const isOpen = ref(false)

const overallStats = computed(() => {
  if (props.evaluations.length === 0) {
    return { avgScore: 0, correctRate: 0, total: 0 }
  }
  
  const total = props.evaluations.length
  const totalScore = props.evaluations.reduce((sum, e) => sum + e.evaluation.score, 0)
  const correctCount = props.evaluations.filter(e => e.evaluation.isCorrect).length
  
  return {
    avgScore: Math.round(totalScore / total),
    correctRate: Math.round((correctCount / total) * 100),
    total,
  }
})

const selectedEvaluation = ref<QuestionEvaluation | null>(null)

function togglePanel() {
  isOpen.value = !isOpen.value
  if (!isOpen.value) {
    selectedEvaluation.value = null
  }
}

function selectEvaluation(evaluation: QuestionEvaluation) {
  selectedEvaluation.value = evaluation
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-400'
  if (score >= 60) return 'text-yellow-400'
  if (score >= 40) return 'text-orange-400'
  return 'text-red-400'
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-500/20'
  if (score >= 60) return 'bg-yellow-500/20'
  if (score >= 40) return 'bg-orange-500/20'
  return 'bg-red-500/20'
}
</script>

<template>
  <!-- Toggle Button -->
  <button
    v-if="evaluations.length > 0"
    class="fixed bottom-24 right-4 w-10 h-10 rounded-full bg-dc-brand hover:bg-dc-brand-hover shadow-lg flex items-center justify-center text-white z-50 transition-all"
    :class="{ 'ring-2 ring-white/30': isOpen }"
    title="查看评估详情"
    @click="togglePanel"
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
      {{ evaluations.length }}
    </span>
  </button>

  <!-- Panel -->
  <Teleport to="body">
    <Transition name="slide">
      <div
        v-if="isOpen"
        class="fixed right-0 top-0 h-full w-[400px] bg-dc-bg-secondary border-l border-dc-border shadow-2xl z-50 flex flex-col"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-dc-border">
          <h2 class="text-lg font-semibold text-dc-text-normal">评估详情</h2>
          <button
            class="w-8 h-8 flex items-center justify-center text-dc-text-muted hover:text-dc-text-normal rounded hover:bg-dc-bg-modifier-hover"
            @click="togglePanel"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"/>
            </svg>
          </button>
        </div>

        <!-- Overall Stats -->
        <div class="px-4 py-3 bg-dc-bg-tertiary border-b border-dc-border">
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold" :class="getScoreColor(overallStats.avgScore)">
                {{ overallStats.avgScore }}
              </div>
              <div class="text-xs text-dc-text-muted">平均分</div>
            </div>
            <div>
              <div class="text-2xl font-bold" :class="overallStats.correctRate >= 60 ? 'text-green-400' : 'text-red-400'">
                {{ overallStats.correctRate }}%
              </div>
              <div class="text-xs text-dc-text-muted">正确率</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-dc-text-normal">
                {{ overallStats.total }}
              </div>
              <div class="text-xs text-dc-text-muted">已评估</div>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-hidden flex">
          <!-- Question List -->
          <div class="w-1/2 border-r border-dc-border overflow-y-auto">
            <div
              v-for="(item, index) in evaluations"
              :key="item.questionId"
              class="px-3 py-2 border-b border-dc-border cursor-pointer hover:bg-dc-bg-modifier-hover transition-colors"
              :class="{ 'bg-dc-bg-modifier-selected': selectedEvaluation?.questionId === item.questionId }"
              @click="selectEvaluation(item)"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-dc-text-muted">#{{ index + 1 }}</span>
                <span
                  class="text-xs font-medium px-1.5 py-0.5 rounded"
                  :class="[getScoreColor(item.evaluation.score), getScoreBgColor(item.evaluation.score)]"
                >
                  {{ item.evaluation.score }}分
                </span>
              </div>
              <div class="text-sm text-dc-text-normal line-clamp-2">
                {{ item.questionContent }}
              </div>
            </div>
          </div>

          <!-- Detail View -->
          <div class="w-1/2 overflow-y-auto p-3">
            <template v-if="selectedEvaluation">
              <!-- Score -->
              <div class="text-center mb-4">
                <div
                  class="inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold"
                  :class="[getScoreColor(selectedEvaluation.evaluation.score), getScoreBgColor(selectedEvaluation.evaluation.score)]"
                >
                  {{ selectedEvaluation.evaluation.score }}
                </div>
              </div>

              <!-- Question -->
              <div class="mb-3">
                <div class="text-xs text-dc-text-muted mb-1">问题</div>
                <div class="text-sm text-dc-text-normal bg-dc-bg-tertiary rounded p-2">
                  {{ selectedEvaluation.questionContent }}
                </div>
              </div>

              <!-- Your Answer -->
              <div class="mb-3">
                <div class="text-xs text-dc-text-muted mb-1">你的回答</div>
                <div class="text-sm text-dc-text-normal bg-dc-bg-tertiary rounded p-2">
                  {{ selectedEvaluation.playerAnswer }}
                </div>
              </div>

              <!-- Correct Parts -->
              <div v-if="selectedEvaluation.evaluation.correctParts?.length" class="mb-3">
                <div class="text-xs text-green-400 mb-1">✓ 正确的部分</div>
                <ul class="text-sm text-dc-text-normal space-y-1">
                  <li
                    v-for="(part, i) in selectedEvaluation.evaluation.correctParts"
                    :key="i"
                    class="flex items-start gap-1"
                  >
                    <span class="text-green-400 shrink-0">•</span>
                    <span>{{ part }}</span>
                  </li>
                </ul>
              </div>

              <!-- Incorrect Parts -->
              <div v-if="selectedEvaluation.evaluation.incorrectParts?.length" class="mb-3">
                <div class="text-xs text-red-400 mb-1">✗ 错误的部分</div>
                <ul class="text-sm text-dc-text-normal space-y-1">
                  <li
                    v-for="(part, i) in selectedEvaluation.evaluation.incorrectParts"
                    :key="i"
                    class="flex items-start gap-1"
                  >
                    <span class="text-red-400 shrink-0">•</span>
                    <span>{{ part }}</span>
                  </li>
                </ul>
              </div>

              <!-- Missed Points -->
              <div v-if="selectedEvaluation.evaluation.missedPoints?.length" class="mb-3">
                <div class="text-xs text-yellow-400 mb-1">⚠ 遗漏的要点</div>
                <ul class="text-sm text-dc-text-normal space-y-1">
                  <li
                    v-for="(part, i) in selectedEvaluation.evaluation.missedPoints"
                    :key="i"
                    class="flex items-start gap-1"
                  >
                    <span class="text-yellow-400 shrink-0">•</span>
                    <span>{{ part }}</span>
                  </li>
                </ul>
              </div>

              <!-- Detailed Reason -->
              <div v-if="selectedEvaluation.evaluation.detailedReason" class="mb-3">
                <div class="text-xs text-dc-text-muted mb-1">评分理由</div>
                <div class="text-sm text-dc-text-normal bg-dc-bg-tertiary rounded p-2">
                  {{ selectedEvaluation.evaluation.detailedReason }}
                </div>
              </div>
            </template>
            <template v-else>
              <div class="h-full flex items-center justify-center text-dc-text-muted text-sm">
                选择一个问题查看详情
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

// 兼容旧代码的别名 - 实际数据在 questionBank.ts 中
import { questionCategories, questionTopics, type QuestionTopic, type QuestionCategory } from './questionBank'

export type WikiTopic = QuestionTopic
export type WikiCategory = QuestionCategory
export const wikiCategories = questionCategories
export const wikiTopics = questionTopics

export { questionCategories, questionTopics, type QuestionTopic, type QuestionCategory }

export interface Server {
  readonly id: string
  readonly name: string
  readonly iconUrl: string | null
  readonly hasUnread: boolean
  readonly mentionCount: number
}

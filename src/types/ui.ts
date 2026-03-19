export type ViewPanel = 'servers' | 'channels' | 'chat'

export interface UIState {
  readonly mobileActivePanel: ViewPanel
  readonly isChannelListVisible: boolean
}

export type GameModeId = 'laabtna' | 'letter-cell' | 'hidden-player'

export interface GameMode {
  id: GameModeId
  name: string
  sectionLabel: string
  description: string
  icon: string
  image?: string
  available: boolean
  setupPath?: string
  comingSoonLabel?: string
  highlights?: string[]
}

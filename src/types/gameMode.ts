export type GameModeId = 'laabtna' | 'letter-cell'

export interface GameMode {
  id: GameModeId
  name: string
  sectionLabel: string
  description: string
  icon: string
  available: boolean
  setupPath?: string
  comingSoonLabel?: string
  highlights?: string[]
}

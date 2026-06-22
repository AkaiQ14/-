import { BOARD_SIDES } from './boardLayout'
import type { BoardSide } from './boardLayout'
import type { GameModeId } from './gameMode'

export type LifelineId =
  | 'double-points'
  | 'double-answer'
  | 'the-pit'
  | 'call-friend'
  | 'roulette'
  | 'block'
  | 'search'

export interface Lifeline {
  id: LifelineId
  name: string
  description: string
  timing: 'before' | 'after'
  icon: string
  image?: string
}

export interface Category {
  id: string
  name: string
  icon: string
  image: string
  color: string
}

export type PointTier = 200 | 400 | 600

export interface Question {
  id: string
  categoryId: string
  text: string
  answer: string
  points: PointTier
}

export interface BoardCell {
  questionId: string
  answered: boolean
  answeredBy?: 'team1' | 'team2'
  wasCorrect?: boolean
}

export interface Team {
  name: string
  score: number
  lifelines: LifelineId[]
  usedLifelines: LifelineId[]
}

export interface ActiveLifelineState {
  id: LifelineId
  team: 'team1' | 'team2'
  doublePointsActive?: boolean
  callFriendSeconds?: number
  searchSeconds?: number
  pitActive?: boolean
  blockActive?: boolean
  rouletteBonus?: boolean
}

export interface GameState {
  id: string
  gameModeId?: GameModeId
  status: 'setup' | 'active' | 'finished'
  createdAt: number
  team1: Team
  team2: Team
  selectedCategoryIds: string[]
  board: Record<string, BoardCell>
  currentTurn: 'team1' | 'team2'
  activeQuestionId: string | null
  activeCellKey: string | null
  activeLifeline: ActiveLifelineState | null
  answeredCount: number
  team1Categories: string[]
  team2Categories: string[]
  lifelinesBlocked?: 'team1' | 'team2'
}

export interface SetupDraft {
  gameModeId: GameModeId
  team1Name: string
  team2Name: string
  team1Lifelines: LifelineId[]
  team2Lifelines: LifelineId[]
  team1Categories: string[]
  team2Categories: string[]
}

export const POINT_TIERS: PointTier[] = [200, 400, 600]

export const CATEGORIES_PER_GAME = 6

export const TOTAL_QUESTIONS = CATEGORIES_PER_GAME * POINT_TIERS.length * BOARD_SIDES.length

/** Fixed lifelines for every team — mandatory, no selection */
export const TEAM_LIFELINES: LifelineId[] = ['double-answer', 'the-pit', 'double-points']

export const LIFELINES: Lifeline[] = [
  {
    id: 'double-answer',
    name: 'إجابتين',
    description: 'محتار؟ عندك فرصتين بدال وحدة',
    timing: 'after',
    icon: '✌️',
  },
  {
    id: 'the-pit',
    name: 'الحفرة',
    description: 'جاوب صح وانقص نقاط خصمك',
    timing: 'before',
    icon: '🕳️',
    image: '/images/up-down.png',
  },
  {
    id: 'double-points',
    name: 'دبل نقاط',
    description: 'ضاعف نقاطك إذا جاوبت صح',
    timing: 'before',
    icon: '✖️',
    image: '/images/double.png',
  },
]

const LEGACY_LIFELINE_NAMES: Partial<Record<LifelineId, string>> = {
  'call-friend': 'اتصل بصديق',
  roulette: 'الروليت',
  block: 'بلوك',
  search: 'ابحث',
}

export function getLifeline(id: LifelineId): Lifeline {
  const found = LIFELINES.find((l) => l.id === id)
  if (found) return found
  return {
    id,
    name: LEGACY_LIFELINE_NAMES[id] ?? id,
    description: '',
    timing: 'before',
    icon: '❓',
  }
}

export function cellKey(categoryId: string, points: number, side: BoardSide): string {
  return `${categoryId}-${points}-${side}`
}

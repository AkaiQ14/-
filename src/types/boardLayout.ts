import type { PointTier } from './game'

export type BoardSide = 'left' | 'right'

export const BOARD_SIDES: BoardSide[] = ['left', 'right']

export const BOARD_POINT_TIERS: { tier: PointTier; label: 200 | 400 | 600 }[] = [
  { tier: 200, label: 200 },
  { tier: 400, label: 400 },
  { tier: 600, label: 600 },
]

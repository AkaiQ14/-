import type { AuctionPair, Footballer, Position } from '../types/hiddenPlayer'
import futggPool from './futggPlayers.json'

export const STARTING_BUDGET = 250
export const BUDGET_PRESETS = [150, 200, 250, 300, 400]
export const ROUND_TIMER_SEC = 10

export const COLOR_OPTIONS = [
  { id: 'blue', label: 'أزرق لعبتنا', hex: '#2B6BFF' },
  { id: 'orange', label: 'برتقالي لعبتنا', hex: '#FF7A1A' },
  { id: 'gold', label: 'ذهبي', hex: '#FFB800' },
  { id: 'navy', label: 'كحلي', hex: '#0B2D6E' },
  { id: 'coral', label: 'مرجاني', hex: '#FF9234' },
  { id: 'sky', label: 'سماوي', hex: '#4A85FF' },
]

/** مجموعات مراكز FUT.GG */
export const FUT_POSITION_GROUPS: Record<Position, string[]> = {
  GK: ['GK'],
  DEF: ['CB', 'LB', 'RB'],
  MID: ['CAM', 'CM', 'CDM', 'RM', 'LM'],
  ST: ['ST', 'CF', 'LW', 'RW'],
}

const POOL = futggPool as Record<Position, Footballer[]>

const ROUND_DEFS: { roundLabel: string; position: Position; slotKey: string }[] = [
  { roundLabel: 'حارس المرمى', position: 'GK', slotKey: 'gk' },
  { roundLabel: 'مدافع', position: 'DEF', slotKey: 'def' },
  { roundLabel: 'وسط #1', position: 'MID', slotKey: 'mid1' },
  { roundLabel: 'وسط #2', position: 'MID', slotKey: 'mid2' },
  { roundLabel: 'مهاجم', position: 'ST', slotKey: 'st' },
]

const RECENT_STORAGE_KEY = 'hidden-player-recent-card-ids'
const MAX_RECENT_IDS = 120

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function clonePlayer(p: Footballer): Footballer {
  return { ...p }
}

function readRecentIds(): Set<string> {
  try {
    const raw = sessionStorage.getItem(RECENT_STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    return new Set()
  }
}

function rememberRecentIds(ids: string[]): void {
  const merged = [...ids, ...readRecentIds()]
  const unique: string[] = []
  for (const id of merged) {
    if (!unique.includes(id)) unique.push(id)
    if (unique.length >= MAX_RECENT_IDS) break
  }
  try {
    sessionStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(unique))
  } catch {
    /* private mode / quota */
  }
}

function rankCandidates(
  group: Position,
  usedIds: Set<string>,
  usedNames: Set<string>,
  recentIds: Set<string>,
  ignoreNames = false,
  ignoreRecent = false,
): Footballer[] {
  const available = POOL[group].filter(p => {
    if (usedIds.has(p.id)) return false
    if (!ignoreNames && usedNames.has(p.name)) return false
    return true
  })
  const fresh = shuffle(available.filter(p => ignoreRecent || !recentIds.has(p.id)))
  const stale = shuffle(available.filter(p => !ignoreRecent && recentIds.has(p.id)))
  return [...fresh, ...stale]
}

function pickOne(
  group: Position,
  usedIds: Set<string>,
  usedNames: Set<string>,
  recentIds: Set<string>,
): Footballer {
  for (const [ignoreNames, ignoreRecent] of [
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ] as const) {
    const ranked = rankCandidates(group, usedIds, usedNames, recentIds, ignoreNames, ignoreRecent)
    if (ranked.length > 0) return clonePlayer(ranked[0])
  }
  const fallback = shuffle([...POOL[group]])
  if (fallback.length === 0) throw new Error(`لا توجد بطاقات كافية لمركز ${group}`)
  return clonePlayer(fallback[0])
}

function pickPair(
  group: Position,
  usedIds: Set<string>,
  usedNames: Set<string>,
  recentIds: Set<string>,
): [Footballer, Footballer] {
  const first = pickOne(group, usedIds, usedNames, recentIds)
  usedIds.add(first.id)
  usedNames.add(first.name)

  const second = pickOne(group, usedIds, usedNames, recentIds)
  usedIds.add(second.id)
  usedNames.add(second.name)

  return [first, second]
}

/** يختار 5 جولات عشوائية — يتجنب تكرار الأسماء في المزاد ويفضّل بطاقات لم تُستخدم مؤخراً */
export function pickAuctionRounds(): AuctionPair[] {
  const usedIds = new Set<string>()
  const usedNames = new Set<string>()
  const recentIds = readRecentIds()

  const rounds = ROUND_DEFS.map(def => {
    const [visible, hidden] = pickPair(def.position, usedIds, usedNames, recentIds)
    return {
      roundLabel: def.roundLabel,
      position: def.position,
      slotKey: def.slotKey,
      visible,
      hidden,
    }
  })

  rememberRecentIds(rounds.flatMap(r => [r.visible.id, r.hidden.id]))
  return rounds
}

export const SQUAD_TEMPLATE = [
  { key: 'gk', position: 'GK' as Position, label: 'GK' },
  { key: 'def', position: 'DEF' as Position, label: 'DEF' },
  { key: 'mid1', position: 'MID' as Position, label: 'MID' },
  { key: 'mid2', position: 'MID' as Position, label: 'MID' },
  { key: 'st', position: 'ST' as Position, label: 'ATT' },
]

export function poolSize(): Record<Position, number> {
  return {
    GK: POOL.GK.length,
    DEF: POOL.DEF.length,
    MID: POOL.MID.length,
    ST: POOL.ST.length,
  }
}

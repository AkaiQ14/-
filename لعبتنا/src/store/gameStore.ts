import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  ACTIVE_CATEGORIES,
  getQuestion,
  isCategoryEnabled,
  pickBoardQuestions,
  pickRandomCategories,
  shuffleArray,
} from '../data/gameData'
import type {
  GameState,
  LifelineId,
  SetupDraft,
  Team,
} from '../types/game'
import { cellKey, getLifeline, POINT_TIERS, TEAM_LIFELINES, TOTAL_QUESTIONS } from '../types/game'
import { BOARD_SIDES } from '../types/boardLayout'
import type { BoardSide } from '../types/boardLayout'

const STORAGE_KEY = 'laabtna-games'

function otherTeamFrom(team: 'team1' | 'team2'): 'team1' | 'team2' {
  return team === 'team1' ? 'team2' : 'team1'
}

function sanitizeDraftCategories(draft: SetupDraft): SetupDraft {
  const filterEnabled = (ids: string[]) => ids.filter(isCategoryEnabled)
  return {
    ...draft,
    team1Categories: filterEnabled(draft.team1Categories),
    team2Categories: filterEnabled(draft.team2Categories),
  }
}

function createEmptyTeam(name: string, lifelines: LifelineId[] = []): Team {
  return { name, score: 0, lifelines, usedLifelines: [] }
}

function buildBoard(categoryIds: string[]): GameState['board'] {
  const board: GameState['board'] = {}
  for (const catId of categoryIds) {
    for (const tier of shuffleArray([...POINT_TIERS])) {
      const picked = pickBoardQuestions(catId, tier, BOARD_SIDES.length)
      BOARD_SIDES.forEach((side, i) => {
        const tierQuestion = picked[i]
        if (tierQuestion) {
          const key = cellKey(catId, tier, side)
          board[key] = { questionId: tierQuestion.id, answered: false }
        }
      })
    }
  }
  return board
}

function createGameFromDraft(draft: SetupDraft): GameState {
  const allCategories = shuffleArray([
    ...draft.team1Categories,
    ...draft.team2Categories,
  ])
  const lifelines = [...TEAM_LIFELINES]
  return {
    id: crypto.randomUUID(),
    gameModeId: draft.gameModeId ?? 'laabtna',
    status: 'active',
    createdAt: Date.now(),
    team1: createEmptyTeam(draft.team1Name || 'الفريق الأول', lifelines),
    team2: createEmptyTeam(draft.team2Name || 'الفريق الثاني', lifelines),
    selectedCategoryIds: allCategories,
    team1Categories: draft.team1Categories,
    team2Categories: draft.team2Categories,
    board: buildBoard(allCategories),
    currentTurn: 'team1',
    activeQuestionId: null,
    activeCellKey: null,
    activeLifeline: null,
    answeredCount: 0,
  }
}

const defaultDraft: SetupDraft = {
  gameModeId: 'laabtna',
  team1Name: '',
  team2Name: '',
  team1Lifelines: [...TEAM_LIFELINES],
  team2Lifelines: [...TEAM_LIFELINES],
  team1Categories: [],
  team2Categories: [],
}

interface GameStore {
  draft: SetupDraft
  activeGameId: string | null
  savedGames: GameState[]

  updateDraft: (partial: Partial<SetupDraft>) => void
  resetDraft: () => void
  toggleCategory: (team: 'team1' | 'team2', categoryId: string) => void
  pickRandomCategoriesForBoth: () => void
  canStartGame: () => boolean
  startGame: () => string | null
  getActiveGame: () => GameState | null
  getGame: (id: string) => GameState | undefined
  resumeGame: (id: string) => void
  deleteGame: (id: string) => void
  selectCell: (categoryId: string, points: number, side: BoardSide) => void
  activateLifeline: (team: 'team1' | 'team2', lifelineId: LifelineId) => void
  submitAnswer: (winner: 'team1' | 'team2' | null) => void
  endQuestion: () => void
  dismissQuestion: () => void
  adjustScore: (team: 'team1' | 'team2', delta: number) => void
  endGameEarly: () => void
  updateGame: (game: GameState) => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      draft: { ...defaultDraft },
      activeGameId: null,
      savedGames: [],

      updateDraft: (partial) =>
        set((s) => ({ draft: { ...s.draft, ...partial } })),

      resetDraft: () => set({ draft: { ...defaultDraft } }),

      toggleCategory: (team, categoryId) => {
        const key = team === 'team1' ? 'team1Categories' : 'team2Categories'
        const otherKey = team === 'team1' ? 'team2Categories' : 'team1Categories'
        set((s) => {
          const current = s.draft[key]
          const other = s.draft[otherKey]
          if (current.includes(categoryId)) {
            return { draft: { ...s.draft, [key]: current.filter((id) => id !== categoryId) } }
          }
          if (current.length >= 3) return s
          if (other.includes(categoryId)) return s
          if (!isCategoryEnabled(categoryId)) return s
          return { draft: { ...s.draft, [key]: [...current, categoryId] } }
        })
      },

      pickRandomCategoriesForBoth: () => {
        const picked = pickRandomCategories(6)
        set({
          draft: {
            ...get().draft,
            team1Categories: picked.slice(0, 3),
            team2Categories: picked.slice(3, 6),
          },
        })
      },

      canStartGame: () => {
        const d = sanitizeDraftCategories(get().draft)
        return (
          d.team1Categories.length === 3 &&
          d.team2Categories.length === 3 &&
          d.team1Name.trim().length > 0 &&
          d.team2Name.trim().length > 0
        )
      },

      startGame: () => {
        const draft = sanitizeDraftCategories(get().draft)
        if (
          draft.team1Categories.length !== 3 ||
          draft.team2Categories.length !== 3 ||
          draft.team1Name.trim().length === 0 ||
          draft.team2Name.trim().length === 0
        ) {
          return null
        }
        const game = createGameFromDraft(draft)
        set((s) => ({
          savedGames: [game, ...s.savedGames],
          activeGameId: game.id,
          draft: { ...defaultDraft },
        }))
        return game.id
      },

      getActiveGame: () => {
        const { activeGameId, savedGames } = get()
        if (!activeGameId) return null
        return savedGames.find((g) => g.id === activeGameId) ?? null
      },

      getGame: (id) => get().savedGames.find((g) => g.id === id),

      resumeGame: (id) => set({ activeGameId: id }),

      deleteGame: (id) =>
        set((s) => ({
          savedGames: s.savedGames.filter((g) => g.id !== id),
          activeGameId: s.activeGameId === id ? null : s.activeGameId,
        })),

      updateGame: (game) =>
        set((s) => ({
          savedGames: s.savedGames.map((g) => (g.id === game.id ? game : g)),
        })),

      selectCell: (categoryId, points, side) => {
        const game = get().getActiveGame()
        if (!game || game.status !== 'active') return
        const key = cellKey(categoryId, points, side)
        const cell = game.board[key]
        if (!cell || cell.answered) return

        const pendingBefore =
          game.activeLifeline &&
          game.activeLifeline.team === game.currentTurn &&
          getLifeline(game.activeLifeline.id).timing === 'before'
            ? game.activeLifeline
            : null

        get().updateGame({
          ...game,
          activeQuestionId: cell.questionId,
          activeCellKey: key,
          activeLifeline: pendingBefore,
        })
      },

      activateLifeline: (team, lifelineId) => {
        const game = get().getActiveGame()
        if (!game || game.status !== 'active') return
        if (game.currentTurn !== team) return
        if (game.lifelinesBlocked === team) return

        const lifeline = getLifeline(lifelineId)
        const teamData = game[team]
        if (!teamData.lifelines.includes(lifelineId)) return
        if (teamData.usedLifelines.includes(lifelineId)) return

        if (lifeline.timing === 'before') {
          if (game.activeQuestionId) return
          if (game.activeLifeline) return
        } else if (!game.activeQuestionId) {
          return
        }

        const used = [...teamData.usedLifelines, lifelineId]
        const updatedTeam = { ...teamData, usedLifelines: used }

        const activeLifeline: GameState['activeLifeline'] = {
          id: lifelineId,
          team,
          callFriendSeconds: lifelineId === 'call-friend' ? 60 : undefined,
          searchSeconds: lifelineId === 'search' ? 15 : undefined,
          pitActive: lifelineId === 'the-pit',
          blockActive: lifelineId === 'block',
          doublePointsActive: lifelineId === 'double-points',
          rouletteBonus: lifelineId === 'roulette' ? Math.random() > 0.5 : undefined,
        }

        const lifelinesBlocked =
          lifelineId === 'block' ? otherTeamFrom(team) : game.lifelinesBlocked

        get().updateGame({
          ...game,
          [team]: updatedTeam,
          activeLifeline,
          lifelinesBlocked,
        })
      },

      submitAnswer: (winner) => {
        const game = get().getActiveGame()
        if (!game || !game.activeQuestionId) return

        const q = getQuestion(game.activeQuestionId)
        if (!q) return

        let team1 = { ...game.team1 }
        let team2 = { ...game.team2 }
        const lifeline = game.activeLifeline
        const lifelineApplies = Boolean(winner && lifeline?.team === winner)

        let points: number = q.points
        if (lifelineApplies && lifeline?.doublePointsActive) points *= 2
        if (lifelineApplies && lifeline?.rouletteBonus === true) points = Math.floor(points * 1.5)
        if (lifelineApplies && lifeline?.rouletteBonus === false) points = Math.floor(points * 0.5)

        if (winner) {
          if (lifelineApplies && lifeline?.pitActive) {
            const other = winner === 'team1' ? 'team2' : 'team1'
            const otherData = other === 'team1' ? team1 : team2
            const updated = { ...otherData, score: Math.max(0, otherData.score - q.points) }
            if (other === 'team1') team1 = updated
            else team2 = updated
          }

          if (winner === 'team1') team1 = { ...team1, score: team1.score + points }
          else team2 = { ...team2, score: team2.score + points }
        }

        const key = game.activeCellKey
        if (!key) return

        const board = {
          ...game.board,
          [key]: {
            ...game.board[key],
            answered: true,
            answeredBy: winner ?? undefined,
            wasCorrect: winner !== null,
          },
        }

        const answeredCount = game.answeredCount + 1
        const status = answeredCount >= TOTAL_QUESTIONS ? 'finished' : game.status

        get().updateGame({
          ...game,
          team1,
          team2,
          board,
          answeredCount,
          status,
          activeLifeline: null,
          lifelinesBlocked: undefined,
        })
      },

      endQuestion: () => {
        const game = get().getActiveGame()
        if (!game) return

        const nextTurn: 'team1' | 'team2' =
          game.currentTurn === 'team1' ? 'team2' : 'team1'

        get().updateGame({
          ...game,
          activeQuestionId: null,
          activeCellKey: null,
          activeLifeline: null,
          currentTurn: game.status === 'finished' ? game.currentTurn : nextTurn,
          lifelinesBlocked: undefined,
        })
      },

      dismissQuestion: () => {
        const game = get().getActiveGame()
        if (!game) return

        let team1 = game.team1
        let team2 = game.team2
        const lifeline = game.activeLifeline

        if (lifeline) {
          const teamData = game[lifeline.team]
          const used = teamData.usedLifelines.filter((id) => id !== lifeline.id)
          const restored = { ...teamData, usedLifelines: used }
          if (lifeline.team === 'team1') team1 = restored
          else team2 = restored
        }

        get().updateGame({
          ...game,
          team1,
          team2,
          activeQuestionId: null,
          activeCellKey: null,
          activeLifeline: null,
          lifelinesBlocked: undefined,
        })
      },

      adjustScore: (team, delta) => {
        const game = get().getActiveGame()
        if (!game) return
        const t = game[team]
        get().updateGame({
          ...game,
          [team]: { ...t, score: Math.max(0, t.score + delta) },
        })
      },

      endGameEarly: () => {
        const game = get().getActiveGame()
        if (!game) return
        get().updateGame({
          ...game,
          status: 'finished',
          activeQuestionId: null,
          activeCellKey: null,
          activeLifeline: null,
        })
      },
    }),
    { name: STORAGE_KEY }
  )
)

export { ACTIVE_CATEGORIES as CATEGORIES }

import { create } from 'zustand'
import {
  pickAuctionRounds,
  ROUND_TIMER_SEC,
  SQUAD_TEMPLATE,
  STARTING_BUDGET,
} from '../data/auctionPlayers'
import { calcTeamStats, minAllowedBid, otherPlayer } from '../lib/auctionUtils'
import type {
  AuctionGameState,
  LobbyDraft,
  PlayerId,
  SquadSlot,
} from '../types/hiddenPlayer'

function emptySquad(): SquadSlot[] {
  return SQUAD_TEMPLATE.map(s => ({
    key: s.key,
    position: s.position,
    label: s.label,
    player: null,
    wasHidden: false,
  }))
}

function createLobbyState(draft: LobbyDraft): AuctionGameState {
  const rounds = pickAuctionRounds()
  const budget = draft.startingBudget > 0 ? draft.startingBudget : STARTING_BUDGET
  return {
    id: crypto.randomUUID(),
    phase: 'auction',
    mode: draft.mode,
    p1: {
      name: draft.p1Name || 'اللاعب 1',
      color: draft.p1Color,
      budget,
      ready: true,
    },
    p2: {
      name: draft.p2Name || 'اللاعب 2',
      color: draft.p2Color,
      budget,
      ready: true,
    },
    rounds,
    currentRound: 0,
    currentBid: 0,
    openingBid: 0,
    highBidder: null,
    activeBidder: 'p1',
    timerSec: ROUND_TIMER_SEC,
    bidHistory: [],
    squad1: emptySquad(),
    squad2: emptySquad(),
    reveal: null,
    predictedWinner: null,
    createdAt: Date.now(),
  }
}

interface AuctionStore {
  game: AuctionGameState | null
  startFromLobby: (draft: LobbyDraft) => void
  placeBid: (playerId: PlayerId, amount: number) => { ok: boolean; message?: string }
  raiseBid: (playerId: PlayerId) => { ok: boolean; message?: string }
  passBid: (playerId: PlayerId) => void
  tickTimer: () => void
  dismissReveal: () => void
  resetGame: () => void
}

function assignToSquad(
  squad: SquadSlot[],
  slotKey: string,
  footballer: SquadSlot['player'],
  wasHidden: boolean,
): SquadSlot[] {
  return squad.map(s =>
    s.key === slotKey ? { ...s, player: footballer, wasHidden } : s,
  )
}

function resolveRound(game: AuctionGameState): AuctionGameState {
  const round = game.rounds[game.currentRound]
  const winner = game.highBidder ?? 'p1'
  const loser = otherPlayer(winner)
  const amount = game.highBidder ? game.currentBid : 0

  const actualP1Budget = winner === 'p1' ? game.p1.budget - amount : game.p1.budget
  const actualP2Budget = winner === 'p2' ? game.p2.budget - amount : game.p2.budget

  const fixedSquad1 = winner === 'p1'
    ? assignToSquad(game.squad1, round.slotKey, round.visible, false)
    : assignToSquad(game.squad1, round.slotKey, round.hidden, true)

  const fixedSquad2 = winner === 'p2'
    ? assignToSquad(game.squad2, round.slotKey, round.visible, false)
    : assignToSquad(game.squad2, round.slotKey, round.hidden, true)

  const reveal = {
    winner,
    loser,
    visible: round.visible,
    hidden: round.hidden,
    amount,
  }

  const nextRound = game.currentRound + 1
  const isDone = nextRound >= game.rounds.length

  if (isDone) {
    const s1 = calcTeamStats(fixedSquad1)
    const s2 = calcTeamStats(fixedSquad2)
    const predictedWinner: PlayerId =
      (s1?.power ?? 0) >= (s2?.power ?? 0) ? 'p1' : 'p2'

    return {
      ...game,
      p1: { ...game.p1, budget: actualP1Budget },
      p2: { ...game.p2, budget: actualP2Budget },
      squad1: fixedSquad1,
      squad2: fixedSquad2,
      reveal,
      phase: 'reveal',
      currentRound: nextRound,
      predictedWinner,
    }
  }

  return {
    ...game,
    p1: { ...game.p1, budget: actualP1Budget },
    p2: { ...game.p2, budget: actualP2Budget },
    squad1: fixedSquad1,
    squad2: fixedSquad2,
    reveal,
    phase: 'reveal',
    currentRound: nextRound,
    currentBid: 0,
    openingBid: 0,
    highBidder: null,
    activeBidder: loser,
    timerSec: ROUND_TIMER_SEC,
    bidHistory: [],
  }
}

export const useAuctionStore = create<AuctionStore>()((set, get) => ({
  game: null,

  startFromLobby: (draft) => set({ game: createLobbyState(draft) }),

  placeBid: (playerId, amount) => {
    const { game } = get()
    if (!game || game.phase !== 'auction') return { ok: false, message: 'لا يوجد مزاد نشط' }
    if (playerId !== game.activeBidder) return { ok: false, message: 'ليس دورك' }

    const budget = playerId === 'p1' ? game.p1.budget : game.p2.budget
    const minBid = minAllowedBid(game.currentBid)

    if (!Number.isInteger(amount) || amount < 1) {
      return { ok: false, message: 'أدخل مبلغاً صحيحاً' }
    }
    if (amount < minBid) return { ok: false, message: `يجب أن تكون المزايدة ${minBid}M أو أكثر` }
    if (amount > budget) return { ok: false, message: 'رصيد غير كافٍ' }

    set({
      game: {
        ...game,
        currentBid: amount,
        highBidder: playerId,
        activeBidder: otherPlayer(playerId),
        timerSec: ROUND_TIMER_SEC,
        bidHistory: [
          ...game.bidHistory,
          { round: game.currentRound, playerId, amount, action: 'bid' },
        ],
      },
    })
    return { ok: true }
  },

  raiseBid: (playerId) => {
    const { game } = get()
    if (!game) return { ok: false }
    return get().placeBid(playerId, minAllowedBid(game.currentBid))
  },

  passBid: (playerId) => {
    const { game } = get()
    if (!game || game.phase !== 'auction') return
    if (playerId !== game.activeBidder) return

    if (game.highBidder === null) {
      set({
        game: {
          ...game,
          activeBidder: otherPlayer(playerId),
          timerSec: ROUND_TIMER_SEC,
          bidHistory: [
            ...game.bidHistory,
            { round: game.currentRound, playerId, amount: 0, action: 'pass' },
          ],
        },
      })
      return
    }

    const resolved = resolveRound({
      ...game,
      bidHistory: [
        ...game.bidHistory,
        { round: game.currentRound, playerId, amount: game.currentBid, action: 'pass' },
      ],
    })

    if (resolved.currentRound >= resolved.rounds.length && resolved.reveal) {
      const s1 = calcTeamStats(resolved.squad1)
      const s2 = calcTeamStats(resolved.squad2)
      const winner: PlayerId = (s1?.power ?? 0) >= (s2?.power ?? 0) ? 'p1' : 'p2'
      set({ game: { ...resolved, predictedWinner: winner } })
    } else {
      set({ game: resolved })
    }
  },

  tickTimer: () => {
    const { game } = get()
    if (!game || game.phase !== 'auction') return

    if (game.timerSec <= 1) {
      if (game.highBidder !== null) {
        get().passBid(game.activeBidder)
      } else {
        set({
          game: {
            ...game,
            activeBidder: otherPlayer(game.activeBidder),
            timerSec: ROUND_TIMER_SEC,
          },
        })
      }
      return
    }

    set({ game: { ...game, timerSec: game.timerSec - 1 } })
  },

  dismissReveal: () => {
    const { game } = get()
    if (!game || !game.reveal) return

    if (game.currentRound >= game.rounds.length) {
      const s1 = calcTeamStats(game.squad1)
      const s2 = calcTeamStats(game.squad2)
      const winner: PlayerId = (s1?.power ?? 0) >= (s2?.power ?? 0) ? 'p1' : 'p2'
      set({
        game: { ...game, phase: 'results', reveal: null, predictedWinner: winner },
      })
      return
    }

    set({
      game: {
        ...game,
        phase: 'auction',
        reveal: null,
      },
    })
  },

  resetGame: () => set({ game: null }),
}))

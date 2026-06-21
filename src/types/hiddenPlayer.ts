export type PlayerId = 'p1' | 'p2'
export type Position = 'GK' | 'DEF' | 'MID' | 'ST'
export type AuctionPhase = 'lobby' | 'auction' | 'reveal' | 'results'
export type GameMode = 'casual' | 'ranked'

export interface Footballer {
  id: string
  name: string
  position: Position
  futPosition: string
  club: string
  nation: string
  overall: number
  attack: number
  midfield: number
  defense: number
  cardImageUrl: string
  futggUrl: string
  rarityName?: string
}

export interface AuctionPair {
  roundLabel: string
  position: Position
  slotKey: string
  visible: Footballer
  hidden: Footballer
}

export interface SquadSlot {
  key: string
  position: Position
  label: string
  player: Footballer | null
  wasHidden: boolean
}

export interface PlayerProfile {
  name: string
  color: string
  budget: number
  ready: boolean
}

export interface BidRecord {
  round: number
  playerId: PlayerId
  amount: number
  action: 'bid' | 'pass'
}

export interface RevealData {
  winner: PlayerId
  loser: PlayerId
  visible: Footballer
  hidden: Footballer
  amount: number
}

export interface TeamStats {
  overall: number
  attack: number
  midfield: number
  defense: number
  power: number
}

export interface AuctionGameState {
  id: string
  phase: AuctionPhase
  mode: GameMode
  p1: PlayerProfile
  p2: PlayerProfile
  rounds: AuctionPair[]
  currentRound: number
  currentBid: number
  openingBid: number
  highBidder: PlayerId | null
  activeBidder: PlayerId
  bidHistory: BidRecord[]
  squad1: SquadSlot[]
  squad2: SquadSlot[]
  reveal: RevealData | null
  predictedWinner: PlayerId | null
  createdAt: number
}

export interface LobbyDraft {
  mode: GameMode
  p1Name: string
  p2Name: string
  p1Color: string
  p2Color: string
  startingBudget: number
}

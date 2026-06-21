import type { Footballer, SquadSlot, TeamStats } from '../types/hiddenPlayer'

export function calcTeamStats(slots: SquadSlot[]): TeamStats | null {
  const players = slots.map(s => s.player).filter((p): p is Footballer => !!p)
  if (players.length === 0) {
    return { overall: 0, attack: 0, midfield: 0, defense: 0, power: 0 }
  }

  const overall = Math.round(players.reduce((s, p) => s + p.overall, 0) / players.length)
  const attack = Math.round(players.reduce((s, p) => s + p.attack, 0) / players.length)
  const midfield = Math.round(players.reduce((s, p) => s + p.midfield, 0) / players.length)
  const defense = Math.round(players.reduce((s, p) => s + p.defense, 0) / players.length)
  const power = Math.round(overall * 0.45 + attack * 0.2 + midfield * 0.18 + defense * 0.17)

  return { overall, attack, midfield, defense, power }
}

export function strongestPlayer(slots: SquadSlot[]): Footballer | null {
  const players = slots.map(s => s.player).filter((p): p is Footballer => !!p)
  if (!players.length) return null
  return players.reduce((best, p) => (p.overall > best.overall ? p : best))
}

export function otherPlayer(id: 'p1' | 'p2'): 'p1' | 'p2' {
  return id === 'p1' ? 'p2' : 'p1'
}

/** أقل مزايدة مسموحة: 1M عند البداية، أو المزايدة الحالية + 1 */
export function minAllowedBid(currentBid: number): number {
  return currentBid === 0 ? 1 : currentBid + 1
}

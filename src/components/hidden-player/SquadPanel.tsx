import type { CSSProperties } from 'react'
import PlayerCard from './PlayerCard'
import type { PlayerProfile, SquadSlot } from '../../types/hiddenPlayer'

interface SquadPanelProps {
  profile: PlayerProfile
  slots: SquadSlot[]
  side: 'left' | 'right'
  active?: boolean
}

export default function SquadPanel({ profile, slots, side, active }: SquadPanelProps) {
  return (
    <div
      className={`hp-squad hp-squad--${side} ${active ? 'hp-squad--active' : ''}`}
      style={{ '--team-color': profile.color } as CSSProperties}
    >
      <header className="hp-squad-header">
        <span className="hp-squad-dot" style={{ background: profile.color }} />
        <div>
          <h3>{profile.name}</h3>
          <p>{profile.budget}M متبقي</p>
        </div>
      </header>
      <ul className="hp-squad-list">
        {slots.map(slot => (
          <li key={slot.key} className={`hp-squad-slot ${slot.player ? 'filled' : ''} ${slot.wasHidden ? 'hidden-pick' : ''}`}>
            <span className="hp-slot-label">{slot.label}</span>
            {slot.player ? (
              <div className="hp-slot-player">
                <PlayerCard footballer={slot.player} variant="compact" />
                <span className="hp-slot-ovr">{slot.player.overall}</span>
                {slot.wasHidden && <span className="hp-slot-tag">خفي</span>}
              </div>
            ) : (
              <span className="hp-slot-empty">—</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

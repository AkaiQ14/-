import { Link } from 'react-router-dom'
import type { GameMode } from '../types/gameMode'

interface GameModeCardProps {
  mode: GameMode
  compact?: boolean
}

export default function GameModeCard({ mode, compact = false }: GameModeCardProps) {
  return (
    <article
      className={`game-mode-card ${mode.available ? 'game-mode-card--available' : 'game-mode-card--soon'} ${compact ? 'game-mode-card--compact' : ''}`}
    >
      <div className="game-mode-card-top">
        {mode.image ? (
          <img
            src={mode.image}
            alt=""
            className="game-mode-icon game-mode-icon-img"
            aria-hidden="true"
          />
        ) : (
          <span className="game-mode-icon" aria-hidden="true">{mode.icon}</span>
        )}
        {!mode.available && mode.comingSoonLabel && (
          <span className="game-mode-badge">{mode.comingSoonLabel}</span>
        )}
        {mode.available && (
          <span className="game-mode-badge game-mode-badge--live">متاحة</span>
        )}
      </div>

      <span className="game-mode-section">{mode.sectionLabel}</span>
      <h2 className="game-mode-name">{mode.name}</h2>
      <p className="game-mode-desc">{mode.description}</p>

      {mode.highlights && mode.highlights.length > 0 && (
        <ul className="game-mode-highlights">
          {mode.highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      {mode.available && mode.setupPath ? (
        <Link to={mode.setupPath} className="btn btn-primary btn-block btn-shimmer">
          ▶ ابدأ {mode.name}
        </Link>
      ) : (
        <Link to="/games/letter-cell" className="btn btn-secondary btn-block">
          عرض اللعبة
        </Link>
      )}
    </article>
  )
}

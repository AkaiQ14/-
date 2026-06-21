import type { Footballer } from '../../types/hiddenPlayer'

interface PlayerCardProps {
  footballer: Footballer
  variant?: 'visible' | 'hidden' | 'compact'
  highlight?: boolean
}

export default function PlayerCard({ footballer, variant = 'visible', highlight }: PlayerCardProps) {
  if (variant === 'compact') {
    return (
      <div className={`hp-fut-card hp-fut-card--compact ${highlight ? 'hp-fut-card--highlight' : ''}`}>
        <img src={footballer.cardImageUrl} alt={footballer.name} loading="lazy" />
        <span className="hp-fut-pos">{footballer.futPosition}</span>
      </div>
    )
  }

  return (
    <div className={`hp-fut-card hp-fut-card--${variant} ${highlight ? 'hp-fut-card--highlight' : ''}`}>
      <a
        href={footballer.futggUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hp-fut-card-link"
        title={`${footballer.name} على FUT.GG`}
      >
        <img src={footballer.cardImageUrl} alt={footballer.name} loading="lazy" />
      </a>
      <div className="hp-fut-card-info">
        <span className="hp-fut-pos">{footballer.futPosition}</span>
        <strong>{footballer.overall}</strong>
        {footballer.nation && <span>{footballer.nation}</span>}
        {footballer.club && <span>{footballer.club}</span>}
      </div>
    </div>
  )
}

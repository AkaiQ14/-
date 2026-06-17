import type { Lifeline } from '../types/game'

interface LifelineIconProps {
  lifeline: Pick<Lifeline, 'icon' | 'image' | 'name'>
  className?: string
}

export default function LifelineIcon({ lifeline, className }: LifelineIconProps) {
  if (lifeline.image) {
    return (
      <img
        src={lifeline.image}
        alt={lifeline.name}
        className={className ? `${className} lifeline-icon-img` : 'lifeline-icon-img'}
      />
    )
  }

  return <span className={className}>{lifeline.icon}</span>
}

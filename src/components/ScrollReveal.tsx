import type { ReactNode, CSSProperties } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'

interface ScrollRevealProps {
  children: ReactNode
  delay?: number
  className?: string
  style?: CSSProperties
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale'
}

export default function ScrollReveal({
  children,
  delay = 0,
  className = '',
  style,
  direction = 'up',
}: ScrollRevealProps) {
  const { ref, visible } = useScrollReveal()

  return (
    <div
      ref={ref}
      className={`reveal reveal-${direction} ${visible ? 'revealed' : ''} ${className}`}
      style={{ ...style, transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

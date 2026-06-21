import PlayerCard from './PlayerCard'
import type { PlayerProfile, RevealData } from '../../types/hiddenPlayer'

interface RevealOverlayProps {
  reveal: RevealData
  p1: PlayerProfile
  p2: PlayerProfile
  onContinue: () => void
  isFinal?: boolean
}

export default function RevealOverlay({ reveal, p1, p2, onContinue, isFinal }: RevealOverlayProps) {
  const winnerName = reveal.winner === 'p1' ? p1.name : p2.name
  const loserName = reveal.loser === 'p1' ? p1.name : p2.name

  return (
    <div className="hp-reveal-overlay">
      <div className="hp-reveal-modal hp-reveal-animate">
        <span className="hp-reveal-tag">🎭 اللاعب الخفي</span>
        <h2>انتهت الجولة!</h2>
        <p className="hp-reveal-summary">
          <strong>{winnerName}</strong> فاز بالبطاقة الظاهرة مقابل {reveal.amount}M
        </p>

        <div className="hp-reveal-cards">
          <div className="hp-reveal-col">
            <span className="hp-reveal-label win">فائز — ظاهر</span>
            <PlayerCard footballer={reveal.visible} variant="visible" highlight />
          </div>
          <div className="hp-reveal-arrow">→</div>
          <div className="hp-reveal-col">
            <span className="hp-reveal-label hidden">خاسر — بديل مخفي</span>
            <PlayerCard footballer={reveal.hidden} variant="hidden" highlight />
          </div>
        </div>

        <p className="hp-reveal-loser">
          {loserName} يحصل تلقائياً على البطاقة المخفية
        </p>

        <button type="button" className="btn btn-primary btn-lg" onClick={onContinue}>
          {isFinal ? 'عرض النتائج' : 'الجولة التالية'}
        </button>
      </div>
    </div>
  )
}

import type { CSSProperties } from 'react'
import { calcTeamStats, strongestPlayer } from '../../lib/auctionUtils'
import type { PlayerId, PlayerProfile, SquadSlot } from '../../types/hiddenPlayer'
import { enNum } from '../../lib/formatNumber'

interface TeamComparisonProps {
  squad1: SquadSlot[]
  squad2: SquadSlot[]
  p1: PlayerProfile
  p2: PlayerProfile
  predictedWinner: PlayerId | null
  onPlayAgain: () => void
  onExit: () => void
}

export default function TeamComparison({
  squad1,
  squad2,
  p1,
  p2,
  predictedWinner,
  onPlayAgain,
  onExit,
}: TeamComparisonProps) {
  const s1 = calcTeamStats(squad1)!
  const s2 = calcTeamStats(squad2)!
  const best1 = strongestPlayer(squad1)
  const best2 = strongestPlayer(squad2)
  const winnerName = predictedWinner === 'p1' ? p1.name : p2.name

  const stats = [
    { key: 'overall', label: 'التقييم العام' },
    { key: 'attack', label: 'الهجوم' },
    { key: 'midfield', label: 'الوسط' },
    { key: 'defense', label: 'الدفاع' },
    { key: 'power', label: 'قوة الفريق %' },
  ] as const

  return (
    <div className="hp-results">
      <header className="hp-results-header">
        <span className="hp-reveal-tag">🏆 تحليل الفريق</span>
        <h2>مقارنة الفريقين</h2>
        <p className="hp-results-predict">
          الفائز: <strong>{winnerName}</strong>
        </p>
      </header>

      <div className="hp-results-grid">
        <div className="hp-results-team" style={{ '--team-color': p1.color } as CSSProperties}>
          <h3>{p1.name}</h3>
          {best1 && <p className="hp-best">أقوى بطاقة: {best1.futPosition} {enNum(best1.overall)}</p>}
        </div>
        <div className="hp-results-team" style={{ '--team-color': p2.color } as CSSProperties}>
          <h3>{p2.name}</h3>
          {best2 && <p className="hp-best">أقوى بطاقة: {best2.futPosition} {enNum(best2.overall)}</p>}
        </div>
      </div>

      <div className="hp-chart">
        {stats.map(({ key, label }) => {
          const v1 = s1[key]
          const v2 = s2[key]
          const max = Math.max(v1, v2, 1)
          return (
            <div key={key} className="hp-chart-row">
              <span className="hp-chart-label">{label}</span>
              <div className="hp-chart-bars">
                <div className="hp-bar-wrap">
                  <div className="hp-bar-track">
                    <div className="hp-bar hp-bar--p1" style={{ width: `${(v1 / max) * 100}%` }} />
                  </div>
                  <span>{enNum(v1)}</span>
                </div>
                <div className="hp-bar-wrap">
                  <div className="hp-bar-track">
                    <div className="hp-bar hp-bar--p2" style={{ width: `${(v2 / max) * 100}%` }} />
                  </div>
                  <span>{enNum(v2)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="hp-results-actions btn-group btn-group--center">
        <button type="button" className="btn btn-primary" onClick={onPlayAgain}>
          مزاد جديد
        </button>
        <button type="button" className="btn btn-secondary" onClick={onExit}>
          العودة للألعاب
        </button>
      </div>
    </div>
  )
}

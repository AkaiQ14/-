import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { TOTAL_QUESTIONS } from '../types/game'
import FloatingOrbs from '../components/FloatingOrbs'
import ScrollReveal from '../components/ScrollReveal'
import './mygames.css'

type Filter = 'all' | 'active' | 'finished'

export default function MyGames() {
  const navigate = useNavigate()
  const { savedGames, resumeGame, deleteGame } = useGameStore()
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = savedGames.filter(g => {
    if (filter === 'active') return g.status !== 'finished'
    if (filter === 'finished') return g.status === 'finished'
    return true
  })

  const activeCount = savedGames.filter(g => g.status !== 'finished').length
  const finishedCount = savedGames.filter(g => g.status === 'finished').length

  const handleResume = (id: string) => {
    resumeGame(id)
    navigate('/play')
  }

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString('ar-KW', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  if (savedGames.length === 0) {
    return (
      <div className="page-shell mygames-page site-bg">
        <section className="page-hero page-hero--compact site-section site-section--hero">
          <FloatingOrbs />
          <div className="page-hero-inner page-hero-inner--center anim-fade-up">
            <span className="page-tag">📂 سجل الألعاب</span>
            <h1 className="page-title">ألعابي</h1>
            <p className="page-lead">ألعابك محفوظة تلقائياً — ارجع لأي لعبة في أي وقت</p>
          </div>
        </section>
        <ScrollReveal direction="scale">
          <div className="page-empty">
            <div className="page-empty-icon">🎮</div>
            <h3>ما عندك ألعاب محفوظة</h3>
            <p>ابدأ لعبة جديدة وبتنحفظ هنا تلقائياً</p>
            <div className="page-empty-actions btn-group btn-group--center">
              <Link to="/games" className="btn btn-primary btn-shimmer">إنشاء لعبة جديدة</Link>
              <Link to="/" className="btn btn-secondary">الرئيسية</Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    )
  }

  return (
    <div className="page-shell mygames-page site-bg">
      <section className="page-hero page-hero--compact site-section site-section--hero">
        <FloatingOrbs />
        <div className="page-hero-inner page-hero-inner--center anim-fade-up">
          <span className="page-tag">📂 سجل الألعاب</span>
          <h1 className="page-title">
            <span className="text-gradient">ألعابي</span>
          </h1>
          <p className="page-lead">
            {savedGames.length} لعبة محفوظة — استرجع أي لعبة أو تابع من حيث توقفت
          </p>
        </div>
      </section>

      <section className="page-stats-bar page-chrome">
        <div className="page-stats-inner">
          {[
            { v: String(savedGames.length), l: 'إجمالي الألعاب' },
            { v: String(activeCount), l: 'جارية' },
            { v: String(finishedCount), l: 'منتهية' },
          ].map((s, i) => (
            <div key={s.l} className="page-stat-item">
              {i > 0 && <div className="page-stat-divider" />}
              <span className="page-stat-value">{s.v}</span>
              <span className="page-stat-label">{s.l}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="page-body">
        <ScrollReveal>
          <div className="action-bar">
            <div className="action-bar__start">
              <div className="btn-segment" role="tablist" aria-label="تصفية الألعاب">
                {([
                  ['all', `الكل (${savedGames.length})`],
                  ['active', `جارية (${activeCount})`],
                  ['finished', `منتهية (${finishedCount})`],
                ] as [Filter, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`btn-segment-item ${filter === key ? 'active' : ''}`}
                    onClick={() => setFilter(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="action-bar__end">
              <Link to="/games" className="btn btn-primary btn-shimmer">
                🎮 لعبة جديدة
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {filtered.length === 0 ? (
          <ScrollReveal>
            <div className="page-empty" style={{ margin: '2rem auto' }}>
              <div className="page-empty-icon">🔍</div>
              <h3>لا توجد ألعاب في هذا القسم</h3>
              <p>جرب فلتر آخر أو ابدأ لعبة جديدة</p>
            </div>
          </ScrollReveal>
        ) : (
          <div className="mygames-grid">
            {filtered.map((game, i) => (
              <ScrollReveal key={game.id} delay={i * 60} direction="scale">
                <article className="mygame-card">
                  <div className="mygame-card-top">
                    <div className={`mygame-status ${game.status === 'finished' ? 'finished' : 'active'}`}>
                      {game.status === 'finished' ? '✅' : '🔄'}
                    </div>
                    <div>
                      <div className="mygame-title">
                        {game.team1.name} <span className="mygame-vs">vs</span> {game.team2.name}
                      </div>
                      <div className="mygame-meta">
                        <span className={`mygame-chip ${game.status === 'finished' ? 'finished' : 'active'}`}>
                          {game.status === 'finished' ? 'منتهية' : 'جارية'}
                        </span>
                        <span className="mygame-chip">{game.answeredCount}/{TOTAL_QUESTIONS} سؤال</span>
                        <span className="mygame-chip">{formatDate(game.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mygame-scores">
                    <span>{game.team1.score} نقطة</span>
                    <span style={{ color: 'var(--text-light)' }}>—</span>
                    <span>{game.team2.score} نقطة</span>
                  </div>

                  <div className="mygame-progress">
                    <div
                      className="mygame-progress-fill"
                      style={{ width: `${(game.answeredCount / TOTAL_QUESTIONS) * 100}%` }}
                    />
                  </div>

                  <div className="mygame-actions btn-group">
                    {game.status !== 'finished' ? (
                      <button className="btn btn-primary btn-sm btn-shimmer" onClick={() => handleResume(game.id)}>
                        كمّل اللعب
                      </button>
                    ) : (
                      <button className="btn btn-secondary btn-sm" onClick={() => handleResume(game.id)}>
                        عرض النتيجة
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-danger btn-sm btn-icon"
                      aria-label="حذف اللعبة"
                      onClick={() => { if (confirm('تأكيد حذف اللعبة؟')) deleteGame(game.id) }}
                    >
                      🗑
                    </button>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

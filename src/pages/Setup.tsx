import { useEffect, useState, type CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CATEGORIES, useGameStore } from '../store/gameStore'
import { LIFELINES } from '../types/game'
import FloatingOrbs from '../components/FloatingOrbs'
import LifelineIcon from '../components/LifelineIcon'
import ScrollReveal from '../components/ScrollReveal'
import './setup.css'

const READINESS = [
  { key: 'cat1', label: 'فئات الفريق ١', check: (d: ReturnType<typeof useGameStore.getState>['draft']) => d.team1Categories.length === 3 },
  { key: 'cat2', label: 'فئات الفريق ٢', check: (d: ReturnType<typeof useGameStore.getState>['draft']) => d.team2Categories.length === 3 },
  { key: 'names', label: 'أسماء الفرق', check: (d: ReturnType<typeof useGameStore.getState>['draft']) => d.team1Name.trim().length > 0 && d.team2Name.trim().length > 0 },
] as const

export default function Setup() {
  const navigate = useNavigate()
  const {
    draft, updateDraft, toggleCategory,
    pickRandomCategoriesForBoth, canStartGame, startGame,
  } = useGameStore()

  const [activeTeam, setActiveTeam] = useState<'team1' | 'team2'>('team1')
  const [playerCount, setPlayerCount] = useState(6)
  const [splitResult, setSplitResult] = useState<{ t1: number; t2: number } | null>(null)

  useEffect(() => {
    updateDraft({ gameModeId: 'laabtna' })
  }, [])

  const handleStart = () => {
    const id = startGame()
    if (id) navigate('/play')
  }

  const getCategoryState = (id: string) => {
    if (draft.team1Categories.includes(id)) return 'team1'
    if (draft.team2Categories.includes(id)) return 'team2'
    return null
  }

  const isCategoryDisabled = (id: string) => {
    const state = getCategoryState(id)
    if (state) return false
    const key = activeTeam === 'team1' ? 'team1Categories' : 'team2Categories'
    const other = activeTeam === 'team1' ? 'team2Categories' : 'team1Categories'
    if (draft[other].includes(id)) return true
    if (draft[key].length >= 3) return true
    return false
  }

  const renderLifelines = () => (
    <div className="setup-lifeline-list">
      {LIFELINES.map(l => (
        <div key={l.id} className="setup-lifeline-item setup-lifeline-item--fixed selected">
          <LifelineIcon lifeline={l} className="setup-lifeline-icon" />
          <div className="setup-lifeline-info">
            <h4>{l.name}</h4>
            <p>{l.description}</p>
          </div>
          <span className="setup-lifeline-timing">
            {l.timing === 'before' ? '⚡ قبل' : '💬 بعد'}
          </span>
        </div>
      ))}
    </div>
  )

  return (
    <div className="page-shell setup-page site-bg">
      {/* Hero */}
      <section className="page-hero page-hero--compact site-section site-section--hero">
        <FloatingOrbs />
        <div className="page-hero-inner page-hero-inner--center anim-fade-up">
          <span className="page-tag">🎮 لعبتنا — قسم الألعاب</span>
          <h1 className="page-title">
            <span className="text-gradient">إنشاء لعبة جديدة</span>
          </h1>
          <p className="page-lead">
            ٣ فئات لكل فريق • ٣ وسائل مساعدة ثابتة • ٣٦ سؤال
          </p>
          <p className="setup-back-link-wrap">
            <Link to="/games" className="setup-back-link">← العودة لقسم الألعاب</Link>
          </p>

          <div className="page-step-track">
            {[
              { n: '١', label: 'الفئات', done: draft.team1Categories.length === 3 && draft.team2Categories.length === 3 },
              { n: '٢', label: 'الفرق', done: draft.team1Name.trim() && draft.team2Name.trim() },
              { n: '٣', label: 'التقسيم', done: !!splitResult },
            ].map((step, i, arr) => (
              <span key={step.n} style={{ display: 'contents' }}>
                <div className={`page-step-track-item ${step.done ? 'done' : i === 0 || arr[i - 1]?.done ? 'active' : ''}`}>
                  <span className="page-step-track-num">{step.done ? '✓' : step.n}</span>
                  {step.label}
                </div>
                {i < arr.length - 1 && <span className="page-step-track-arrow">←</span>}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="page-body setup-body">
        {/* Step 1 */}
        <ScrollReveal>
          <div className="page-section">
            <div className="page-section-head">
              <div className="page-section-num">١</div>
              <div className="page-section-info">
                <h2>اختر الفئات</h2>
                <p>٣ فئات لكل فريق — بدون تداخل بين الفريقين</p>
              </div>
            </div>

            <div className="action-bar">
              <div className="action-bar__start">
                <div className="btn-segment" role="tablist" aria-label="اختيار الفريق">
                  <button
                    type="button"
                    className={`btn-segment-item ${activeTeam === 'team1' ? 'active-t1' : ''}`}
                    onClick={() => setActiveTeam('team1')}
                  >
                    الفريق ١ ({draft.team1Categories.length}/٣)
                  </button>
                  <button
                    type="button"
                    className={`btn-segment-item ${activeTeam === 'team2' ? 'active-t2' : ''}`}
                    onClick={() => setActiveTeam('team2')}
                  >
                    الفريق ٢ ({draft.team2Categories.length}/٣)
                  </button>
                </div>
              </div>
              <div className="action-bar__end">
                <button type="button" className="btn btn-secondary btn-sm" onClick={pickRandomCategoriesForBoth}>
                  🎲 عشوائي
                </button>
              </div>
            </div>

            <div className="setup-category-grid">
              {CATEGORIES.map(cat => {
                const state = getCategoryState(cat.id)
                const disabled = isCategoryDisabled(cat.id)
                return (
                  <div
                    key={cat.id}
                    className={`setup-cat-card ${state === 'team1' ? 'selected-t1' : ''} ${state === 'team2' ? 'selected-t2' : ''} ${disabled ? 'disabled' : ''}`}
                    style={{ '--cat-color': cat.color } as CSSProperties}
                    onClick={() => {
                      if (disabled) return
                      if (state) toggleCategory(state, cat.id)
                      else toggleCategory(activeTeam, cat.id)
                    }}
                  >
                    <h3 className="setup-cat-title">{cat.name}</h3>
                    <div className="setup-cat-visual">
                      <img src={cat.image} alt="" className="setup-cat-img" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Step 2 */}
        <ScrollReveal delay={80}>
          <div className="page-section">
            <div className="page-section-head">
              <div className="page-section-num">٢</div>
              <div className="page-section-info">
                <h2>معلومات الفرق</h2>
                <p>اسم كل فريق — وسائل المساعدة ثابتة لجميع الفرق</p>
              </div>
            </div>

            <div className="setup-lifelines-shared">
              <div className="setup-lifeline-header">
                <span className="setup-lifeline-label">وسائل المساعدة (٣ لكل فريق)</span>
              </div>
              {renderLifelines()}
            </div>

            <div className="setup-teams-grid">
              {(['team1', 'team2'] as const).map(team => {
                const isT1 = team === 'team1'
                const nameKey = isT1 ? 'team1Name' : 'team2Name'
                const label = isT1 ? 'الفريق الأول' : 'الفريق الثاني'

                return (
                  <div key={team} className={`setup-team-card ${isT1 ? 't1' : 't2'}`}>
                    <div className="setup-team-card-header">
                      <div className={`setup-team-dot ${isT1 ? 't1' : 't2'}`} />
                      <h3>{label}</h3>
                    </div>
                    <input
                      className="setup-team-input"
                      placeholder={`اسم ${label}`}
                      value={draft[nameKey]}
                      onChange={e => updateDraft({ [nameKey]: e.target.value } as Partial<typeof draft>)}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Step 3 */}
        <ScrollReveal delay={160}>
          <div className="page-section">
            <div className="page-section-head">
              <div className="page-section-num">٣</div>
              <div className="page-section-info">
                <h2>قسّم اللاعبين</h2>
                <p>اختياري — أدخل العدد الكلي للتقسيمة العادلة</p>
              </div>
            </div>
            <div className="setup-splitter">
              <div className="setup-splitter-row">
                <label style={{ fontWeight: 700, color: 'var(--text-body)' }}>عدد اللاعبين</label>
                <input
                  type="number"
                  className="setup-splitter-input"
                  min={2}
                  max={30}
                  value={playerCount}
                  onChange={e => setPlayerCount(Math.max(2, parseInt(e.target.value) || 2))}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSplitResult({
                    t1: Math.ceil(playerCount / 2),
                    t2: playerCount - Math.ceil(playerCount / 2),
                  })}
                >
                  قسّملي
                </button>
              </div>
              {splitResult && (
                <div className="setup-split-result">
                  <p style={{ fontWeight: 700, color: 'var(--text-muted)' }}>التقسيمة المقترحة</p>
                  <div className="setup-split-teams">
                    <div className="setup-split-team t1">
                      {draft.team1Name || 'الفريق ١'}: {splitResult.t1} لاعب
                    </div>
                    <div className="setup-split-team t2">
                      {draft.team2Name || 'الفريق ٢'}: {splitResult.t2} لاعب
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* CTA Footer */}
      <section className="page-cta-footer site-section site-section--cta">
        <div className="cta-bg-orbs" aria-hidden="true">
          <div className="cta-orb" />
          <div className="cta-orb cta-orb-2" />
        </div>
        <div className="page-cta-inner">
          <div className="page-readiness">
            {READINESS.map(item => (
              <div key={item.key} className={`page-readiness-item ${item.check(draft) ? 'done' : ''}`}>
                <span className="page-readiness-dot" />
                {item.check(draft) ? '✓ ' : ''}{item.label}
              </div>
            ))}
          </div>
          <div className="btn-group btn-group--center" style={{ marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-gold btn-lg btn-shimmer"
              disabled={!canStartGame()}
              onClick={handleStart}
            >
              ▶ ابدأ اللعب
            </button>
          </div>
          {!canStartGame() && (
            <p className="setup-hint">أكمل جميع الخطوات أعلاه للبدء</p>
          )}
        </div>
      </section>
    </div>
  )
}

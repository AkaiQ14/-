import { useState, type CSSProperties } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import FloatingOrbs from '../components/FloatingOrbs'
import {
  BUDGET_PRESETS,
  COLOR_OPTIONS,
  STARTING_BUDGET,
} from '../data/auctionPlayers'
import { useAuctionStore } from '../store/auctionStore'
import type { GameMode } from '../types/hiddenPlayer'

export default function HiddenPlayerLobby() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const startFromLobby = useAuctionStore(s => s.startFromLobby)

  const [mode] = useState<GameMode>((params.get('mode') as GameMode) || 'casual')
  const [p1Name, setP1Name] = useState('')
  const [p2Name, setP2Name] = useState('')
  const [p1Color, setP1Color] = useState(COLOR_OPTIONS[0].hex)
  const [p2Color, setP2Color] = useState(COLOR_OPTIONS[1].hex)
  const [startingBudget, setStartingBudget] = useState(STARTING_BUDGET)
  const [customBudget, setCustomBudget] = useState('')
  const [p1Ready, setP1Ready] = useState(false)
  const [p2Ready, setP2Ready] = useState(false)

  const canStart = p1Ready && p2Ready && p1Name.trim() && p2Name.trim() && startingBudget >= 50

  const handleBudgetPreset = (amount: number) => {
    setStartingBudget(amount)
    setCustomBudget('')
  }

  const handleCustomBudget = () => {
    const val = parseInt(customBudget, 10)
    if (!Number.isNaN(val) && val >= 50 && val <= 999) {
      setStartingBudget(val)
    }
  }

  const handleStart = () => {
    startFromLobby({
      mode,
      p1Name: p1Name.trim(),
      p2Name: p2Name.trim(),
      p1Color,
      p2Color,
      startingBudget,
    })
    navigate('/games/hidden-player/play')
  }

  const renderPlayerSetup = (
    side: 'p1' | 'p2',
    name: string,
    setName: (v: string) => void,
    namePlaceholder: string,
    color: string,
    setColor: (v: string) => void,
    ready: boolean,
    setReady: (v: boolean) => void,
  ) => (
    <div className="hp-lobby-card" style={{ '--team-color': color } as CSSProperties}>
      <h3>{side === 'p1' ? 'اللاعب 1' : 'اللاعب 2'}</h3>

      <label className="hp-field">
        الاسم
        <input
          value={name}
          placeholder={namePlaceholder}
          onChange={e => { setName(e.target.value); setReady(false) }}
          maxLength={20}
        />
      </label>

      <div className="hp-picker">
        <span>لون الفريق</span>
        <div className="hp-picker-row">
          {COLOR_OPTIONS.map(c => (
            <button
              key={c.id}
              type="button"
              className={`hp-color ${color === c.hex ? 'selected' : ''}`}
              style={{ background: c.hex }}
              title={c.label}
              onClick={() => { setColor(c.hex); setReady(false) }}
            />
          ))}
        </div>
      </div>

      <div className="hp-lobby-preview">
        <span className="hp-preview-dot" style={{ background: color }} />
        <strong>{name || '—'}</strong>
        <span className={`hp-status ${ready ? 'ready' : ''}`}>
          {ready ? '✓ جاهز' : '○ غير جاهز'}
        </span>
        <span className="hp-connection">● متصل</span>
      </div>

      <button
        type="button"
        className={`btn btn-block ${ready ? 'btn-secondary' : 'btn-primary'}`}
        onClick={() => setReady(!ready)}
      >
        {ready ? 'إلغاء الجاهزية' : 'جاهز'}
      </button>
    </div>
  )

  return (
    <div className="page-shell site-bg hp-shell setup-page">
      <section className="page-hero page-hero--compact site-section site-section--hero">
        <FloatingOrbs />
        <div className="page-hero-inner page-hero-inner--center">
          <h1 className="page-title">إعداد المزاد</h1>
          <p className="page-lead">
            اختر الأسماء وألوان الفريقين وحدّد ميزانية المزاد — ثم اضغط جاهز
          </p>
        </div>
      </section>

      <div className="hp-body">
        <div className="hp-lobby-grid">
          {renderPlayerSetup('p1', p1Name, setP1Name, 'اللاعب 1', p1Color, setP1Color, p1Ready, setP1Ready)}
          <div className="hp-lobby-vs">VS</div>
          {renderPlayerSetup('p2', p2Name, setP2Name, 'اللاعب 2', p2Color, setP2Color, p2Ready, setP2Ready)}
        </div>

        <section className="hp-budget-setup">
          <h3>ميزانية المزاد لكل لاعب</h3>
          <p>المبلغ الحالي: <strong>{startingBudget}M</strong></p>
          <div className="hp-budget-presets">
            {BUDGET_PRESETS.map(amount => (
              <button
                key={amount}
                type="button"
                className={`btn btn-sm ${startingBudget === amount ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleBudgetPreset(amount)}
              >
                {amount}M
              </button>
            ))}
          </div>
          <div className="hp-budget-custom">
            <label className="hp-field">
              مبلغ مخصص (50–999)
              <input
                type="number"
                min={50}
                max={999}
                placeholder="مثال: 300"
                value={customBudget}
                onChange={e => setCustomBudget(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCustomBudget()}
              />
            </label>
            <button type="button" className="btn btn-accent btn-sm" onClick={handleCustomBudget}>
              تطبيق
            </button>
          </div>
        </section>

        <div className="hp-start-wrap">
          <button
            type="button"
            className="btn btn-accent btn-lg btn-shimmer"
            disabled={!canStart}
            onClick={handleStart}
          >
            ▶ بدء المزاد
          </button>
        </div>
      </div>
    </div>
  )
}

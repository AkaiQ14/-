import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { getCategory, getQuestion } from '../data/gameData'
import { getLifeline, cellKey } from '../types/game'
import type { LifelineId } from '../types/game'
import type { BoardSide } from '../types/boardLayout'
import PlayBoard from '../components/PlayBoard'
import LifelineIcon from '../components/LifelineIcon'
import SiteLogo from '../components/SiteLogo'
import { enNum } from '../lib/formatNumber'
import './play.css'

function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${enNum(minutes)}:${String(seconds).padStart(2, '0')}`
}

export default function Play() {
  const navigate = useNavigate()
  const game = useGameStore(s => s.getActiveGame())
  const {
    selectCell,
    activateLifeline,
    submitAnswer,
    endQuestion,
    adjustScore,
    endGameEarly,
  } = useGameStore()

  const [showAnswer, setShowAnswer] = useState(false)
  const [answered, setAnswered] = useState(false)
  const [lifelineCountdown, setLifelineCountdown] = useState(60)
  const [questionElapsed, setQuestionElapsed] = useState(0)
  const [questionTimerPaused, setQuestionTimerPaused] = useState(false)

  const activeQuestion = game?.activeQuestionId ? getQuestion(game.activeQuestionId) : null
  const timerLifeline = game?.activeLifeline?.id

  useEffect(() => {
    if (!timerLifeline || (timerLifeline !== 'call-friend' && timerLifeline !== 'search')) return
    if (showAnswer || answered) return

    const start = timerLifeline === 'search' ? 15 : 60
    setLifelineCountdown(start)

    const interval = setInterval(() => {
      setLifelineCountdown(t => {
        if (t <= 1) { clearInterval(interval); return 0 }
        return t - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timerLifeline, showAnswer, answered])

  useEffect(() => {
    setShowAnswer(false)
    setAnswered(false)
    setLifelineCountdown(60)
    setQuestionElapsed(0)
    setQuestionTimerPaused(false)
  }, [game?.activeQuestionId])

  useEffect(() => {
    if (!activeQuestion || questionTimerPaused || answered) return

    const interval = setInterval(() => {
      setQuestionElapsed(s => s + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [activeQuestion, questionTimerPaused, answered])

  if (!game) {
    return (
      <div className="page-shell play-page">
        <section className="page-hero page-hero--compact">
          <div className="page-hero-inner page-hero-inner--center anim-fade-up">
            <span className="page-tag">🎯 اللعب</span>
            <h1 className="page-title">لا توجد لعبة نشطة</h1>
            <p className="page-lead">ابدأ لعبة جديدة أو استرجع لعبة من ألعابي</p>
          </div>
        </section>
        <div className="page-empty">
          <div className="page-empty-icon">🎯</div>
          <h3>ما في لعبة نشطة</h3>
          <p>اختر لعبة جديدة أو كمّل لعبة محفوظة</p>
          <div className="page-empty-actions">
            <Link to="/games" className="btn btn-primary btn-shimmer">ابدأ اللعب</Link>
            <Link to="/my-games" className="btn btn-secondary btn-hover-lift">ألعابي</Link>
          </div>
        </div>
      </div>
    )
  }

  if (game.status === 'finished' && !game.activeQuestionId) {
    const winner =
      game.team1.score > game.team2.score ? game.team1.name :
      game.team2.score > game.team1.score ? game.team2.name : null

    return (
      <div className="sj-play sj-play--end">
        <div className="sj-end-content">
          <div className="sj-end-trophy">🏆</div>
          <h2>انتهت اللعبة!</h2>
          <p className="sj-end-winner">{winner ? `الفائز: ${winner}` : 'تعادل!'}</p>
          <div className="sj-end-scores">
            <div className={`sj-end-card ${game.team1.score >= game.team2.score && winner ? 'winner' : ''}`}>
              <span className="sj-end-name">{game.team1.name}</span>
              <span className="sj-end-pts">{enNum(game.team1.score)}</span>
            </div>
            <span className="sj-end-vs">vs</span>
            <div className={`sj-end-card ${game.team2.score > game.team1.score ? 'winner' : ''}`}>
              <span className="sj-end-name">{game.team2.name}</span>
              <span className="sj-end-pts">{enNum(game.team2.score)}</span>
            </div>
          </div>
          <div className="sj-end-actions">
            <Link to="/games" className="btn btn-primary btn-shimmer">لعبة جديدة</Link>
            <Link to="/" className="btn btn-secondary btn-hover-lift">الرئيسية</Link>
          </div>
        </div>
      </div>
    )
  }

  const currentTeam = game.currentTurn
  const currentTeamData = game[currentTeam]
  const lifelinesBlocked = game.lifelinesBlocked === currentTeam

  const handleCellClick = (categoryId: string, points: number, side: BoardSide) => {
    if (game.activeQuestionId) return
    const key = cellKey(categoryId, points, side)
    const cell = game.board[key]
    if (!cell || cell.answered) return
    selectCell(categoryId, points, side)
  }

  const handleLifeline = (id: LifelineId) => {
    const lifeline = getLifeline(id)
    if (lifeline.timing === 'before' && game.activeQuestionId) return
    if (lifeline.timing === 'after' && !game.activeQuestionId) return
    activateLifeline(currentTeam, id)
  }

  const handleSubmit = (winner: 'team1' | 'team2' | null) => {
    submitAnswer(winner)
    setAnswered(true)
    setTimeout(() => endQuestion(), 800)
  }

  const availableLifelines = currentTeamData.lifelines.filter(
    id => !currentTeamData.usedLifelines.includes(id)
  )

  const beforeLifelines = currentTeamData.lifelines.filter(
    id => getLifeline(id).timing === 'before'
  )

  const afterLifelines = availableLifelines.filter(
    id => getLifeline(id).timing === 'after'
  )

  return (
    <div className="sj-play">
      {/* Header */}
      <header className="sj-header">
        <div className="sj-header-start">
          <button type="button" className="sj-nav-btn" onClick={() => navigate('/')}>
            <span className="sj-nav-icon">↩</span>
            الخروج
          </button>
          <Link to="/" className="sj-logo site-logo-link">
            <SiteLogo variant="play" />
          </Link>
        </div>

        <div className="sj-header-center">
          <button type="button" className="sj-end-game" onClick={() => endGameEarly()}>
            <span className="sj-toggle" />
            انتهاء اللعبة
          </button>
        </div>

        <div className="sj-header-end">
          <div className="sj-turn-pill">
            دور فريق : {currentTeamData.name}
          </div>
        </div>
      </header>

      {/* Board */}
      <main className="sj-main">
        <PlayBoard game={game} onSelectCell={handleCellClick} />
      </main>

      {/* Footer */}
      <footer className="sj-footer">
        <div className={`sj-team-panel sj-team-panel--t1 ${game.currentTurn === 'team1' ? 'sj-team-panel--active' : ''}`}>
          <div className="sj-team-name">{game.team1.name}</div>
          <div className="sj-score-row">
            <button type="button" className="sj-score-btn" onClick={() => adjustScore('team1', -1)}>−</button>
            <span className="sj-score-value">{enNum(game.team1.score)}</span>
            <button type="button" className="sj-score-btn" onClick={() => adjustScore('team1', 1)}>+</button>
          </div>
        </div>

        <div className="sj-lifelines-panel">
          <span className="sj-lifelines-label">قبل السؤال</span>
          <div className="sj-lifelines-icons">
            {beforeLifelines.map(id => {
              const l = getLifeline(id)
              const used = currentTeamData.usedLifelines.includes(id)
              const pending =
                !game.activeQuestionId &&
                game.activeLifeline?.id === id &&
                game.activeLifeline.team === currentTeam
              return (
                <button
                  key={id}
                  type="button"
                  className={`sj-lifeline-icon ${used ? 'used' : ''} ${pending ? 'active' : ''}`}
                  title={l.name}
                  disabled={used || !!game.activeQuestionId || lifelinesBlocked}
                  onClick={() => handleLifeline(id)}
                >
                  <LifelineIcon lifeline={l} />
                </button>
              )
            })}
          </div>
        </div>

        <div className={`sj-team-panel sj-team-panel--t2 ${game.currentTurn === 'team2' ? 'sj-team-panel--active' : ''}`}>
          <div className="sj-team-name">{game.team2.name}</div>
          <div className="sj-score-row">
            <button type="button" className="sj-score-btn" onClick={() => adjustScore('team2', -1)}>−</button>
            <span className="sj-score-value">{enNum(game.team2.score)}</span>
            <button type="button" className="sj-score-btn" onClick={() => adjustScore('team2', 1)}>+</button>
          </div>
        </div>
      </footer>

      {/* Question modal */}
      {activeQuestion && (
        <div className="sj-modal-overlay">
          <div className="sj-modal">
            <div className="sj-modal-header">
              <span className="sj-modal-cat">
                {getCategory(activeQuestion.categoryId)?.icon}{' '}
                {getCategory(activeQuestion.categoryId)?.name}
              </span>
              <div className="sj-question-timer">
                <span className="sj-question-timer-value">{formatElapsed(questionElapsed)}</span>
                <div className="sj-question-timer-controls">
                  <button
                    type="button"
                    className="sj-question-timer-btn"
                    onClick={() => setQuestionTimerPaused(p => !p)}
                    title={questionTimerPaused ? 'تشغيل' : 'إيقاف'}
                  >
                    {questionTimerPaused ? '▶' : '⏸'}
                  </button>
                  <button
                    type="button"
                    className="sj-question-timer-btn"
                    onClick={() => {
                      setQuestionElapsed(0)
                      setQuestionTimerPaused(false)
                    }}
                    title="إعادة"
                  >
                    ↺
                  </button>
                </div>
              </div>
              <span className="sj-modal-points">{enNum(activeQuestion.points)} نقطة</span>
            </div>

            {game.activeLifeline?.pitActive && (
              <div className="sj-warning pit">
                <LifelineIcon lifeline={getLifeline('the-pit')} /> الحفرة — جاوب صح وانقص نقاط خصمك
              </div>
            )}
            {game.activeLifeline?.doublePointsActive && (
              <div className="sj-warning gold">✖️ مضاعفة النقاط — نقاطك تتضاعف!</div>
            )}
            {game.activeLifeline?.rouletteBonus !== undefined && (
              <div className="sj-warning green">
                🎡 الروليت: {game.activeLifeline.rouletteBonus ? 'حظك حلو!' : 'حظك مو معك'}
              </div>
            )}
            {lifelinesBlocked && (
              <div className="sj-warning red">🚫 بلوك — وسائل مساعدتك محبوسة</div>
            )}

            {!showAnswer ? (
              <>
                <p className="sj-question">{activeQuestion.text}</p>

                {(timerLifeline === 'call-friend' || timerLifeline === 'search') && (
                  <div className="sj-timer">
                    <div className="sj-timer-num">{enNum(lifelineCountdown)}</div>
                    <div className="sj-timer-label">
                      {timerLifeline === 'search' ? 'ثانية للبحث' : 'ثانية للاتصال'}
                    </div>
                  </div>
                )}

                {game.activeLifeline?.id === 'double-answer' && (
                  <div className="sj-warning gold">✌️ إجابتين — عندك فرصتين</div>
                )}

                {!answered && !lifelinesBlocked && afterLifelines.length > 0 && (
                  <>
                    <div className="sj-modal-lifelines">
                      {afterLifelines.map(id => {
                        const l = getLifeline(id)
                        const active = game.activeLifeline?.id === id
                        return (
                          <button
                            key={id}
                            type="button"
                            className={`sj-modal-lifeline ${active ? 'active' : ''}`}
                            disabled={active}
                            onClick={() => handleLifeline(id)}
                          >
                            <LifelineIcon lifeline={l} /> {l.name}
                          </button>
                        )
                      })}
                    </div>
                    <div className="sj-modal-actions">
                      <button type="button" className="btn btn-primary btn-shimmer" onClick={() => setShowAnswer(true)}>
                        اعرض الإجابة
                      </button>
                    </div>
                  </>
                )}

                {!answered && !lifelinesBlocked && afterLifelines.length === 0 && (
                  <div className="sj-modal-actions">
                    <button type="button" className="btn btn-primary btn-shimmer" onClick={() => setShowAnswer(true)}>
                      اعرض الإجابة
                    </button>
                  </div>
                )}

                {!answered && lifelinesBlocked && (
                  <div className="sj-modal-actions">
                    <button type="button" className="btn btn-primary btn-shimmer" onClick={() => setShowAnswer(true)}>
                      اعرض الإجابة
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="sj-question sj-question--small">{activeQuestion.text}</p>
                <div className="sj-answer-box">
                  <div className="sj-answer-label">الإجابة الصحيحة</div>
                  <div className="sj-answer-text">{activeQuestion.answer}</div>
                </div>
                {!answered && (
                  <div className="sj-judge">
                    <p>من جاوب؟</p>
                    <div className="sj-judge-btns">
                      <button
                        type="button"
                        className="sj-btn-team sj-btn-team--t1"
                        onClick={() => handleSubmit('team1')}
                      >
                        {game.team1.name}
                      </button>
                      <button
                        type="button"
                        className="sj-btn-team sj-btn-team--t2"
                        onClick={() => handleSubmit('team2')}
                      >
                        {game.team2.name}
                      </button>
                      <button
                        type="button"
                        className="sj-btn-team sj-btn-team--none"
                        onClick={() => handleSubmit(null)}
                      >
                        لا أحد
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {answered && <div className="sj-submitted">✓ تم تسجيل الإجابة</div>}
          </div>
        </div>
      )}
    </div>
  )
}

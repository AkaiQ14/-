import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BidPanel from '../components/hidden-player/BidPanel'
import PlayerCard from '../components/hidden-player/PlayerCard'
import RevealOverlay from '../components/hidden-player/RevealOverlay'
import SquadPanel from '../components/hidden-player/SquadPanel'
import TeamComparison from '../components/hidden-player/TeamComparison'
import { useAuctionStore } from '../store/auctionStore'
import { enNum } from '../lib/formatNumber'

export default function HiddenPlayerPlay() {
  const navigate = useNavigate()
  const game = useAuctionStore(s => s.game)
  const { passBid, placeBid, dismissReveal, resetGame } = useAuctionStore()

  useEffect(() => {
    if (!game) {
      navigate('/games/hidden-player/lobby', { replace: true })
    }
  }, [game, navigate])

  if (!game) return null

  const roundIndex = Math.min(game.currentRound, game.rounds.length - 1)
  const round = game.rounds[roundIndex]
  const isFinalReveal = game.reveal && game.currentRound >= game.rounds.length
  const showRoundInfo = game.phase === 'auction' || game.phase === 'reveal'

  return (
    <div className="hp-play site-bg">
      <header className="hp-play-header">
        <Link to="/games/hidden-player" className="hp-back-link" onClick={() => resetGame()}>
          ✕ خروج
        </Link>
        <div className="hp-play-title">
          <h1>اللاعب الخفي</h1>
          {showRoundInfo && round && (
            <p>
              الجولة {enNum(Math.min(game.currentRound + 1, game.rounds.length))}/{enNum(game.rounds.length)}
              {' — '}{round.roundLabel}
              {game.phase === 'reveal' && ' — كشف اللاعب الخفي'}
            </p>
          )}
          {game.phase === 'results' && <p>انتهى المزاد — النتائج النهائية</p>}
        </div>
        <span className="hp-mode-badge">{game.mode === 'ranked' ? 'ترتيبي' : 'عادي'}</span>
      </header>

      <div className="hp-play-layout">
        <SquadPanel
          profile={game.p1}
          slots={game.squad1}
          side="left"
          active={game.activeBidder === 'p1' && game.phase === 'auction'}
        />

        <main className="hp-play-center">
          {game.phase === 'auction' && round && (
            <>
              <div className="hp-auction-card-wrap">
                <span className="hp-auction-label">لاعب المزاد</span>
                <PlayerCard footballer={round.visible} variant="visible" highlight />
                <p className="hp-hidden-hint">🎭 يوجد لاعب خفي في نفس المركز...</p>
              </div>
              <BidPanel
                activeBidder={game.activeBidder}
                currentBid={game.currentBid}
                highBidder={game.highBidder}
                p1Budget={game.p1.budget}
                p2Budget={game.p2.budget}
                p1Name={game.p1.name}
                p2Name={game.p2.name}
                bidHistory={game.bidHistory}
                onPass={passBid}
                onBid={placeBid}
              />
            </>
          )}

          {game.phase === 'reveal' && !game.reveal && (
            <p className="hp-hidden-hint">جاري الكشف...</p>
          )}

          {game.phase === 'results' && (
            <TeamComparison
              squad1={game.squad1}
              squad2={game.squad2}
              p1={game.p1}
              p2={game.p2}
              predictedWinner={game.predictedWinner}
              onPlayAgain={() => {
                resetGame()
                navigate('/games/hidden-player/lobby')
              }}
              onExit={() => {
                resetGame()
                navigate('/games')
              }}
            />
          )}
        </main>

        <SquadPanel
          profile={game.p2}
          slots={game.squad2}
          side="right"
          active={game.activeBidder === 'p2' && game.phase === 'auction'}
        />
      </div>

      {game.reveal && game.phase === 'reveal' && (
        <RevealOverlay
          reveal={game.reveal}
          p1={game.p1}
          p2={game.p2}
          isFinal={!!isFinalReveal}
          onContinue={dismissReveal}
        />
      )}
    </div>
  )
}

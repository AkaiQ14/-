import { useEffect, useState } from 'react'
import { minAllowedBid } from '../../lib/auctionUtils'
import { enNum } from '../../lib/formatNumber'
import type { BidRecord, PlayerId } from '../../types/hiddenPlayer'

interface BidPanelProps {
  activeBidder: PlayerId
  currentBid: number
  highBidder: PlayerId | null
  p1Budget: number
  p2Budget: number
  p1Name: string
  p2Name: string
  bidHistory: BidRecord[]
  onPass: (id: PlayerId) => void
  onBid: (id: PlayerId, amount: number) => { ok: boolean; message?: string }
}

export default function BidPanel({
  activeBidder,
  currentBid,
  highBidder,
  p1Budget,
  p2Budget,
  p1Name,
  p2Name,
  bidHistory,
  onPass,
  onBid,
}: BidPanelProps) {
  const [customBid, setCustomBid] = useState('')
  const [error, setError] = useState('')
  const minBid = minAllowedBid(currentBid)
  const activeBudget = activeBidder === 'p1' ? p1Budget : p2Budget
  const activeName = activeBidder === 'p1' ? p1Name : p2Name
  const waitingId: PlayerId = activeBidder === 'p1' ? 'p2' : 'p1'
  const waitingName = waitingId === 'p1' ? p1Name : p2Name
  const waitingBudget = waitingId === 'p1' ? p1Budget : p2Budget

  useEffect(() => {
    setCustomBid(String(minBid))
    setError('')
  }, [activeBidder, minBid])

  const handleAction = (result: { ok: boolean; message?: string }) => {
    if (!result.ok && result.message) setError(result.message)
    else setError('')
  }

  const submitCustomBid = () => {
    const val = parseInt(customBid, 10)
    if (Number.isNaN(val)) {
      setError('أدخل رقماً صحيحاً')
      return
    }
    const result = onBid(activeBidder, val)
    handleAction(result)
    if (result.ok) setCustomBid(String(val))
  }

  const leaderHint = highBidder
    ? `المتصدر: ${highBidder === 'p1' ? p1Name : p2Name} — التالي ${enNum(minBid)}M+`
    : 'أي مبلغ من 1M'

  return (
    <div className="hp-bid-panel">
      <div className="hp-bid-head__amount">
        <span className="hp-bid-label">المزايدة الحالية</span>
        <strong>{highBidder ? `${enNum(currentBid)}M` : '0M'}</strong>
      </div>
      <p className="hp-bid-leader">{leaderHint}</p>

      {error && <p className="hp-bid-error" role="alert">{error}</p>}

      <div className="hp-bid-players">
        <div className="hp-bid-player hp-bid-player--active">
          <span className="hp-bid-player__name">{activeName}</span>
          <span className="hp-bid-player__meta">{enNum(activeBudget)}M · دورك</span>
        </div>
        <div className="hp-bid-player hp-bid-player--wait">
          <span className="hp-bid-player__name">{waitingName}</span>
          <span className="hp-bid-player__meta">{enNum(waitingBudget)}M · ينتظر</span>
        </div>
      </div>

      <div className="hp-bid-toolbar">
        <div className="hp-bid-input-wrap">
          <input
            id="hp-custom-bid-input"
            type="number"
            min={minBid}
            max={activeBudget}
            step={1}
            value={customBid}
            className="en-num-input"
            aria-label={`مبلغ المزايدة من ${enNum(minBid)}M إلى ${enNum(activeBudget)}M`}
            title={`من ${enNum(minBid)}M إلى ${enNum(activeBudget)}M`}
            onChange={e => setCustomBid(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submitCustomBid()}
          />
          <span className="hp-bid-unit">M</span>
        </div>
        <button type="button" className="btn btn-accent btn-sm" onClick={submitCustomBid}>
          قدّم
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => onPass(activeBidder)}>
          انسحاب
        </button>
      </div>

      {bidHistory.length > 0 && (
        <ul className="hp-bid-history" aria-label="آخر العروض">
          {[...bidHistory].reverse().slice(0, 2).map((b, i) => (
            <li key={`${b.round}-${b.playerId}-${b.action}-${i}`}>
              {b.playerId === 'p1' ? p1Name : p2Name}
              {b.action === 'bid' ? ` ${enNum(b.amount)}M` : ' انسحاب'}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
